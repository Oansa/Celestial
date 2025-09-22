import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, MapPin, Thermometer, CloudSun, Search, CheckCircle, AlertCircle, Sparkles, Wallet, TreePine, Trash2, Zap, Megaphone, Crown, Lock } from 'lucide-react';
import { useUploadClimateAction, useGeocodeArea, useGetCallerPremiumStatus } from '../hooks/useQueries';
import { Category, Coordinates, CategoryData, TreePlantingData, CleanupData, RenewableEnergyData } from '../backend';
import { toast } from 'sonner';

interface FormData {
  photo: File | null;
  areaName: string;
  coordinates: Coordinates;
  temperature: number;
  weatherNotes: string;
  description: string;
  category: Category | null;
  categoryData: CategoryData | null;
  walletAddress: string;
}

const categoryOptions = [
  { 
    value: Category.treePlanting, 
    label: 'Tree Planting', 
    icon: TreePine, 
    color: 'bg-forest-100 text-forest-800 dark:bg-forest-900 dark:text-forest-200',
    description: 'Planting trees for reforestation and carbon sequestration'
  },
  { 
    value: Category.cleanup, 
    label: 'Cleanup', 
    icon: Trash2, 
    color: 'bg-ocean-100 text-ocean-800 dark:bg-ocean-900 dark:text-ocean-200',
    description: 'Environmental cleanup activities'
  },
  { 
    value: Category.renewableEnergy, 
    label: 'Renewable Energy', 
    icon: Zap, 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    description: 'Renewable energy installations and projects'
  },
  { 
    value: Category.awarenessEvent, 
    label: 'Awareness Event', 
    icon: Megaphone, 
    color: 'bg-earth-100 text-earth-800 dark:bg-earth-900 dark:text-earth-200',
    description: 'Educational and awareness events'
  },
];

const installationTypes = [
  'Solar panels',
  'Wind turbine',
  'Hydroelectric',
  'Geothermal',
  'Biomass',
  'Other'
];

