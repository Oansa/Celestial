import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Thermometer, Calendar, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useGetAllClimateActions, useClimateActionPhoto } from '../hooks/useQueries';
import { ClimateAction, Category } from '../backend';

// Declare Leaflet types for TypeScript
declare global {
  interface Window {
    L: any;
  }
}

interface InteractiveMapProps {
  climateActions: ClimateAction[];
  onPinClick: (action: ClimateAction) => void;
}

function InteractiveMap({ climateActions, onPinClick }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Helper function to convert coordinates with direction to decimal degrees
  const coordinatesToDecimal = (value: number, direction: string) => {
    return direction === 'S' || direction === 'W' ? -value : value;
  };

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    // Initialize map
    const map = window.L.map(mapRef.current, {
      center: [20, 0], // Center on equator
      zoom: 2,
      zoomControl: false, // We'll add custom controls
      attributionControl: true,
    });

    // Add tile layer (OpenStreetMap)
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add markers for climate actions
    climateActions.forEach((action) => {
      // Convert coordinates with direction to decimal degrees for map display
      const lat = coordinatesToDecimal(action.coordinates.latitude, action.coordinates.latitudeDirection);
      const lon = coordinatesToDecimal(action.coordinates.longitude, action.coordinates.longitudeDirection);

      // Create custom icon
      const customIcon = window.L.divIcon({
        className: 'custom-climate-marker',
        html: `
          <div class="relative">
            <div class="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer">
              <div class="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
              <div class="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-primary"></div>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });

      const marker = window.L.marker([lat, lon], {
        icon: customIcon
      }).addTo(mapInstanceRef.current);

      // Add click event
      marker.on('click', () => {
        onPinClick(action);
      });

      // Add hover tooltip
      const getCategoryLabel = (category: Category) => {
        switch (category) {
          case Category.treePlanting: return '🌱 Tree Planting';
          case Category.cleanup: return '🧹 Cleanup';
          case Category.renewableEnergy: return '⚡ Renewable Energy';
          case Category.awarenessEvent: return '📢 Awareness Event';
          default: return category;
        }
      };

      const tooltipContent = `
        <div class="p-2">
          <div class="font-semibold text-sm">${action.description.substring(0, 50)}${action.description.length > 50 ? '...' : ''}</div>
          <div class="text-xs text-gray-600 mt-1">
            ${action.categories.map(cat => getCategoryLabel(cat)).join(', ')}
          </div>
          <div class="text-xs text-gray-500 mt-1">
            📍 ${action.coordinates.areaName}
          </div>
          <div class="text-xs text-gray-500">
            ${action.temperature}°C • Click for details
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -10]
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers if there are any
    if (climateActions.length > 0) {
      const group = new window.L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [climateActions, onPinClick]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleReset = () => {
    if (mapInstanceRef.current) {
      if (climateActions.length > 0) {
        const group = new window.L.featureGroup(markersRef.current);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      } else {
        mapInstanceRef.current.setView([20, 0], 2);
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
      
      {/* Custom map controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleZoomIn}
          className="w-8 h-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleZoomOut}
          className="w-8 h-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleReset}
          className="w-8 h-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
          title="Reset view"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-background/90 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="font-semibold mb-2">Legend</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full border border-white"></div>
          <span>Climate Action</span>
        </div>
      </div>
    </div>
  );
}

function ClimateActionCard({ action, onClose }: { action: ClimateAction; onClose: () => void }) {
  const { data: photoUrl } = useClimateActionPhoto(action.photoPath);

  const getCategoryLabel = (category: Category) => {
    switch (category) {
      case Category.treePlanting: return '🌱 Tree Planting';
      case Category.cleanup: return '🧹 Cleanup';
      case Category.renewableEnergy: return '⚡ Renewable Energy';
      case Category.awarenessEvent: return '📢 Awareness Event';
      default: return category;
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString();
  };

  const formatLocationDisplay = (coordinates: { latitude: number; longitude: number; latitudeDirection: string; longitudeDirection: string; areaName: string }) => {
    // Display the area name prominently, with coordinates as additional detail
    const formattedCoords = `${coordinates.latitude.toFixed(4)}° ${coordinates.latitudeDirection}, ${coordinates.longitude.toFixed(4)}° ${coordinates.longitudeDirection}`;
    return {
      areaName: coordinates.areaName,
      coordinates: formattedCoords
    };
  };

  const locationInfo = formatLocationDisplay(action.coordinates);

  return (
    <Card className="w-80 bg-background/95 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Climate Action</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              {formatDate(action.timestamp)}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {photoUrl && (
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={photoUrl}
              alt="Climate action"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-sm text-foreground">{action.description}</p>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="font-medium">{locationInfo.areaName}</span>
            </div>
            <div className="text-xs text-muted-foreground ml-5">
              {locationInfo.coordinates}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Thermometer className="w-3 h-3" />
            {action.temperature}°C
          </div>
          
          <p className="text-sm text-muted-foreground">
            <strong>Weather:</strong> {action.weatherNotes}
          </p>
          
          {action.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {action.categories.map((category, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {getCategoryLabel(category)}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Shared by <span className="font-medium">{action.userDisplayName}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MapSection() {
  const { data: climateActions = [], isLoading } = useGetAllClimateActions();
  const [selectedAction, setSelectedAction] = useState<ClimateAction | null>(null);

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Loading Climate Actions...</h2>
            <div className="w-full h-96 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Global Climate Action Map
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore climate action activities from around the world. Click on any pin to see details about the environmental initiative.
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            <strong>{climateActions.length}</strong> climate actions documented
          </div>
        </div>

        <div className="relative">
          <div className="w-full h-96 bg-muted rounded-lg overflow-hidden">
            <InteractiveMap 
              climateActions={climateActions} 
              onPinClick={setSelectedAction}
            />
          </div>

          {selectedAction && (
            <div className="absolute top-4 right-4 z-[1001]">
              <ClimateActionCard 
                action={selectedAction} 
                onClose={() => setSelectedAction(null)}
              />
            </div>
          )}
        </div>

        {climateActions.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              No climate actions have been shared yet. Be the first to upload evidence of climate action!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
