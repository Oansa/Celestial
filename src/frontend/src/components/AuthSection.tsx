import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Leaf, Shield, Globe, Users, AlertCircle, Crown, Wallet, Star, Heart, TreePine, Droplets, Wind, Quote } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

const mockReviews = [
  {
    name: "Sarah Chen",
    location: "Vancouver, Canada",
    review: "Celestial helped me document our community tree planting initiative and connect with other environmental advocates worldwide. The funding feature is a game-changer!",
    rating: 5,
    action: "Tree Planting"
  },
  {
    name: "Miguel Rodriguez",
    location: "São Paulo, Brazil",
    review: "I've been tracking our beach cleanup efforts for 6 months now. The global map shows how our local actions contribute to worldwide environmental impact.",
    rating: 5,
    action: "Beach Cleanup"
  },
  {
    name: "Aisha Patel",
    location: "Mumbai, India",
    review: "The platform made it easy to share our solar panel installation project and inspire others in our region to adopt renewable energy solutions.",
    rating: 5,
    action: "Solar Energy"
  },
  {
    name: "Emma Thompson",
    location: "London, UK",
    review: "Love how secure and private the platform is while still allowing meaningful connections with fellow climate activists. The community is incredibly supportive!",
    rating: 5,
    action: "Awareness Campaign"
  }
];

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
    <section className="relative py-20 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30 min-h-screen flex items-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-emerald-300/20 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-teal-200/25 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-green-300/30 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative container mx-auto px-4 z-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mx-auto mb-8 shadow-2xl animate-gentle-bounce">
              <Leaf className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 animate-fade-in-up">
              Get funding for your climate change endeavours
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Join our global community documenting climate action activities. Share photos with location data, 
              connect with fellow advocates, and secure funding for your environmental initiatives.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                <TreePine className="w-4 h-4 mr-2" />
                Document Impact
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                <Droplets className="w-4 h-4 mr-2" />
                Global Community
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700">
                <Wind className="w-4 h-4 mr-2" />
                Secure Funding
              </Badge>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-black border-2 border-green-400 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">Global Impact Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-white leading-relaxed">
                  Document climate actions from around the world and see the collective impact on our interactive map. 
                  Every action counts towards global environmental change.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-black border-2 border-green-400 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-white leading-relaxed">
                  Your identity is protected with Internet Computer's secure authentication system. 
                  Share your impact while maintaining complete privacy and control.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-black border-2 border-green-400 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: '1s' }}>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-white leading-relaxed">
                  Join a community of environmental advocates sharing evidence of positive climate action. 
                  Connect, collaborate, and amplify your impact together.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* User Reviews Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 mb-12 animate-fade-in-up">
              What Our Community Says
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {mockReviews.map((review, index) => (
                <Card key={index} className="bg-black border-2 border-green-400 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${1.2 + index * 0.2}s` }}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12 border-2 border-green-200">
                        <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-500 text-white font-semibold">
                          {review.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white">{review.name}</h4>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            {review.action}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{review.location}</p>
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <div className="relative">
                          <Quote className="w-4 h-4 text-gray-400 absolute -top-1 -left-1" />
                          <p className="text-sm text-white italic pl-4 leading-relaxed">
                            {review.review}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Premium Upgrade Advertisement */}
          <Card className="bg-gradient-to-r from-yellow-100 via-orange-100 to-yellow-100 dark:from-yellow-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 border-2 border-yellow-300 dark:border-yellow-700 mb-12 shadow-2xl animate-fade-in-up" style={{ animationDelay: '2s' }}>
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl text-yellow-800 dark:text-yellow-200">
                <Crown className="w-8 h-8 animate-gentle-bounce" />
                Unlock Premium Features
                <Crown className="w-8 h-8 animate-gentle-bounce" style={{ animationDelay: '0.5s' }} />
              </CardTitle>
              <CardDescription className="text-lg text-yellow-700 dark:text-yellow-300 font-medium">
                Transform your climate actions into funded initiatives
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3 text-3xl font-bold text-yellow-800 dark:text-yellow-200">
                <Wallet className="w-8 h-8" />
                Premium for 0.0001 BTC
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm max-w-2xl mx-auto">
                <div className="flex items-center gap-3 text-white bg-black border-2 border-green-400 p-3 rounded-lg">
                  <Star className="w-5 h-5 shrink-0" />
                  <span>Request funding with wallet addresses</span>
                </div>
                <div className="flex items-center gap-3 text-white bg-black border-2 border-green-400 p-3 rounded-lg">
                  <Star className="w-5 h-5 shrink-0" />
                  <span>Receive crypto donations directly</span>
                </div>
                <div className="flex items-center gap-3 text-white bg-black border-2 border-green-400 p-3 rounded-lg">
                  <Star className="w-5 h-5 shrink-0" />
                  <span>Support your climate initiatives</span>
                </div>
                <div className="flex items-center gap-3 text-white bg-black border-2 border-green-400 p-3 rounded-lg">
                  <Star className="w-5 h-5 shrink-0" />
                  <span>Premium member badge & recognition</span>
                </div>
              </div>
              
              <Badge variant="secondary" className="bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200 px-4 py-2 text-sm font-medium">
                Contact admin after sign-in to upgrade
              </Badge>
            </CardContent>
          </Card>

          {/* Sign In Card */}
          <Card className="bg-black border-2 border-green-400 shadow-2xl max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '2.2s' }}>
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl text-white">
                Join Celestial Today
              </CardTitle>
              <CardDescription className="text-gray-300">
                Secure authentication powered by Internet Computer
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {hasError && (
                <Alert variant="destructive" className="text-left">
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
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {isLoggingIn ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Signing In...
                  </>
                ) : hasError ? (
                  'Try Again'
                ) : (
                  <>
                    <Heart className="w-5 h-5 mr-2" />
                    Start Your Climate Journey
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-400 leading-relaxed">
                New to Internet Identity? You'll be guided through a quick, secure setup process. 
                Your privacy and security are our top priorities.
              </p>
              
              {hasError && (
                <p className="text-xs text-gray-400">
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
