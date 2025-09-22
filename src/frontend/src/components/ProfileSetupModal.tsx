import React, { useState } from 'react';
import { User, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSaveUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const [displayName, setDisplayName] = useState('');
  const { mutate: saveProfile, isPending: isSaving } = useSaveUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    saveProfile(
      {
        displayName: displayName.trim(),
        bio: '',
      },
      {
        onSuccess: () => {
          toast.success('Welcome to Celestial!');
        },
        onError: (error) => {
          console.error('Profile setup error:', error);
          toast.error('Failed to set up profile. Please try again.');
        },
      }
    );
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Welcome to Celestial!
          </DialogTitle>
          <DialogDescription>
            Let's set up your profile to get started. You can always update this later.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              This is how your name will appear to other users
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Get Started
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
