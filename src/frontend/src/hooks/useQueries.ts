import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { ClimateAction, Category, Coordinates, UserProfile, ChatMessage, LocationFilter, NotificationPreference, Notification } from '../backend';
import { useFileUpload, useFileUrl } from '../blob-storage/FileStorage';
import { Principal } from '@dfinity/principal';

export function useGetAllClimateActions() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useQuery<ClimateAction[]>({
    queryKey: ['climate-actions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClimateActions();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useGetFilteredClimateActions(filter: LocationFilter) {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useQuery<ClimateAction[]>({
    queryKey: ['climate-actions', 'filtered', filter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFilteredClimateActions(filter);
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useGetClimateAction(id: string) {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useQuery<ClimateAction | null>({
    queryKey: ['climate-action', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getClimateAction(id);
    },
    enabled: !!actor && !isFetching && !!id && isAuthenticated,
  });
}

export function useUploadClimateAction() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { uploadFile } = useFileUpload();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async ({
      id,
      photo,
      coordinates,
      temperature,
      weatherNotes,
      description,
      categories,
    }: {
      id: string;
      photo: File;
      coordinates: Coordinates;
      temperature: number;
      weatherNotes: string;
      description: string;
      categories: Category[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      // Upload photo first
      const photoPath = `climate-actions/${id}/${photo.name}`;
      await uploadFile(photoPath, photo);

      // Then upload climate action data
      await actor.uploadClimateAction(
        id,
        photoPath,
        coordinates,
        temperature,
        weatherNotes,
        description,
        categories
      );

      return { id, photoPath };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['climate-actions'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useClimateActionPhoto(photoPath: string) {
  return useFileUrl(photoPath);
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  // Return custom state that properly reflects actor dependency
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { uploadFile } = useFileUpload();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async ({
      displayName,
      bio,
      profilePhoto,
    }: {
      displayName: string;
      bio: string;
      profilePhoto?: File;
    }) => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      let profilePhotoPath: string | undefined;

      // Upload profile photo if provided
      if (profilePhoto) {
        const timestamp = Date.now();
        profilePhotoPath = `profiles/${timestamp}/${profilePhoto.name}`;
        await uploadFile(profilePhotoPath, profilePhoto);
      }

      // Save profile data
      const profile: UserProfile = {
        displayName,
        bio,
        profilePhotoPath,
      };

      await actor.saveCallerUserProfile(profile);
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useProfilePhoto(profilePhotoPath?: string) {
  return useFileUrl(profilePhotoPath || '');
}

// Chat and Weather functionality
export function useGetChatHistory() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useQuery<ChatMessage[]>({
    queryKey: ['chat-history'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatHistory();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useSendChatMessage() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async (message: ChatMessage) => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      await actor.sendChatMessage(message);
      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
  });
}

export function useWeatherQuery() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async ({
      query,
      location,
    }: {
      query: string;
      location: { lat: number; lon: number } | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      // Construct weather API URL (using OpenWeatherMap as example)
      const apiKey = 'demo'; // In production, this would be configured properly
      let weatherUrl = '';

      if (location) {
        // Use coordinates for location-based queries
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`;
      } else {
        // For queries without location, try to extract location from query or use a default
        const locationMatch = query.match(/in\s+([a-zA-Z\s,]+)/i);
        const locationName = locationMatch ? locationMatch[1].trim() : 'London';
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(locationName)}&appid=${apiKey}&units=metric`;
      }

      try {
        // Fetch weather data through backend
        const weatherData = await actor.fetchWeatherData(weatherUrl);
        
        // Parse the weather data and format a conversational response
        let parsedData;
        try {
          parsedData = JSON.parse(weatherData);
        } catch {
          // If parsing fails, return a generic response
          return "I'm having trouble accessing weather data right now. Please try again later.";
        }

        if (parsedData.cod && parsedData.cod !== 200) {
          return "I couldn't find weather information for that location. Please try a different location or check your spelling.";
        }

        // Format the response based on the query type
        const temp = Math.round(parsedData.main?.temp || 0);
        const feelsLike = Math.round(parsedData.main?.feels_like || 0);
        const description = parsedData.weather?.[0]?.description || 'unknown';
        const humidity = parsedData.main?.humidity || 0;
        const windSpeed = parsedData.wind?.speed || 0;
        const locationName = parsedData.name || 'your location';

        let response = `Here's the current weather for ${locationName}:\n\n`;
        response += `🌡️ Temperature: ${temp}°C (feels like ${feelsLike}°C)\n`;
        response += `☁️ Conditions: ${description}\n`;
        response += `💧 Humidity: ${humidity}%\n`;
        response += `💨 Wind Speed: ${windSpeed} m/s\n\n`;

        // Add contextual advice based on conditions
        if (temp < 0) {
          response += "❄️ It's quite cold! Bundle up and stay warm.";
        } else if (temp > 30) {
          response += "🌞 It's quite hot! Stay hydrated and seek shade when possible.";
        } else if (description.includes('rain')) {
          response += "🌧️ Don't forget your umbrella!";
        } else if (description.includes('clear')) {
          response += "☀️ Perfect weather for outdoor activities!";
        }

        return response;
      } catch (error) {
        console.error('Weather API error:', error);
        return "I'm experiencing technical difficulties accessing weather data. Please try again in a few moments.";
      }
    },
  });
}

// Geocoding functionality
export interface GeocodeResult {
  lat: number;
  lon: number;
  display_name: string;
}

export function useGeocodeArea() {
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async (areaName: string): Promise<GeocodeResult> => {
      if (!isAuthenticated) throw new Error('Authentication required');
      if (!areaName.trim()) throw new Error('Area name is required');

      // Use OpenStreetMap Nominatim API for geocoding (free, no API key required)
      const encodedArea = encodeURIComponent(areaName.trim());
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedArea}&limit=1&addressdetails=1`;

      try {
        const response = await fetch(geocodeUrl, {
          headers: {
            'User-Agent': 'Celestial Climate Action App',
          },
        });

        if (!response.ok) {
          throw new Error('Geocoding service unavailable');
        }

        const data = await response.json();

        if (!data || data.length === 0) {
          throw new Error('Location not found. Please check the spelling and try again.');
        }

        const result = data[0];
        return {
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
          display_name: result.display_name,
        };
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to validate area. Please check your internet connection and try again.');
      }
    },
  });
}

// Notification functionality
export function useGetNotificationPreferences() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useQuery<NotificationPreference | null>({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNotificationPreferences();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useSetNotificationPreferences() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async (preferences: NotificationPreference) => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      await actor.setNotificationPreferences(preferences);
      return preferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });
}

export function useGetNotifications() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      await actor.markNotificationAsRead(notificationId);
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useClearNotifications() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      await actor.clearNotifications();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Helper hook to get all users for notification preferences
export function useGetAllUsers() {
  const { data: climateActions = [] } = useGetAllClimateActions();
  
  // Extract unique users from climate actions
  const users = climateActions.reduce((acc, action) => {
    if (!acc.find(user => user.displayName === action.userDisplayName)) {
      acc.push({
        displayName: action.userDisplayName,
        // Note: We don't have access to the actual Principal here,
        // so we'll use the display name as a unique identifier
        principal: action.userDisplayName, // This is a workaround
      });
    }
    return acc;
  }, [] as { displayName: string; principal: string }[]);

  return { data: users };
}

