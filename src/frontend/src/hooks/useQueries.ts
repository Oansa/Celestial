import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { ClimateAction, Category, Coordinates, UserProfile, ChatMessage, LocationFilter, NotificationPreference, Notification, ActiveUser, VoteType, WeatherReportVotes, CryptoWallet, DonationConfig, Donation, DonationMethod, StripeConfiguration, ShoppingItem, CategoryData, Comment } from '../backend';
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
      category,
      categoryData,
      walletAddress,
    }: {
      id: string;
      photo: File;
      coordinates: Coordinates;
      temperature: number;
      weatherNotes: string;
      description: string;
      category: Category;
      categoryData: CategoryData;
      walletAddress: string | null;
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
        category,
        categoryData,
        walletAddress
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
      isPremium,
    }: {
      displayName: string;
      bio: string;
      profilePhoto?: File;
      isPremium?: boolean;
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
        isPremium: isPremium ?? false,
      };

      await actor.saveCallerUserProfile(profile);
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['active-users'] });
      queryClient.invalidateQueries({ queryKey: ['premium-status'] });
    },
  });
}

export function useProfilePhoto(profilePhotoPath?: string) {
  return useFileUrl(profilePhotoPath || '');
}

// Premium status functionality - Admin only
export function useGetCallerPremiumStatus() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useQuery<boolean>({
    queryKey: ['premium-status'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getCallerPremiumStatus();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useToggleUserPremiumStatus() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async (user: Principal): Promise<boolean> => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      const newStatus = await actor.toggleUserPremiumStatus(user);
      return newStatus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-users'] });
      queryClient.invalidateQueries({ queryKey: ['premium-status'] });
    },
  });
}

export function useSetUserPremiumStatus() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async ({ user, isPremium }: { user: Principal; isPremium: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      await actor.setUserPremiumStatus(user, isPremium);
      return { user, isPremium };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-users'] });
      queryClient.invalidateQueries({ queryKey: ['premium-status'] });
    },
  });
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

