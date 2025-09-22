import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Leaf, Shield, Globe, Users, AlertCircle } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

export default function AuthSection() {
  const { login, loginStatus, loginError, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  
  const isLoggingIn = loginStatus === 'logging-in';
  const hasError = loginStatus === 'loginError';

  const handleLogin = async () => {
    try {
      // Clear any previous errors
      if (hasError) {
        await clear();
        queryClient.clear();
        // Small delay to ensure state is cleared
        setTimeout(() => {
          login();
        }, 100);
      } else {
        login();
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const getErrorMessage = () => {
    if (!loginError) return 'An unexpected error occurred during sign in.';
    
    const errorMessage = loginError.message;
    
    // Handle specific error cases with user-friendly messages
    if (errorMessage.includes('User is already authenticated')) {
      return 'You are already signed in. Please refresh the page if you\'re having issues.';
    }
    
    if (errorMessage.includes('AuthClient is not initialized')) {
      return 'Authentication system is still loading. Please wait a moment and try again.';
    }
    
    if (errorMessage.includes('Login failed') || errorMessage.includes('UserInterrupt')) {
      return 'Sign in was cancelled or failed. Please try again.';
    }
    
    return errorMessage;
  };

  return (
    <section className="relative py-16 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 min-h-[80vh] flex items-center">
      <div className="absolute inset-0 bg-[url('/assets/generated/climate-hero-banner.jpg')] bg-cover bg-center opacity-10" />
      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary mx-auto mb-6">
              <Leaf className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Welcome to Celestial
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join our global community documenting climate action activities. 
              Share photos with location data to build a worldwide map of environmental initiatives.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-background/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <Globe className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Global Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Document climate actions from around the world and see the collective impact on our interactive map.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-background/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Your identity is protected with Internet Computer's secure authentication system.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-background/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Join a community of environmental advocates sharing evidence of positive climate action.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-background/90 backdrop-blur-sm border-2 max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Sign In to Celestial
              </CardTitle>
              <CardDescription>
                Secure authentication powered by Internet Computer
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {hasError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {getErrorMessage()}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                size="lg"
                className="w-full"
              >
                {isLoggingIn ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </>
                ) : hasError ? (
                  'Try Again'
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground">
                New to Internet Identity? You'll be guided through a quick setup process.
              </p>
              
              {hasError && (
                <p className="text-xs text-muted-foreground">
                  Having trouble? Try refreshing the page or clearing your browser cache.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