const unitOptions = {
  area: ['sqm', 'hectares', 'acres'],
  weight: ['kg', 'tons', 'lbs'],
  energy: ['kW', 'MW', 'GW']
};

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
    category: null,
    categoryData: null,
    walletAddress: '',
  });

  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [geocodeError, setGeocodeError] = useState<string>('');

  const uploadMutation = useUploadClimateAction();
  const geocodeMutation = useGeocodeArea();
  const { data: isPremium = false } = useGetCallerPremiumStatus();

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
        areaName: value
      }
    }));
    
    // Reset geocode status when user types
    if (geocodeStatus !== 'idle') {
      setGeocodeStatus('idle');
      setGeocodeError('');
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

      setFormData(prev => ({
        ...prev,
        coordinates: {
          latitude: lat,
          longitude: lon,
          latitudeDirection: latDirection,
          longitudeDirection: lonDirection,
          areaName: formData.areaName,
        },
      }));

      setGeocodeStatus('success');
      toast.success(`Location found: ${result.display_name}`);
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
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        setFormData(prev => ({
          ...prev,
          coordinates: {
            latitude: Math.abs(lat),
            longitude: Math.abs(lon),
            latitudeDirection: lat >= 0 ? 'N' : 'S',
            longitudeDirection: lon >= 0 ? 'E' : 'W',
            areaName: 'GPS Location',
          },
        }));
        
        // Reset area name and geocode status when using GPS
        setFormData(prev => ({ ...prev, areaName: 'GPS Location' }));
        setGeocodeStatus('idle');
        setGeocodeError('');
        
        toast.success('Location captured successfully');
      },
      (error) => {
        toast.error('Failed to get location: ' + error.message);
      }
    );
  };

  const handleCategoryChange = (category: Category) => {
    // Initialize default category data based on selected category
    let categoryData: CategoryData;
    
    switch (category) {
      case Category.treePlanting:
        categoryData = {
          __kind__: 'treePlanting',
          treePlanting: {
            numberOfTrees: BigInt(0),
            treeSpecies: '',
            areaSize: 0,
            areaUnit: 'sqm'
          }
        };
        break;
      case Category.cleanup:
        categoryData = {
          __kind__: 'cleanup',
          cleanup: {
            wasteType: '',
            amount: 0,
            amountUnit: 'kg',
            areaCleaned: ''
          }
        };
        break;
      case Category.renewableEnergy:
        categoryData = {
          __kind__: 'renewableEnergy',
          renewableEnergy: {
            installationType: 'Solar panels',
            energyCapacity: 0,
            capacityUnit: 'kW',
            installationDetails: ''
          }
        };
        break;
      case Category.awarenessEvent:
        categoryData = {
          __kind__: 'awarenessEvent',
          awarenessEvent: null
        };
        break;
      default:
        categoryData = {
          __kind__: 'awarenessEvent',
          awarenessEvent: null
        };
    }

    setFormData(prev => ({
      ...prev,
      category,
      categoryData
    }));
  };

  const updateCategoryData = (field: string, value: any) => {
    if (!formData.categoryData) return;

    setFormData(prev => {
      if (!prev.categoryData) return prev;

      let newCategoryData: CategoryData;
      
      switch (prev.categoryData.__kind__) {
        case 'treePlanting':
          newCategoryData = {
            __kind__: 'treePlanting',
            treePlanting: {
              ...prev.categoryData.treePlanting,
              [field]: field === 'numberOfTrees' ? BigInt(value) : value
            }
          };
          break;
        case 'cleanup':
          newCategoryData = {
            __kind__: 'cleanup',
            cleanup: {
              ...prev.categoryData.cleanup,
              [field]: value
            }
          };
          break;
        case 'renewableEnergy':
          newCategoryData = {
            __kind__: 'renewableEnergy',
            renewableEnergy: {
              ...prev.categoryData.renewableEnergy,
              [field]: value
            }
          };
          break;
        default:
          return prev;
      }

      return {
        ...prev,
        categoryData: newCategoryData
      };
    });
  };

  const validateWalletAddress = (address: string): boolean => {
    if (!address.trim()) return true; // Optional field
    
    // Basic Bitcoin address validation (simplified)
    const bitcoinRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
    // Basic Ethereum address validation
    const ethereumRegex = /^0x[a-fA-F0-9]{40}$/;
    
    return bitcoinRegex.test(address) || ethereumRegex.test(address);
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

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    if (!formData.categoryData) {
      toast.error('Category data is missing');
      return;
    }

    if (formData.walletAddress.trim() && !isPremium) {
      toast.error('Only premium users can request funding with a wallet address. Please upgrade to premium first.');
      return;
    }

    if (formData.walletAddress.trim() && !validateWalletAddress(formData.walletAddress)) {
      toast.error('Please enter a valid Bitcoin or Ethereum wallet address');
      return;
    }

    try {
      const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await uploadMutation.mutateAsync({
        id,
        photo: formData.photo,
        coordinates: {
          ...formData.coordinates,
          areaName: formData.areaName || 'Unknown Area'
        },
        temperature: formData.temperature,
        weatherNotes: formData.weatherNotes,
        description: formData.description,
        category: formData.category,
        categoryData: formData.categoryData,
        walletAddress: formData.walletAddress.trim() || null,
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
        category: null,
        categoryData: null,
        walletAddress: '',
      });
      
      // Reset geocode status
      setGeocodeStatus('idle');
      setGeocodeError('');
      
      // Reset file input
      const fileInput = document.getElementById('photo') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      toast.error('Failed to upload climate action: ' + (error as Error).message);
    }
  };

  const renderCategorySpecificFields = () => {
    if (!formData.category || !formData.categoryData) return null;

    switch (formData.category) {
      case Category.treePlanting:
        const treePlantingData = formData.categoryData.__kind__ === 'treePlanting' ? formData.categoryData.treePlanting : null;
        if (!treePlantingData) return null;

        return (
          <div className="space-y-6 p-6 bg-gradient-to-r from-forest-50/50 to-green-50/50 dark:from-forest-900/10 dark:to-green-900/10 rounded-xl border border-forest-200/50 dark:border-forest-800/50">
            <Label className="flex items-center gap-2 text-lg font-semibold">
              <TreePine className="w-6 h-6 text-forest-500" />
              Tree Planting Details
            </Label>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="numberOfTrees" className="text-base font-medium">Number of Trees Planted</Label>
                <Input
                  id="numberOfTrees"
                  type="number"
                  min="0"
                  value={Number(treePlantingData.numberOfTrees)}
                  onChange={(e) => updateCategoryData('numberOfTrees', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 50"
                  className="hover-lift"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="treeSpecies" className="text-base font-medium">Tree Species</Label>
                <Input
                  id="treeSpecies"
                  type="text"
                  value={treePlantingData.treeSpecies}
                  onChange={(e) => updateCategoryData('treeSpecies', e.target.value)}
                  placeholder="e.g., Oak, Pine, Maple"
                  className="hover-lift"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="areaSize" className="text-base font-medium">Planting Area Size</Label>
              <div className="flex gap-3">
                <Input
                  id="areaSize"
                  type="number"
                  min="0"
                  step="0.1"
                  value={treePlantingData.areaSize}
                  onChange={(e) => updateCategoryData('areaSize', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 100"
                  className="flex-1 hover-lift"
                  required
                />
                <Select
                  value={treePlantingData.areaUnit}
                  onValueChange={(value) => updateCategoryData('areaUnit', value)}
                >
                  <SelectTrigger className="w-32 hover-lift">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.area.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case Category.cleanup:
        const cleanupData = formData.categoryData.__kind__ === 'cleanup' ? formData.categoryData.cleanup : null;
        if (!cleanupData) return null;

        return (
          <div className="space-y-6 p-6 bg-gradient-to-r from-ocean-50/50 to-blue-50/50 dark:from-ocean-900/10 dark:to-blue-900/10 rounded-xl border border-ocean-200/50 dark:border-ocean-800/50">
            <Label className="flex items-center gap-2 text-lg font-semibold">
              <Trash2 className="w-6 h-6 text-ocean-500" />
              Cleanup Details
            </Label>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="wasteType" className="text-base font-medium">Type of Waste Collected</Label>
                <Input
                  id="wasteType"
                  type="text"
                  value={cleanupData.wasteType}
                  onChange={(e) => updateCategoryData('wasteType', e.target.value)}
                  placeholder="e.g., Plastic bottles, Paper, Mixed waste"
                  className="hover-lift"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="areaCleaned" className="text-base font-medium">Area Cleaned</Label>
                <Input
                  id="areaCleaned"
                  type="text"
                  value={cleanupData.areaCleaned}
                  onChange={(e) => updateCategoryData('areaCleaned', e.target.value)}
                  placeholder="e.g., Beach, Park, Street"
                  className="hover-lift"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="amount" className="text-base font-medium">Amount of Waste Collected</Label>
              <div className="flex gap-3">
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.1"
                  value={cleanupData.amount}
                  onChange={(e) => updateCategoryData('amount', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 25"
                  className="flex-1 hover-lift"
                  required
                />
                <Select
                  value={cleanupData.amountUnit}
                  onValueChange={(value) => updateCategoryData('amountUnit', value)}
                >
                  <SelectTrigger className="w-32 hover-lift">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.weight.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case Category.renewableEnergy:
        const renewableData = formData.categoryData.__kind__ === 'renewableEnergy' ? formData.categoryData.renewableEnergy : null;
        if (!renewableData) return null;

        return (
          <div className="space-y-6 p-6 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-xl border border-yellow-200/50 dark:border-yellow-800/50">
            <Label className="flex items-center gap-2 text-lg font-semibold">
              <Zap className="w-6 h-6 text-yellow-600" />
              Renewable Energy Details
            </Label>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="installationType" className="text-base font-medium">Installation Type</Label>
                <Select
                  value={renewableData.installationType}
                  onValueChange={(value) => updateCategoryData('installationType', value)}
                >
                  <SelectTrigger className="hover-lift">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {installationTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="energyCapacity" className="text-base font-medium">Energy Capacity</Label>
                <div className="flex gap-3">
                  <Input
                    id="energyCapacity"
                    type="number"
                    min="0"
                    step="0.1"
                    value={renewableData.energyCapacity}
                    onChange={(e) => updateCategoryData('energyCapacity', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 5.5"
                    className="flex-1 hover-lift"
                    required
                  />
                  <Select
                    value={renewableData.capacityUnit}
                    onValueChange={(value) => updateCategoryData('capacityUnit', value)}
                  >
                    <SelectTrigger className="w-24 hover-lift">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.energy.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="installationDetails" className="text-base font-medium">Installation Details</Label>
              <Textarea
                id="installationDetails"
                value={renewableData.installationDetails}
                onChange={(e) => updateCategoryData('installationDetails', e.target.value)}
                placeholder="Describe the installation process, location, and any special features..."
                rows={3}
                className="hover-lift resize-none"
                required
              />
            </div>
          </div>
        );

      case Category.awarenessEvent:
        return (
          <div className="space-y-4 p-6 bg-gradient-to-r from-earth-50/50 to-amber-50/50 dark:from-earth-900/10 dark:to-amber-900/10 rounded-xl border border-earth-200/50 dark:border-earth-800/50">
            <Label className="flex items-center gap-2 text-lg font-semibold">
              <Megaphone className="w-6 h-6 text-earth-600" />
              Awareness Event
            </Label>
            <p className="text-muted-foreground bg-white/50 dark:bg-black/20 p-3 rounded-lg">
              For awareness events, the standard fields (photo, location, temperature, weather notes, and description) provide sufficient information. 
              Use the description field to detail the event, its purpose, and impact.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-forest-50/30 via-sky-50/50 to-ocean-50/30 dark:from-forest-950/20 dark:via-sky-950/30 dark:to-ocean-950/20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-nature-pattern opacity-5" />
      <div className="absolute top-10 left-10 w-20 h-20 bg-forest-200/20 rounded-full animate-float" />
      <div className="absolute top-32 right-20 w-16 h-16 bg-ocean-200/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-earth-200/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-8 h-8 text-forest-500 animate-pulse" />
              <h2 className="text-5xl font-bold bg-gradient-to-r from-forest-600 via-ocean-600 to-earth-600 bg-clip-text text-transparent">
                Share Your Climate Action
              </h2>
              <Sparkles className="w-8 h-8 text-ocean-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Document and share evidence of climate action activities happening around the world. 
              Upload photos with location data to build a global map of environmental initiatives.
            </p>
          </div>

          <Card className="card-nature backdrop-blur-sm border-2 border-forest-100 dark:border-forest-800 shadow-nature-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="bg-gradient-to-r from-forest-50/50 to-ocean-50/50 dark:from-forest-900/20 dark:to-ocean-900/20">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-gradient-forest rounded-lg shadow-nature">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                Upload Climate Action Evidence
              </CardTitle>
              <CardDescription className="text-lg">
                Share photos and details of climate action activities to inspire others
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8 form-nature">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Photo Upload */}
                  <div className="space-y-3">
                    <Label htmlFor="photo" className="flex items-center gap-2 text-base font-medium">
                      <Upload className="w-5 h-5 text-forest-500" />
                      Photo (JPEG/PNG)
                    </Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handlePhotoChange}
                      className="cursor-pointer hover-lift file:bg-gradient-forest file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 file:hover:bg-gradient-ocean file:transition-all"
                      required
                    />
                    {formData.photo && (
                      <p className="text-sm text-forest-600 dark:text-forest-400 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Selected: {formData.photo.name}
                      </p>
                    )}
                  </div>

                  {/* Temperature */}
                  <div className="space-y-3">
                    <Label htmlFor="temperature" className="flex items-center gap-2 text-base font-medium">
                      <Thermometer className="w-5 h-5 text-orange-500" />
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
                      className="hover-lift"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-6 p-6 bg-gradient-to-r from-sky-50/50 to-forest-50/50 dark:from-sky-900/10 dark:to-forest-900/10 rounded-xl border border-sky-200/50 dark:border-sky-800/50">
                  <Label className="flex items-center gap-2 text-lg font-semibold">
                    <MapPin className="w-6 h-6 text-ocean-500" />
                    Location
                  </Label>
                  
                  {/* Area Name Input */}
                  <div className="space-y-3">
                    <Label htmlFor="areaName" className="text-base font-medium">Area Name (City, Town, or Landmark)</Label>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Input
                          id="areaName"
                          type="text"
                          value={formData.areaName}
                          onChange={handleAreaNameChange}
                          placeholder="e.g., New York, London, Central Park"
                          className="pr-10 hover-lift"
                        />
                        {geocodeStatus === 'success' && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-500 animate-pulse" />
                        )}
                        {geocodeStatus === 'error' && (
                          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500 animate-pulse" />
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGeocodeArea}
                        disabled={!formData.areaName.trim() || geocodeMutation.isPending}
                        className="shrink-0 hover-lift border-ocean-200 dark:border-ocean-800 hover:border-ocean-300 dark:hover:border-ocean-700 hover:bg-ocean-50 dark:hover:bg-ocean-900/20"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        {geocodeMutation.isPending ? 'Validating...' : 'Validate'}
                      </Button>
                    </div>
                    {geocodeError && (
                      <p className="text-sm text-red-500 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {geocodeError}
                      </p>
                    )}
                    {geocodeStatus === 'success' && (
                      <p className="text-sm text-forest-600 dark:text-forest-400 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Area validated and coordinates filled automatically
                      </p>
                    )}
                  </div>

                  {/* Manual Coordinates */}
                  <div className="grid md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="latitude" className="text-base font-medium">Latitude</Label>
                      <div className="flex gap-2 mt-2">
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
                          className="flex-1 hover-lift"
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
                          <SelectTrigger className="w-16 hover-lift">
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
                      <Label htmlFor="longitude" className="text-base font-medium">Longitude</Label>
                      <div className="flex gap-2 mt-2">
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
                          className="flex-1 hover-lift"
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
                          <SelectTrigger className="w-16 hover-lift">
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
                        className="w-full hover-lift border-forest-200 dark:border-forest-800 hover:border-forest-300 dark:hover:border-forest-700 hover:bg-forest-50 dark:hover:bg-forest-900/20"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Auto-capture
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                    Enter an area name to automatically fill coordinates, or enter coordinates manually with directions (N/S for latitude, E/W for longitude), or use GPS auto-capture
                  </p>
                </div>

                {/* Weather Notes */}
                <div className="space-y-3">
                  <Label htmlFor="weatherNotes" className="flex items-center gap-2 text-base font-medium">
                    <CloudSun className="w-5 h-5 text-sky-500" />
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
                    className="hover-lift"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-base font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                    placeholder="Describe the climate action activity..."
                    rows={4}
                    className="hover-lift resize-none"
                    required
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Category</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryOptions.map((option) => {
                      const IconComponent = option.icon;
                      const isSelected = formData.category === option.value;
                      
                      return (
                        <div 
                          key={option.value} 
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all-smooth hover-lift ${
                            isSelected 
                              ? 'border-forest-300 dark:border-forest-700 bg-forest-50/50 dark:bg-forest-900/20' 
                              : 'border-muted hover:border-forest-300 dark:hover:border-forest-700'
                          }`}
                          onClick={() => handleCategoryChange(option.value)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${option.color}`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-base">{option.label}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                            </div>
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 text-forest-500 mt-1" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Category-specific fields */}
                {renderCategorySpecificFields()}

                {/* Wallet Address - Premium Only */}
                <div className={`space-y-3 p-6 rounded-xl border ${
                  isPremium 
                    ? 'bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-200/50 dark:border-yellow-800/50'
                    : 'bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/10 dark:to-gray-800/10 border-gray-200/50 dark:border-gray-700/50'
                }`}>
                  <Label htmlFor="walletAddress" className="flex items-center gap-2 text-base font-medium">
                    {isPremium ? (
                      <>
                        <Crown className="w-5 h-5 text-yellow-600" />
                        <Wallet className="w-5 h-5 text-yellow-600" />
                        Cryptocurrency Wallet Address (Premium Feature)
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 text-gray-500" />
                        <Wallet className="w-5 h-5 text-gray-500" />
                        Cryptocurrency Wallet Address (Premium Only)
                      </>
                    )}
                  </Label>
                  
                  {!isPremium && (
                    <Alert>
                      <Crown className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Premium Feature:</strong> Only premium users can request funding with wallet addresses. 
                        Upgrade to premium to enable cryptocurrency donations for your climate actions.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Input
                    id="walletAddress"
                    value={formData.walletAddress}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      walletAddress: e.target.value 
                    }))}
                    placeholder={isPremium 
                      ? "e.g., 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa or 0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e1e1"
                      : "Premium upgrade required"
                    }
                    className={`hover-lift font-mono text-sm ${!isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!isPremium}
                  />
                  
                  <p className={`text-sm p-3 rounded-lg ${
                    isPremium 
                      ? 'text-muted-foreground bg-white/50 dark:bg-black/20'
                      : 'text-gray-500 bg-gray-100/50 dark:bg-gray-800/20'
                  }`}>
                    {isPremium ? (
                      <>
                        <strong>Optional:</strong> Provide your Bitcoin or Ethereum wallet address to allow others to donate cryptocurrency directly to you for this climate action. 
                        If provided, donors will be able to send crypto donations directly to your wallet instead of platform-owned addresses.
                      </>
                    ) : (
                      <>
                        <strong>Premium Feature:</strong> Upgrade to premium to enable wallet address submission and receive direct cryptocurrency donations for your climate actions.
                      </>
                    )}
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-nature text-lg py-6 shadow-nature-lg hover:shadow-glow-lg" 
                  size="lg"
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Share Climate Action
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
