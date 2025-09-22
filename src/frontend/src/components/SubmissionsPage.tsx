import { useState, useMemo } from 'react';
import { ArrowLeft, MapPin, Thermometer, Calendar, Tag, Filter, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useGetAllClimateActions, useClimateActionPhoto, useIsStripeConfigured } from '../hooks/useQueries';
import { ClimateAction, Category } from '../backend';
import DonationModal from './DonationModal';
import CommentSection from './CommentSection';

interface SubmissionsPageProps {
  onBack: () => void;
}

// Define proper types for geographical data
interface CountryData {
  divisions: string[];
}

interface ContinentData {
  countries: Record<string, CountryData>;
}

interface GeographicalData {
  continents: Record<string, ContinentData>;
}

// Mock geographical data - in a real app, this would come from the backend
const GEOGRAPHICAL_DATA: GeographicalData = {
  continents: {
    'North America': {
      countries: {
        'United States': {
          divisions: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia']
        },
        'Canada': {
          divisions: ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories']
        },
        'Mexico': {
          divisions: ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua']
        }
      }
    },
    'Europe': {
      countries: {
        'United Kingdom': {
          divisions: ['England', 'Scotland', 'Wales', 'Northern Ireland']
        },
        'Germany': {
          divisions: ['Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg']
        },
        'France': {
          divisions: ['Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Brittany', 'Centre-Val de Loire', 'Corsica', 'Grand Est']
        }
      }
    },
    'Asia': {
      countries: {
        'Japan': {
          divisions: ['Hokkaido', 'Honshu', 'Kyushu', 'Shikoku']
        },
        'China': {
          divisions: ['Beijing', 'Shanghai', 'Guangdong', 'Sichuan', 'Henan', 'Shandong']
        },
        'India': {
          divisions: ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa']
        }
      }
    },
    'Africa': {
      countries: {
        'South Africa': {
          divisions: ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga']
        },
        'Nigeria': {
          divisions: ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa']
        },
        'Kenya': {
          divisions: ['Central', 'Coast', 'Eastern', 'Nairobi', 'North Eastern', 'Nyanza']
        }
      }
    },
    'South America': {
      countries: {
        'Brazil': {
          divisions: ['Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará']
        },
        'Argentina': {
          divisions: ['Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes']
        },
        'Chile': {
          divisions: ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso']
        }
      }
    },
    'Oceania': {
      countries: {
        'Australia': {
          divisions: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania']
        },
        'New Zealand': {
          divisions: ['North Island', 'South Island']
        }
      }
    }
  }
};

interface LocationFilters {
  continent?: string;
  country?: string;
  adminDivision?: string;
}

