import { Leaf, LogOut, User, Settings, MessageCircle, Home, List, Bell, Users } from 'lucide-react';
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
  onDashboardClick?: () => void;
  onHomeClick?: () => void;
  onViewSubmission?: (actionId: string) => void;
}

export default function Header({ 
  onProfileClick, 
  onChatbotClick, 
  onSubmissionsClick, 
  onDashboardClick,
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
    <header className="border-b bg-gradient-to-r from-background via-background to-sky-50/30 dark:to-forest-900/20 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 transition-all-smooth">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 animate-fade-in-up">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-forest shadow-nature hover-glow transition-all-smooth animate-gentle-bounce">
              <Leaf className="w-7 h-7 text-white animate-leaf-sway" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-forest-600 to-ocean-600 bg-clip-text text-transparent">
                Celestial
              </h1>
              <p className="text-sm text-muted-foreground">Share evidence of climate action worldwide</p>
            </div>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-4 animate-slide-in-right">
              {/* Navigation buttons */}
              <div className="flex items-center gap-2">
                {onHomeClick && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onHomeClick} 
                    className="flex items-center gap-2 hover-lift transition-all-smooth hover:bg-forest-50 dark:hover:bg-forest-900/20"
                  >
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">Home</span>
                  </Button>
                )}
                {onDashboardClick && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onDashboardClick} 
                    className="flex items-center gap-2 hover-lift transition-all-smooth hover:bg-ocean-50 dark:hover:bg-ocean-900/20"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                )}
                {onSubmissionsClick && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onSubmissionsClick} 
                    className="flex items-center gap-2 hover-lift transition-all-smooth hover:bg-earth-50 dark:hover:bg-earth-900/20"
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">Submissions</span>
                  </Button>
                )}
                {onChatbotClick && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onChatbotClick} 
                    className="flex items-center gap-2 hover-lift transition-all-smooth hover:bg-sky-50 dark:hover:bg-sky-900/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Weather Chat</span>
                  </Button>
                )}
              </div>

              {/* Notifications */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative hover-scale transition-all-smooth hover:bg-forest-50 dark:hover:bg-forest-900/20"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotificationCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center animate-pulse-glow"
                      >
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0 border-forest-200 dark:border-forest-800 shadow-nature-lg">
                  <NotificationPanel onViewSubmission={onViewSubmission} />
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2 hover-lift transition-all-smooth border-forest-200 dark:border-forest-800 hover:border-forest-300 dark:hover:border-forest-700 hover:shadow-nature"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{getDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-forest-200 dark:border-forest-800 shadow-nature-lg">
                  {onProfileClick && (
                    <>
                      <DropdownMenuItem 
                        onClick={onProfileClick}
                        className="hover:bg-forest-50 dark:hover:bg-forest-900/20 transition-colors-smooth"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Profile & Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-forest-200 dark:bg-forest-800" />
                    </>
                  )}
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-destructive hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors-smooth"
                  >
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
