import { Leaf, LogOut, User, Settings, MessageCircle, Home, List, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetNotifications } from '../hooks/useQueries';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useQueryClient } from '@tanstack/react-query';
import NotificationPanel from './NotificationPanel';

interface HeaderProps {
  onProfileClick?: () => void;
  onChatbotClick?: () => void;
  onSubmissionsClick?: () => void;
  onHomeClick?: () => void;
  onViewSubmission?: (actionId: string) => void;
}

export default function Header({ 
  onProfileClick, 
  onChatbotClick, 
  onSubmissionsClick, 
  onHomeClick,
  onViewSubmission 
}: HeaderProps) {
  const { loginStatus, clear, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: notifications = [] } = useGetNotifications();
  const queryClient = useQueryClient();
  const isAuthenticated = loginStatus === 'success';

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    clear();
    queryClient.clear();
  };

  const getPrincipalId = () => {
    if (!identity) return '';
    const principal = identity.getPrincipal().toString();
    return `${principal.slice(0, 8)}...${principal.slice(-4)}`;
  };

  const getDisplayName = () => {
    if (userProfile?.displayName) {
      return userProfile.displayName;
    }
    return getPrincipalId();
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Celestial</h1>
              <p className="text-sm text-muted-foreground">Share evidence of climate action worldwide</p>
            </div>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-4">
              {/* Navigation buttons */}
              <div className="flex items-center gap-2">
                {onHomeClick && (
                  <Button variant="ghost" size="sm" onClick={onHomeClick} className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">Home</span>
                  </Button>
                )}
                {onSubmissionsClick && (
                  <Button variant="ghost" size="sm" onClick={onSubmissionsClick} className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">Submissions</span>
                  </Button>
                )}
                {onChatbotClick && (
                  <Button variant="ghost" size="sm" onClick={onChatbotClick} className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Weather Chat</span>
                  </Button>
                )}
              </div>

              {/* Notifications */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-4 h-4" />
                    {unreadNotificationCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
                      >
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <NotificationPanel onViewSubmission={onViewSubmission} />
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{getDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onProfileClick && (
                    <>
                      <DropdownMenuItem onClick={onProfileClick}>
                        <Settings className="w-4 h-4 mr-2" />
                        Profile & Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