function SubmissionCard({ action, onDonate }: { action: ClimateAction; onDonate: () => void }) {
  const { data: photoUrl } = useClimateActionPhoto(action.photoPath);
  const { data: isStripeConfigured = false } = useIsStripeConfigured();

  const getCategoryLabel = (category: Category) => {
    switch (category) {
      case Category.treePlanting:
        return 'Tree Planting';
      case Category.cleanup:
        return 'Cleanup';
      case Category.renewableEnergy:
        return 'Renewable Energy';
      case Category.awarenessEvent:
        return 'Awareness Event';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: Category) => {
    switch (category) {
      case Category.treePlanting:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case Category.cleanup:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case Category.renewableEnergy:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case Category.awarenessEvent:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatLocationWithCoordinates = (coordinates: { latitude: number; longitude: number; latitudeDirection: string; longitudeDirection: string; areaName: string }) => {
    const formattedCoords = `${coordinates.latitude.toFixed(4)}° ${coordinates.latitudeDirection}, ${coordinates.longitude.toFixed(4)}° ${coordinates.longitudeDirection}`;
    return `${coordinates.areaName}, ${formattedCoords}`;
  };

  // Check if donation options are available (Stripe or user wallet)
  const hasDonationOptions = isStripeConfigured || !!action.walletAddress;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Climate action"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-muted-foreground">Loading image...</div>
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {action.description}
          </p>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{formatLocationWithCoordinates(action.coordinates)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Thermometer className="w-4 h-4" />
            <span>{action.temperature}°C</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{new Date(Number(action.timestamp) / 1000000).toLocaleDateString()}</span>
          </div>
          
          {action.weatherNotes && (
            <p className="text-sm text-muted-foreground italic">
              "{action.weatherNotes}"
            </p>
          )}
          
          <div className="flex flex-wrap gap-1">
            <Badge
              variant="secondary"
              className={getCategoryColor(action.category)}
            >
              <Tag className="w-3 h-3 mr-1" />
              {getCategoryLabel(action.category)}
            </Badge>
          </div>
          
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Update from {action.userDisplayName}
            </p>
          </div>

          {/* Only show donation button if there are donation options available */}
          {hasDonationOptions && (
            <div className="pt-2">
              <Button
                onClick={onDonate}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Heart className="w-4 h-4 mr-2" />
                Make Donation
              </Button>
            </div>
          )}

          {/* Comment Section */}
          <div className="pt-2 border-t border-border">
            <CommentSection submissionId={action.id} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SubmissionsPage({ onBack }: SubmissionsPageProps) {
  const { data: climateActions = [], isLoading } = useGetAllClimateActions();
  const [filters, setFilters] = useState<LocationFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [donationAction, setDonationAction] = useState<ClimateAction | null>(null);

  // Get available options based on current selections
  const availableCountries = useMemo(() => {
    if (!filters.continent) return [];
    const continent = GEOGRAPHICAL_DATA.continents[filters.continent];
    return continent ? Object.keys(continent.countries) : [];
  }, [filters.continent]);

  const availableDivisions = useMemo(() => {
    if (!filters.continent || !filters.country) return [];
    const continent = GEOGRAPHICAL_DATA.continents[filters.continent];
    if (!continent) return [];
    const country = continent.countries[filters.country];
    return country ? country.divisions : [];
  }, [filters.continent, filters.country]);

  // Filter submissions based on selected filters
  // Note: This is a mock implementation since the backend doesn't store proper geographical data yet
  const filteredSubmissions = useMemo(() => {
    if (!filters.continent && !filters.country && !filters.adminDivision) {
      return climateActions;
    }
    
    // For now, we'll just return all submissions since we don't have proper geographical data
    // In a real implementation, this would filter based on the stored location data
    return climateActions;
  }, [climateActions, filters]);

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = filters.continent || filters.country || filters.adminDivision;

  const handleDonate = (action: ClimateAction) => {
    setDonationAction(action);
    setDonationModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading submissions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Climate Action Submissions</h1>
              <p className="text-muted-foreground">
                Browse all climate action submissions from around the world
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {Object.values(filters).filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Location Filters</span>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Continent Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Continent</label>
                  <Select
                    value={filters.continent || ''}
                    onValueChange={(value) => {
                      setFilters({
                        continent: value || undefined,
                        country: undefined,
                        adminDivision: undefined,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select continent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Continents</SelectItem>
                      {Object.keys(GEOGRAPHICAL_DATA.continents).map((continent) => (
                        <SelectItem key={continent} value={continent}>
                          {continent}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Country Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <Select
                    value={filters.country || ''}
                    onValueChange={(value) => {
                      setFilters({
                        ...filters,
                        country: value || undefined,
                        adminDivision: undefined,
                      });
                    }}
                    disabled={!filters.continent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Countries</SelectItem>
                      {availableCountries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Administrative Division Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Administrative Division</label>
                  <Select
                    value={filters.adminDivision || ''}
                    onValueChange={(value) => {
                      setFilters({
                        ...filters,
                        adminDivision: value || undefined,
                      });
                    }}
                    disabled={!filters.country}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Divisions</SelectItem>
                      {availableDivisions.map((division) => (
                        <SelectItem key={division} value={division}>
                          {division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Active filters:</span>
              {filters.continent && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.continent}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setFilters({ ...filters, continent: undefined, country: undefined, adminDivision: undefined })}
                  />
                </Badge>
              )}
              {filters.country && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.country}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setFilters({ ...filters, country: undefined, adminDivision: undefined })}
                  />
                </Badge>
              )}
              {filters.adminDivision && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.adminDivision}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setFilters({ ...filters, adminDivision: undefined })}
                  />
                </Badge>
              )}
            </div>
            <Separator className="mt-4" />
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}
            {hasActiveFilters && ' matching your filters'}
          </p>
        </div>

        {/* Submissions Grid */}
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {hasActiveFilters ? 'No submissions match your current filters.' : 'No submissions found.'}
            </div>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSubmissions.map((action) => (
              <SubmissionCard 
                key={action.id} 
                action={action} 
                onDonate={() => handleDonate(action)}
              />
            ))}
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
    </div>
  );
}