export function useSearchPlatformData() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async (searchTerm: string): Promise<string[]> => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      return actor.searchPlatformData(searchTerm);
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

      // Generate unique report ID for this weather query
      const reportId = `weather-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
          return {
            content: "I'm having trouble accessing weather data right now. Please try again later.",
            reportId: null,
          };
        }

        if (parsedData.cod && parsedData.cod !== 200) {
          return {
            content: "I couldn't find weather information for that location. Please try a different location or check your spelling.",
            reportId: null,
          };
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

        return {
          content: response,
          reportId,
        };
      } catch (error) {
        console.error('Weather API error:', error);
        return {
          content: "I'm experiencing technical difficulties accessing weather data. Please try again in a few moments.",
          reportId: null,
        };
      }
    },
  });
}

export function usePlatformDataQuery() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const { data: climateActions = [] } = useGetAllClimateActions();
  const { data: activeUsers = [] } = useGetActiveUsers();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async (query: string): Promise<{ content: string; reportId: null }> => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      const lowerQuery = query.toLowerCase();
      let response = '';

      // Search for climate actions by location
      if (lowerQuery.includes('location') || lowerQuery.includes('where') || lowerQuery.includes('place')) {
        const locationMatches = climateActions.filter(action => 
          lowerQuery.includes(action.coordinates.areaName.toLowerCase()) ||
          action.coordinates.areaName.toLowerCase().includes(lowerQuery.replace(/.*in\s+/i, '').replace(/.*from\s+/i, ''))
        );

        if (locationMatches.length > 0) {
          response = `I found ${locationMatches.length} climate action${locationMatches.length > 1 ? 's' : ''} in the locations you mentioned:\n\n`;
          locationMatches.slice(0, 5).forEach((action, index) => {
            const categoryName = action.category === 'treePlanting' ? 'Tree Planting' :
                               action.category === 'cleanup' ? 'Cleanup' :
                               action.category === 'renewableEnergy' ? 'Renewable Energy' : 'Awareness Event';
            response += `${index + 1}. ${categoryName} in ${action.coordinates.areaName} by ${action.userDisplayName}\n`;
            response += `   📝 ${action.description.substring(0, 100)}${action.description.length > 100 ? '...' : ''}\n\n`;
          });
          if (locationMatches.length > 5) {
            response += `...and ${locationMatches.length - 5} more actions.`;
          }
        } else {
          response = "I couldn't find any climate actions for the location you mentioned. Try asking about a different location or browse all submissions to see what's available.";
        }
      }
      // Search by category
      else if (lowerQuery.includes('tree') || lowerQuery.includes('plant')) {
        const treePlantingActions = climateActions.filter(action => action.category === 'treePlanting');
        if (treePlantingActions.length > 0) {
          response = `🌳 I found ${treePlantingActions.length} tree planting action${treePlantingActions.length > 1 ? 's' : ''} on our platform:\n\n`;
          treePlantingActions.slice(0, 3).forEach((action, index) => {
            response += `${index + 1}. ${action.coordinates.areaName} by ${action.userDisplayName}\n`;
            if (action.categoryData.__kind__ === 'treePlanting') {
              response += `   🌱 ${Number(action.categoryData.treePlanting.numberOfTrees)} trees planted\n`;
              response += `   🌿 Species: ${action.categoryData.treePlanting.treeSpecies}\n\n`;
            }
          });
        } else {
          response = "No tree planting activities have been recorded yet. Be the first to share your tree planting efforts!";
        }
      }
      else if (lowerQuery.includes('cleanup') || lowerQuery.includes('clean')) {
        const cleanupActions = climateActions.filter(action => action.category === 'cleanup');
        if (cleanupActions.length > 0) {
          response = `🧹 I found ${cleanupActions.length} cleanup action${cleanupActions.length > 1 ? 's' : ''} on our platform:\n\n`;
          cleanupActions.slice(0, 3).forEach((action, index) => {
            response += `${index + 1}. ${action.coordinates.areaName} by ${action.userDisplayName}\n`;
            if (action.categoryData.__kind__ === 'cleanup') {
              response += `   🗑️ Waste type: ${action.categoryData.cleanup.wasteType}\n`;
              response += `   📏 Amount: ${action.categoryData.cleanup.amount} ${action.categoryData.cleanup.amountUnit}\n\n`;
            }
          });
        } else {
          response = "No cleanup activities have been recorded yet. Share your cleanup efforts to inspire others!";
        }
      }
      else if (lowerQuery.includes('renewable') || lowerQuery.includes('energy') || lowerQuery.includes('solar') || lowerQuery.includes('wind')) {
        const energyActions = climateActions.filter(action => action.category === 'renewableEnergy');
        if (energyActions.length > 0) {
          response = `⚡ I found ${energyActions.length} renewable energy action${energyActions.length > 1 ? 's' : ''} on our platform:\n\n`;
          energyActions.slice(0, 3).forEach((action, index) => {
            response += `${index + 1}. ${action.coordinates.areaName} by ${action.userDisplayName}\n`;
            if (action.categoryData.__kind__ === 'renewableEnergy') {
              response += `   🔋 Type: ${action.categoryData.renewableEnergy.installationType}\n`;
              response += `   ⚡ Capacity: ${action.categoryData.renewableEnergy.energyCapacity} ${action.categoryData.renewableEnergy.capacityUnit}\n\n`;
            }
          });
        } else {
          response = "No renewable energy projects have been shared yet. Upload your renewable energy installations to showcase clean energy progress!";
        }
      }
      // Search by user
      else if (lowerQuery.includes('user') || lowerQuery.includes('profile') || lowerQuery.includes('member')) {
        const userNames = [...new Set(climateActions.map(action => action.userDisplayName))];
        if (userNames.length > 0) {
          response = `👥 Our community has ${userNames.length} active member${userNames.length > 1 ? 's' : ''} who have shared climate actions:\n\n`;
          userNames.slice(0, 10).forEach((name, index) => {
            const userActions = climateActions.filter(action => action.userDisplayName === name);
            response += `${index + 1}. ${name} - ${userActions.length} action${userActions.length > 1 ? 's' : ''}\n`;
          });
          if (userNames.length > 10) {
            response += `\n...and ${userNames.length - 10} more members.`;
          }
        } else {
          response = "No user profiles with climate actions found yet.";
        }
      }
      // Recent activities
      else if (lowerQuery.includes('recent') || lowerQuery.includes('latest') || lowerQuery.includes('new')) {
        const recentActions = [...climateActions]
          .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
          .slice(0, 5);
        
        if (recentActions.length > 0) {
          response = `📅 Here are the most recent climate actions on our platform:\n\n`;
          recentActions.forEach((action, index) => {
            const categoryName = action.category === 'treePlanting' ? 'Tree Planting' :
                               action.category === 'cleanup' ? 'Cleanup' :
                               action.category === 'renewableEnergy' ? 'Renewable Energy' : 'Awareness Event';
            const date = new Date(Number(action.timestamp) / 1000000).toLocaleDateString();
            response += `${index + 1}. ${categoryName} in ${action.coordinates.areaName}\n`;
            response += `   👤 By: ${action.userDisplayName}\n`;
            response += `   📅 Date: ${date}\n`;
            response += `   📝 ${action.description.substring(0, 80)}${action.description.length > 80 ? '...' : ''}\n\n`;
          });
        } else {
          response = "No recent activities found. Be the first to share a climate action!";
        }
      }
      // Statistics
      else if (lowerQuery.includes('statistic') || lowerQuery.includes('total') || lowerQuery.includes('count') || lowerQuery.includes('how many')) {
        const totalActions = climateActions.length;
        const treePlanting = climateActions.filter(a => a.category === 'treePlanting').length;
        const cleanup = climateActions.filter(a => a.category === 'cleanup').length;
        const renewableEnergy = climateActions.filter(a => a.category === 'renewableEnergy').length;
        const awarenessEvent = climateActions.filter(a => a.category === 'awarenessEvent').length;
        const activeMembers = [...new Set(climateActions.map(a => a.userDisplayName))].length;

        response = `📊 Platform Statistics:\n\n`;
        response += `🌍 Total Climate Actions: ${totalActions}\n`;
        response += `🌳 Tree Planting: ${treePlanting}\n`;
        response += `🧹 Cleanup Activities: ${cleanup}\n`;
        response += `⚡ Renewable Energy: ${renewableEnergy}\n`;
        response += `📢 Awareness Events: ${awarenessEvent}\n`;
        response += `👥 Active Members: ${activeMembers}\n\n`;
        
        if (totalActions > 0) {
          response += `Our community is making a real impact! Keep up the great work! 🌟`;
        } else {
          response += `Ready to get started? Upload your first climate action to begin building our community impact! 🚀`;
        }
      }
      // General help
      else {
        response = `🤖 I can help you explore our climate action platform! Here's what you can ask me about:\n\n`;
        response += `🌍 **Platform Data:**\n`;
        response += `• "Show me tree planting activities"\n`;
        response += `• "What cleanup actions are in [location]?"\n`;
        response += `• "Recent renewable energy projects"\n`;
        response += `• "Platform statistics"\n`;
        response += `• "Who are the active members?"\n\n`;
        response += `🌤️ **Weather Information:**\n`;
        response += `• "What's the weather like?"\n`;
        response += `• "Weather forecast for [location]"\n`;
        response += `• "Temperature in [city]"\n\n`;
        response += `Try asking me about any of these topics, or explore the submissions page to see all climate actions! 🌱`;
      }

      return {
        content: response,
        reportId: null,
      };
    },
  });
}

