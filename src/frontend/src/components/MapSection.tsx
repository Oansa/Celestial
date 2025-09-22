import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Thermometer, Calendar, X, ZoomIn, ZoomOut, RotateCcw, Heart, Sparkles, Globe } from 'lucide-react';
import { useGetAllClimateActions, useClimateActionPhoto } from '../hooks/useQueries';
import { ClimateAction, Category } from '../backend';
import DonationModal from './DonationModal';
import CommentSection from './CommentSection';

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

      // Create enhanced custom icon with nature theme
      const customIcon = window.L.divIcon({
        className: 'custom-climate-marker',
        html: `
          <div class="relative group">
            <div class="w-8 h-8 bg-gradient-to-br from-forest-500 to-ocean-500 rounded-full border-3 border-white shadow-nature-lg flex items-center justify-center transform hover:scale-110 transition-all duration-300 cursor-pointer animate-gentle-bounce group-hover:animate-pulse-glow">
              <div class="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
              <div class="w-0 h-0 border-l-3 border-r-3 border-t-6 border-transparent border-t-forest-500 drop-shadow-sm"></div>
            </div>
            <div class="absolute inset-0 rounded-full bg-forest-400/20 animate-ripple opacity-0 group-hover:opacity-100"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = window.L.marker([lat, lon], {
        icon: customIcon
      }).addTo(mapInstanceRef.current);

      // Add click event
      marker.on('click', () => {
        onPinClick(action);
      });

      // Add enhanced hover tooltip
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
        <div class="p-3 bg-gradient-to-r from-forest-50 to-ocean-50 dark:from-forest-900 dark:to-ocean-900 rounded-lg">
          <div class="font-semibold text-base text-forest-800 dark:text-forest-200 mb-2">${action.description.substring(0, 50)}${action.description.length > 50 ? '...' : ''}</div>
          <div class="text-sm text-ocean-600 dark:text-ocean-400 mb-1 flex items-center gap-1">
            <span class="inline-block w-2 h-2 bg-ocean-500 rounded-full"></span>
            ${getCategoryLabel(action.category)}
          </div>
          <div class="text-sm text-earth-600 dark:text-earth-400 flex items-center gap-1">
            <span class="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
            ${action.temperature}°C • Click for details
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -15],
        className: 'custom-tooltip'
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
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-nature-lg">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Enhanced custom map controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleZoomIn}
          className="w-10 h-10 p-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm hover:bg-forest-50 dark:hover:bg-forest-900/50 border border-forest-200 dark:border-forest-800 shadow-nature hover-lift"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleZoomOut}
          className="w-10 h-10 p-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm hover:bg-forest-50 dark:hover:bg-forest-900/50 border border-forest-200 dark:border-forest-800 shadow-nature hover-lift"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleReset}
          className="w-10 h-10 p-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm hover:bg-forest-50 dark:hover:bg-forest-900/50 border border-forest-200 dark:border-forest-800 shadow-nature hover-lift"
          title="Reset view"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Enhanced map legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-xl p-4 text-sm shadow-nature-lg border border-forest-200 dark:border-forest-800">
        <div className="font-semibold mb-3 flex items-center gap-2 text-forest-700 dark:text-forest-300">
          <Globe className="w-4 h-4" />
          Legend
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-gradient-to-br from-forest-500 to-ocean-500 rounded-full border-2 border-white shadow-sm animate-gentle-bounce"></div>
          <span className="text-muted-foreground">Climate Action</span>
        </div>
      </div>
    </div>
  );
}

function ClimateActionCard({ action, onClose, onDonate }: { action: ClimateAction; onClose: () => void; onDonate: () => void }) {
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

  const getCategoryColor = (category: Category) => {
    switch (category) {
      case Category.treePlanting: return 'bg-forest-100 text-forest-800 dark:bg-forest-900 dark:text-forest-200';
      case Category.cleanup: return 'bg-ocean-100 text-ocean-800 dark:bg-ocean-900 dark:text-ocean-200';
      case Category.renewableEnergy: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case Category.awarenessEvent: return 'bg-earth-100 text-earth-800 dark:bg-earth-900 dark:text-earth-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString();
  };

  const formatLocationWithCoordinates = (coordinates: { latitude: number; longitude: number; latitudeDirection: string; longitudeDirection: string; areaName: string }) => {
    const formattedCoords = `${coordinates.latitude.toFixed(4)}° ${coordinates.latitudeDirection}, ${coordinates.longitude.toFixed(4)}° ${coordinates.longitudeDirection}`;
    return `${coordinates.areaName}, ${formattedCoords}`;
  };

  // Check if donation options are available (Stripe or user wallet)
  const hasDonationOptions = action.walletAddress; // For now, we'll assume Stripe might be available, but the modal will handle the logic

  return (
    <Card className="w-96 card-nature backdrop-blur-md shadow-nature-lg border-2 border-forest-100 dark:border-forest-800 animate-slide-in-right max-h-[80vh] overflow-y-auto">
      <CardHeader className="pb-3 bg-gradient-to-r from-forest-50/50 to-ocean-50/50 dark:from-forest-900/20 dark:to-ocean-900/20">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-forest-500" />
              Climate Action
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              {formatDate(action.timestamp)}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="hover:bg-red-50 dark:hover:bg-red-900/20 hover-scale"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {photoUrl && (
          <div className="aspect-video rounded-lg overflow-hidden bg-muted shadow-nature hover-lift">
            <img
              src={photoUrl}
              alt="Climate action"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
        
        <div className="space-y-3">
          <p className="text-sm text-foreground leading-relaxed">{action.description}</p>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-ocean-500" />
            {formatLocationWithCoordinates(action.coordinates)}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Thermometer className="w-4 h-4 text-orange-500" />
            {action.temperature}°C
          </div>
          
          <p className="text-sm text-muted-foreground italic bg-sky-50/50 dark:bg-sky-900/10 p-2 rounded-md">
            <strong>Weather:</strong> {action.weatherNotes}
          </p>
          
          <div className="flex flex-wrap gap-1">
            <Badge className={`text-xs hover-scale ${getCategoryColor(action.category)}`}>
              {getCategoryLabel(action.category)}
            </Badge>
          </div>
          
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Update from <span className="font-medium text-forest-600 dark:text-forest-400">{action.userDisplayName}</span>
            </p>
          </div>

          {/* Only show donation button if there are donation options available */}
          <div className="pt-2">
            <Button
              onClick={onDonate}
              className="w-full btn-nature shadow-nature hover:shadow-glow hover-lift"
            >
              <Heart className="w-4 h-4 mr-2" />
              Make Donation
            </Button>
          </div>

          {/* Comment Section */}
          <div className="pt-2 border-t border-border">
            <CommentSection submissionId={action.id} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MapSection() {
  const { data: climateActions = [], isLoading } = useGetAllClimateActions();
  const [selectedAction, setSelectedAction] = useState<ClimateAction | null>(null);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [donationAction, setDonationAction] = useState<ClimateAction | null>(null);

  const handleDonate = (action: ClimateAction) => {
    setDonationAction(action);
    setDonationModalOpen(true);
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-sky-50/30 to-forest-50/30 dark:from-sky-950/20 dark:to-forest-950/20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Globe className="w-8 h-8 text-forest-500 animate-spin" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-forest-600 to-ocean-600 bg-clip-text text-transparent">
                Loading Climate Actions...
              </h2>
            </div>
            <div className="w-full h-96 bg-gradient-to-r from-forest-100/50 to-ocean-100/50 dark:from-forest-900/20 dark:to-ocean-900/20 animate-pulse rounded-xl shadow-nature-lg loading-nature" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-sky-50/30 via-forest-50/20 to-ocean-50/30 dark:from-sky-950/20 dark:via-forest-950/10 dark:to-ocean-950/20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-nature-pattern opacity-5" />
      <div className="absolute top-20 right-10 w-24 h-24 bg-forest-200/20 rounded-full animate-float" />
      <div className="absolute bottom-32 left-20 w-16 h-16 bg-ocean-200/20 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
      
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Globe className="w-10 h-10 text-forest-500 animate-gentle-bounce" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-forest-600 via-ocean-600 to-earth-600 bg-clip-text text-transparent">
              Global Climate Action Map
            </h2>
            <Globe className="w-10 h-10 text-ocean-500 animate-gentle-bounce" style={{ animationDelay: '0.5s' }} />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore climate action activities from around the world. Click on any pin to see details about the environmental initiative.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-forest-100 to-ocean-100 dark:from-forest-900/30 dark:to-ocean-900/30 rounded-full border border-forest-200 dark:border-forest-800 shadow-nature">
            <Sparkles className="w-4 h-4 text-forest-500" />
            <span className="font-semibold text-forest-700 dark:text-forest-300">
              {climateActions.length}
            </span>
            <span className="text-muted-foreground">climate actions documented</span>
          </div>
        </div>

        <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-full h-[500px] bg-muted rounded-xl overflow-hidden shadow-nature-lg border-2 border-forest-100 dark:border-forest-800">
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
                onDonate={() => handleDonate(selectedAction)}
              />
            </div>
          )}
        </div>

        {climateActions.length === 0 && (
          <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="p-8 bg-gradient-to-r from-forest-50 to-ocean-50 dark:from-forest-900/20 dark:to-ocean-900/20 rounded-xl border border-forest-200 dark:border-forest-800 shadow-nature">
              <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-gentle-bounce" />
              <p className="text-lg text-muted-foreground mb-2">
                No climate actions have been shared yet.
              </p>
              <p className="text-muted-foreground">
                Be the first to upload evidence of climate action and inspire others!
              </p>
            </div>
          </div>
        )}
      </div>

      {donationAction && (
        <DonationModal
          isOpen={donationModalOpen}
          onClose={() => {
            setDonationModalOpen(false);
            setDonationAction(null);
          }}
          submission={donationAction}
        />
      )}
    </section>
  );
}
