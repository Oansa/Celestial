import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, MapPin, Thermometer, CloudSun, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { useUploadClimateAction, useGeocodeArea } from '../hooks/useQueries';
import { Category, Coordinates } from '../backend';
import { toast } from 'sonner';

interface FormData {
  photo: File | null;
  areaName: string;
  coordinates: Coordinates;
  temperature: number;
  weatherNotes: string;
  description: string;
  categories: Category[];
}

const categoryOptions = [
  { value: Category.treePlanting, label: 'Tree Planting', icon: '🌱' },
  { value: Category.cleanup, label: 'Cleanup', icon: '🧹' },
  { value: Category.renewableEnergy, label: 'Renewable Energy', icon: '⚡' },
  { value: Category.awarenessEvent, label: 'Awareness Event', icon: '📢' },
];

export default function HeroSection() {
  const [formData, setFormData] = useState<FormData>({
    photo: null,
    areaName: '',
    coordinates: { 
      latitude: 0, 
      longitude: 0, 
      latitudeDirection: 'N', 
      longitudeDirection: 'E',
      areaName: ''
    },
    temperature: 20,
    weatherNotes: '',
    description: '',
    categories: [],
  });

  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [geocodeError, setGeocodeError] = useState<string>('');
  const [validatedAreaName, setValidatedAreaName] = useState<string>('');

  const uploadMutation = useUploadClimateAction();
  const geocodeMutation = useGeocodeArea();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setFormData(prev => ({ ...prev, photo: file }));
    } else {
      toast.error('Please select a JPEG or PNG image');
    }
  };

  const handleAreaNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      areaName: value,
      coordinates: {
        ...prev.coordinates,
        areaName: geocodeStatus === 'success' ? validatedAreaName : value
      }
    }));
    
    // Reset geocode status when user types
    if (geocodeStatus !== 'idle') {
      setGeocodeStatus('idle');
      setGeocodeError('');
      setValidatedAreaName('');
    }
  };

  const handleGeocodeArea = async () => {
    if (!formData.areaName.trim()) {
      toast.error('Please enter an area name');
      return;
    }

    try {
      setGeocodeStatus('idle');
      setGeocodeError('');
      
      const result = await geocodeMutation.mutateAsync(formData.areaName);
      
      // Convert coordinates to the format expected by the form
      const lat = Math.abs(result.lat);
      const lon = Math.abs(result.lon);
      const latDirection = result.lat >= 0 ? 'N' : 'S';
      const lonDirection = result.lon >= 0 ? 'E' : 'W';

      // Use the standardized display name from geocoding result
      const standardizedAreaName = result.display_name;
      setValidatedAreaName(standardizedAreaName);

      setFormData(prev => ({
        ...prev,
        coordinates: {
          latitude: lat,
          longitude: lon,
          latitudeDirection: latDirection,
          longitudeDirection: lonDirection,
          areaName: standardizedAreaName,
        },
      }));

      setGeocodeStatus('success');
      toast.success(`Location validated: ${standardizedAreaName}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate area';
      setGeocodeError(errorMessage);
      setGeocodeStatus('error');
      toast.error(errorMessage);
    }
  };

  const handleLocationCapture = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        // Try to reverse geocode the GPS coordinates to get a proper area name
        try {
          const reverseGeocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
          const response = await fetch(reverseGeocodeUrl, {
            headers: {
              'User-Agent': 'Celestial Climate Action App',
            },
          });

          let areaName = 'GPS Location';
          if (response.ok) {
            const data = await response.json();
            if (data && data.display_name) {
              areaName = data.display_name;
              setValidatedAreaName(areaName);
              setGeocodeStatus('success');
            }
          }

          setFormData(prev => ({
            ...prev,
            areaName: areaName,
            coordinates: {
              latitude: Math.abs(lat),
              longitude: Math.abs(lon),
              latitudeDirection: lat >= 0 ? 'N' : 'S',
              longitudeDirection: lon >= 0 ? 'E' : 'W',
              areaName: areaName,
            },
          }));
          
          toast.success('Location captured and area name resolved');
        } catch (error) {
          // Fallback to basic GPS location if reverse geocoding fails
          setFormData(prev => ({
            ...prev,
            areaName: 'GPS Location',
            coordinates: {
              latitude: Math.abs(lat),
              longitude: Math.abs(lon),
              latitudeDirection: lat >= 0 ? 'N' : 'S',
              longitudeDirection: lon >= 0 ? 'E' : 'W',
              areaName: 'GPS Location',
            },
          }));
          
          setGeocodeStatus('idle');
          setGeocodeError('');
          setValidatedAreaName('');
          
          toast.success('Location captured successfully');
        }
      },
      (error) => {
        toast.error('Failed to get location: ' + error.message);
      }
    );
  };

  const handleCategoryChange = (category: Category, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.photo) {
      toast.error('Please select a photo');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    if (!formData.weatherNotes.trim()) {
      toast.error('Please provide weather notes');
      return;
    }

    if (formData.coordinates.latitude === 0 && formData.coordinates.longitude === 0) {
      toast.error('Please provide valid coordinates');
      return;
    }

    if (!formData.areaName.trim()) {
      toast.error('Please provide an area name');
      return;
    }

    try {
      const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Use the validated area name if available, otherwise use the user input
      const finalAreaName = geocodeStatus === 'success' && validatedAreaName 
        ? validatedAreaName 
        : formData.areaName.trim();
      
      await uploadMutation.mutateAsync({
        id,
        photo: formData.photo,
        coordinates: {
          ...formData.coordinates,
          areaName: finalAreaName
        },
        temperature: formData.temperature,
        weatherNotes: formData.weatherNotes,
        description: formData.description,
        categories: formData.categories,
      });

      toast.success('Climate action uploaded successfully!');
      
      // Reset form
      setFormData({
        photo: null,
        areaName: '',
        coordinates: { 
          latitude: 0, 
          longitude: 0, 
          latitudeDirection: 'N', 
          longitudeDirection: 'E',
          areaName: ''
        },
        temperature: 20,
        weatherNotes: '',
        description: '',
        categories: [],
      });
      
      // Reset geocode status
      setGeocodeStatus('idle');
      setGeocodeError('');
      setValidatedAreaName('');
      
      // Reset file input
      const fileInput = document.getElementById('photo') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      toast.error('Failed to upload climate action: ' + (error as Error).message);
    }
  };

  return (
    <section className="relative py-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20">
      <div className="absolute inset-0 bg-[url('/assets/generated/climate-hero-banner.jpg')] bg-cover bg-center opacity-10" />
      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Share Your Climate Action
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Document and share evidence of climate action activities happening around the world. 
              Upload photos with location data to build a global map of environmental initiatives.
            </p>
          </div>

          <Card className="bg-background/80 backdrop-blur-sm border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload Climate Action Evidence
              </CardTitle>
              <CardDescription>
                Share photos and details of climate action activities to inspire others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="photo" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Photo (JPEG/PNG)
                    </Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handlePhotoChange}
                      className="cursor-pointer"
                      required
                    />
                    {formData.photo && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {formData.photo.name}
                      </p>
                    )}
                  </div>

                  {/* Temperature */}
                  <div className="space-y-2">
                    <Label htmlFor="temperature" className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4" />
                      Temperature (°C)
                    </Label>
                    <Input
                      id="temperature"
                      type="number"
                      value={formData.temperature}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        temperature: parseFloat(e.target.value) || 0 
                      }))}
                      step="0.1"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </Label>
                  
                  {/* Area Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="areaName" className="text-sm">Area Name (City, Town, or Landmark)</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          id="areaName"
                          type="text"
                          value={formData.areaName}
                          onChange={handleAreaNameChange}
                          placeholder="e.g., New York, London, Central Park"
                          className="pr-8"
                          required
                        />
                        {geocodeStatus === 'success' && (
                          <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                        )}
                        {geocodeStatus === 'error' && (
                          <AlertCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGeocodeArea}
                        disabled={!formData.areaName.trim() || geocodeMutation.isPending}
                        className="shrink-0"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        {geocodeMutation.isPending ? 'Validating...' : 'Validate'}
                      </Button>
                    </div>
                    {geocodeError && (
                      <p className="text-sm text-red-500">{geocodeError}</p>
                    )}
                    {geocodeStatus === 'success' && validatedAreaName && (
                      <p className="text-sm text-green-600">✓ Area validated: {validatedAreaName}</p>
                    )}
                  </div>

                  {/* Manual Coordinates */}
                  <div className="grid md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="latitude" className="text-sm">Latitude</Label>
                      <div className="flex gap-2">
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          min="0"
                          max="90"
                          value={formData.coordinates.latitude}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            coordinates: {
                              ...prev.coordinates,
                              latitude: Math.abs(parseFloat(e.target.value) || 0),
                            },
                          }))}
                          placeholder="0.000000"
                          className="flex-1"
                          required
                        />
                        <Select
                          value={formData.coordinates.latitudeDirection}
                          onValueChange={(value: 'N' | 'S') => setFormData(prev => ({
                            ...prev,
                            coordinates: {
                              ...prev.coordinates,
                              latitudeDirection: value,
                            },
                          }))}
                        >
                          <SelectTrigger className="w-16">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="N">N</SelectItem>
                            <SelectItem value="S">S</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="longitude" className="text-sm">Longitude</Label>
                      <div className="flex gap-2">
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          min="0"
                          max="180"
                          value={formData.coordinates.longitude}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            coordinates: {
                              ...prev.coordinates,
                              longitude: Math.abs(parseFloat(e.target.value) || 0),
                            },
                          }))}
                          placeholder="0.000000"
                          className="flex-1"
                          required
                        />
                        <Select
                          value={formData.coordinates.longitudeDirection}
                          onValueChange={(value: 'E' | 'W') => setFormData(prev => ({
                            ...prev,
                            coordinates: {
                              ...prev.coordinates,
                              longitudeDirection: value,
                            },
                          }))}
                        >
                          <SelectTrigger className="w-16">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="E">E</SelectItem>
                            <SelectItem value="W">W</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleLocationCapture}
                        className="w-full"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Auto-capture
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter an area name and click "Validate" to automatically fill coordinates with standardized location data, or enter coordinates manually, or use GPS auto-capture
                  </p>
                </div>

                {/* Weather Notes */}
                <div className="space-y-2">
                  <Label htmlFor="weatherNotes" className="flex items-center gap-2">
                    <CloudSun className="w-4 h-4" />
                    Weather Notes
                  </Label>
                  <Input
                    id="weatherNotes"
                    value={formData.weatherNotes}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      weatherNotes: e.target.value 
                    }))}
                    placeholder="e.g., Sunny, light breeze, clear skies"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                    placeholder="Describe the climate action activity..."
                    rows={3}
                    required
                  />
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <Label>Categories (optional)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {categoryOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.value}
                          checked={formData.categories.includes(option.value)}
                          onCheckedChange={(checked) => 
                            handleCategoryChange(option.value, checked as boolean)
                          }
                        />
                        <Label htmlFor={option.value} className="text-sm cursor-pointer">
                          {option.icon} {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Share Climate Action'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