// Weather Report Voting functionality
export function useVoteWeatherReport() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async ({ reportId, voteType }: { reportId: string; voteType: VoteType }) => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      await actor.voteWeatherReport(reportId, voteType);
      return { reportId, voteType };
    },
    onSuccess: ({ reportId }) => {
      queryClient.invalidateQueries({ queryKey: ['weather-report-votes', reportId] });
      queryClient.invalidateQueries({ queryKey: ['user-vote-status', reportId] });
    },
  });
}

export function useGetWeatherReportVotes(reportId: string) {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useQuery<WeatherReportVotes>({
    queryKey: ['weather-report-votes', reportId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getWeatherReportVotes(reportId);
    },
    enabled: !!actor && !isFetching && !!reportId && isAuthenticated,
  });
}

export function useGetUserVoteStatus(reportId: string) {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useQuery<VoteType | null>({
    queryKey: ['user-vote-status', reportId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserVoteStatus(reportId);
    },
    enabled: !!actor && !isFetching && !!reportId && isAuthenticated,
  });
}

// Comment functionality
export function useGetCommentsBySubmission(submissionId: string) {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useQuery<Comment[]>({
    queryKey: ['comments', submissionId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCommentsBySubmission(submissionId);
    },
    enabled: !!actor && !isFetching && !!submissionId && isAuthenticated,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async ({ submissionId, content }: { submissionId: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      await actor.addComment(submissionId, content);
      return { submissionId, content };
    },
    onSuccess: ({ submissionId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', submissionId] });
    },
  });
}

// Donation functionality
export function useGetCryptoWallets() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useQuery<CryptoWallet[]>({
    queryKey: ['crypto-wallets'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCryptoWallets();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useGetDonationConfig() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useQuery<DonationConfig | null>({
    queryKey: ['donation-config'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDonationConfig();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useSetDonationConfig() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async (config: DonationConfig) => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      await actor.setDonationConfig(config);
      return config;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation-config'] });
      queryClient.invalidateQueries({ queryKey: ['crypto-wallets'] });
    },
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useQuery<boolean>({
    queryKey: ['stripe-configured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      await actor.setStripeConfiguration(config);
      return config;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-configured'] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<{ id: string; url: string }> => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      // JSON parsing is important!
      const session = JSON.parse(result) as { id: string; url: string };
      return session;
    },
  });
}

export function useMakeDonation() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async ({
      amount,
      currency,
      method,
      submissionId,
      transactionId,
    }: {
      amount: number;
      currency: string;
      method: DonationMethod;
      submissionId: string;
      transactionId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      await actor.makeDonation(amount, currency, method, submissionId, transactionId);
      return { amount, currency, method, submissionId, transactionId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['donations-by-submission'] });
    },
  });
}

export function useGetDonationsBySubmission(submissionId: string) {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useQuery<Donation[]>({
    queryKey: ['donations-by-submission', submissionId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDonationsBySubmission(submissionId);
    },
    enabled: !!actor && !isFetching && !!submissionId && isAuthenticated,
  });
}

export function useGetAllDonations() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useQuery<Donation[]>({
    queryKey: ['donations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDonations();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useQuery<boolean>({
    queryKey: ['is-admin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
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

// Active Users functionality
export function useGetActiveUsers() {
  const { actor, isFetching } = useActor();
  const { loginStatus } = useInternetIdentity();
  const isAuthenticated = loginStatus === 'success';

  return useQuery<ActiveUser[]>({
    queryKey: ['active-users'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveUsers();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    refetchInterval: 60000, // Refetch every minute for near real-time updates
  });
}

export function useUpdateActiveUser() {
  const { actor } = useActor();
  const { loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = loginStatus === 'success';

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!isAuthenticated) throw new Error('Authentication required');

      await actor.updateActiveUser();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-users'] });
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
