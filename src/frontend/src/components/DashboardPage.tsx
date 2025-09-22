import { ArrowLeft, Users, Clock, User, Crown, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useGetActiveUsers, useProfilePhoto, useIsCallerAdmin, useToggleUserPremiumStatus } from '../hooks/useQueries';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface DashboardPageProps {
  onBack: () => void;
}

function ActiveUserCard({ user, isAdmin }: { user: any; isAdmin: boolean }) {
  const { data: profileImageUrl } = useProfilePhoto(user.profilePhotoPath);
  const toggleUserPremiumStatus = useToggleUserPremiumStatus();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastActive = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handleStatusToggle = async () => {
    try {
      const newStatus = await toggleUserPremiumStatus.mutateAsync(user.principal);
      
      toast.success(
        `${user.displayName} has been ${newStatus ? 'upgraded to' : 'downgraded from'} premium status`
      );
    } catch (error) {
      toast.error(`Failed to update user status: ${(error as Error).message}`);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            {profileImageUrl ? (
              <AvatarImage src={profileImageUrl} alt={user.displayName} />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.displayName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground truncate">
                {user.displayName}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Active
                </Badge>
                <Badge 
                  variant={user.isPremium ? "default" : "outline"} 
                  className={`flex items-center gap-1 text-xs ${
                    user.isPremium 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-yellow-300 shadow-lg' 
                      : 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'
                  }`}
                >
                  {user.isPremium ? (
                    <>
                      <Crown className="w-3 h-3" />
                      Premium
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3" />
                      Basic
                    </>
                  )}
                </Badge>
              </div>
            </div>
            
            {user.bio && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {user.bio}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Last active {formatLastActive(user.lastActive)}</span>
              </div>
              
              {isAdmin && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Label 
                      htmlFor={`premium-${user.principal.toString()}`} 
                      className={`text-xs font-semibold transition-colors ${
                        user.isPremium 
                          ? 'text-yellow-600 dark:text-yellow-400' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {user.isPremium ? (
                        <span className="flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Premium
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Basic
                        </span>
                      )}
                    </Label>
                    <Switch
                      id={`premium-${user.principal.toString()}`}
                      checked={user.isPremium}
                      onCheckedChange={handleStatusToggle}
                      disabled={toggleUserPremiumStatus.isPending}
                      className={`scale-90 transition-all duration-300 ${
                        user.isPremium 
                          ? 'data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-500 data-[state=checked]:to-orange-500' 
                          : ''
                      }`}
                    />
                  </div>
                  {toggleUserPremiumStatus.isPending && (
                    <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage({ onBack }: DashboardPageProps) {
  const { data: activeUsers = [], isLoading, error } = useGetActiveUsers();
  const { data: isAdmin = false } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading active users...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Unable to load dashboard</h3>
              <p className="text-muted-foreground">
                There was an error loading the active users. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const premiumUsers = activeUsers.filter(user => user.isPremium);
  const basicUsers = activeUsers.filter(user => !user.isPremium);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                Community Dashboard
                {isAdmin && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                    <Shield className="w-3 h-3" />
                    Admin
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground">
                See who's currently active in the Celestial community
                {isAdmin && ' • Manage user premium status with enhanced controls'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Total Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {activeUsers.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {activeUsers.length === 1 ? 'member' : 'members'} currently active
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-yellow-700 dark:text-yellow-300">
                <Crown className="w-5 h-5" />
                Premium Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {premiumUsers.length}
              </div>
              <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80 mt-1">
                premium {premiumUsers.length === 1 ? 'member' : 'members'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Basic Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">
                {basicUsers.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                basic {basicUsers.length === 1 ? 'member' : 'members'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Notice */}
        {isAdmin && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Admin Controls Available
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    You can toggle user premium status using the enhanced switches on each user card. 
                    Premium users get access to funding capabilities and special features. Only administrators can change user account status.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-blue-600 dark:text-blue-400">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>Visual status indicators</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      <span>Premium badge styling</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>Secure role management</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Users List */}
        {activeUsers.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No active users right now</h3>
                <p className="text-muted-foreground">
                  Be the first to start sharing climate actions and engaging with the community!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeUsers.map((user) => (
              <ActiveUserCard 
                key={user.principal.toString()} 
                user={user} 
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
