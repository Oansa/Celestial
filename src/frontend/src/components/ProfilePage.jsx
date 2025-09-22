import React, { useState } from 'react';
import { ArrowLeft, Camera, User, Save, Loader2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetCallerUserProfile, useSaveUserProfile, useProfilePhoto } from '../hooks/useQueries';
import { toast } from 'sonner';
import NotificationSettings from './NotificationSettings';

interface ProfilePageProps {
  onBack: () => void;
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { mutate: saveProfile, isPending: isSaving } = useSaveUserProfile();
  const { data: profilePhotoUrl } = useProfilePhoto(userProfile?.profilePhotoPath);

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Update form when profile data loads
  React.useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName);
      setBio(userProfile.bio);
    }
  }, [userProfile]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        toast.error('Please select a JPEG or PNG image');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setProfilePhoto(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    saveProfile(
      {
        displayName: displayName.trim(),
        bio: bio.trim(),
        profilePhoto: profilePhoto || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Profile saved successfully!');
          setProfilePhoto(null);
          setPreviewUrl(null);
        },
        onError: (error) => {
          console.error('Profile save error:', error);
          toast.error('Failed to save profile. Please try again.');
        },
      }
    );
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const currentPhotoUrl = previewUrl || profilePhotoUrl;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 -ml-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Map
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your profile information and notification preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Profile Photo Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={currentPhotoUrl} alt="Profile" />
                      <AvatarFallback className="text-2xl">
                        <User className="w-12 h-12" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-col items-center space-y-2">
                      <Label htmlFor="profile-photo" className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm" asChild>
                          <span>
                            <Camera className="w-4 h-4 mr-2" />
                            {currentPhotoUrl ? 'Change Photo' : 'Add Photo'}
                          </span>
                        </Button>
                      </Label>
                      <Input
                        id="profile-photo"
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        JPEG or PNG, max 5MB
                      </p>
                    </div>
                  </div>

                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="displayName">
                      Display Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      maxLength={50}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      This is how your name will appear to other users
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell others about yourself and your climate action interests..."
                      maxLength={500}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      {bio.length}/500 characters
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

