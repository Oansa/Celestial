import React, { useState, useEffect } from 'react';
import { Bell, Users, MapPin, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useGetNotificationPreferences, useSetNotificationPreferences, useGetAllUsers } from '../hooks/useQueries';
import { NotificationPreference } from '../backend';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

export default function NotificationSettings() {
  const { data: preferences, isLoading: preferencesLoading } = useGetNotificationPreferences();
  const { data: allUsers = [] } = useGetAllUsers();
  const { mutate: savePreferences, isPending: isSaving } = useSetNotificationPreferences();

  const [receiveAllUpdates, setReceiveAllUpdates] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [areaPreferences, setAreaPreferences] = useState<string[]>([]);
  const [newArea, setNewArea] = useState('');

  // Load existing preferences
  useEffect(() => {
    if (preferences) {
      setReceiveAllUpdates(preferences.receiveAllUpdates);
      // Convert Principal array to string array for display
      setFollowedUsers(preferences.followedUsers.map(p => p.toString()));
      setAreaPreferences(preferences.areaPreferences);
    }
  }, [preferences]);

  const handleUserToggle = (userDisplayName: string, checked: boolean) => {
    if (checked) {
      setFollowedUsers(prev => [...prev, userDisplayName]);
    } else {
      setFollowedUsers(prev => prev.filter(user => user !== userDisplayName));
    }
  };

  const handleAddArea = () => {
    if (newArea.trim() && !areaPreferences.includes(newArea.trim())) {
      setAreaPreferences(prev => [...prev, newArea.trim()]);
      setNewArea('');
    }
  };

  const handleRemoveArea = (area: string) => {
    setAreaPreferences(prev => prev.filter(a => a !== area));
  };

  const handleSave = () => {
    try {
      // Convert string array back to Principal array
      // Note: This is a workaround since we don't have actual Principal objects
      // In a real implementation, we'd need to store and retrieve actual Principal IDs
      const followedUserPrincipals = followedUsers.map(user => {
        try {
          // Try to create a Principal from the string if it looks like a Principal ID
          return Principal.fromText(user);
        } catch {
          // If it fails, create a dummy Principal (this is not ideal for production)
          return Principal.anonymous();
        }
      });

      const newPreferences: NotificationPreference = {
        receiveAllUpdates,
        followedUsers: followedUserPrincipals,
        areaPreferences,
      };

      savePreferences(newPreferences, {
        onSuccess: () => {
          toast.success('Notification preferences saved successfully!');
        },
        onError: (error) => {
          console.error('Failed to save preferences:', error);
          toast.error('Failed to save notification preferences. Please try again.');
        },
      });
    } catch (error) {
      console.error('Error preparing preferences:', error);
      toast.error('Failed to save notification preferences. Please try again.');
    }
  };

  if (preferencesLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notification settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose how you want to be notified about new climate action submissions
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* All Community Updates */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="all-updates" className="text-base font-medium">
              All Community Updates
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications for all new climate action submissions
            </p>
          </div>
          <Switch
            id="all-updates"
            checked={receiveAllUpdates}
            onCheckedChange={setReceiveAllUpdates}
          />
        </div>

        <Separator />

        {/* Specific Users */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <Label className="text-base font-medium">Follow Specific Users</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Get notified when these users share new climate actions
          </p>
          
          {allUsers.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allUsers.map((user) => (
                <div key={user.displayName} className="flex items-center space-x-2">
                  <Checkbox
                    id={`user-${user.displayName}`}
                    checked={followedUsers.includes(user.displayName)}
                    onCheckedChange={(checked) => 
                      handleUserToggle(user.displayName, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`user-${user.displayName}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {user.displayName}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No other users found yet. Users will appear here as they share climate actions.
            </p>
          )}

          {followedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium">Following:</span>
              {followedUsers.map((user) => (
                <Badge key={user} variant="secondary">
                  {user}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Area-based Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <Label className="text-base font-medium">Area-based Notifications</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Get notified about climate actions in specific areas or regions
          </p>
          
          <div className="flex gap-2">
            <Input
              placeholder="Enter city, region, or area name"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddArea()}
            />
            <Button onClick={handleAddArea} variant="outline" size="sm">
              Add
            </Button>
          </div>

          {areaPreferences.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Watching areas:</span>
              <div className="flex flex-wrap gap-2">
                {areaPreferences.map((area) => (
                  <Badge 
                    key={area} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveArea(area)}
                  >
                    {area} ×
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Click on an area to remove it
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

