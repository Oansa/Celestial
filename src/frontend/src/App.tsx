import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useState } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import MapSection from './components/MapSection';
import Footer from './components/Footer';
import AuthSection from './components/AuthSection';
import ProfilePage from './components/ProfilePage';
import ProfileSetupModal from './components/ProfileSetupModal';
import ChatbotPage from './components/ChatbotPage';
import SubmissionsPage from './components/SubmissionsPage';

function AppContent() {
  const { loginStatus, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [currentView, setCurrentView] = useState<'main' | 'profile' | 'chatbot' | 'submissions'>('main');

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Celestial...</p>
        </div>
      </div>
    );
  }

  const isAuthenticated = loginStatus === 'success';
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleViewSubmission = (actionId: string) => {
    // For now, just switch to submissions view
    // In a more advanced implementation, we could scroll to or highlight the specific submission
    setCurrentView('submissions');
  };

  if (currentView === 'profile' && isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onProfileClick={() => setCurrentView('profile')} 
          onChatbotClick={() => setCurrentView('chatbot')}
          onSubmissionsClick={() => setCurrentView('submissions')}
          onHomeClick={() => setCurrentView('main')}
          onViewSubmission={handleViewSubmission}
        />
        <ProfilePage onBack={() => setCurrentView('main')} />
        <Footer />
        <Toaster />
      </div>
    );
  }

  if (currentView === 'chatbot' && isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onProfileClick={() => setCurrentView('profile')} 
          onChatbotClick={() => setCurrentView('chatbot')}
          onSubmissionsClick={() => setCurrentView('submissions')}
          onHomeClick={() => setCurrentView('main')}
          onViewSubmission={handleViewSubmission}
        />
        <ChatbotPage onBack={() => setCurrentView('main')} />
        <Footer />
        <Toaster />
      </div>
    );
  }

  if (currentView === 'submissions' && isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onProfileClick={() => setCurrentView('profile')} 
          onChatbotClick={() => setCurrentView('chatbot')}
          onSubmissionsClick={() => setCurrentView('submissions')}
          onHomeClick={() => setCurrentView('main')}
          onViewSubmission={handleViewSubmission}
        />
        <SubmissionsPage onBack={() => setCurrentView('main')} />
        <Footer />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onProfileClick={() => setCurrentView('profile')} 
        onChatbotClick={() => setCurrentView('chatbot')}
        onSubmissionsClick={() => setCurrentView('submissions')}
        onHomeClick={() => setCurrentView('main')}
        onViewSubmission={handleViewSubmission}
      />
      <main>
        {isAuthenticated ? (
          <>
            <HeroSection />
            <MapSection />
          </>
        ) : (
          <AuthSection />
        )}
      </main>
      <Footer />
      <Toaster />
      {showProfileSetup && <ProfileSetupModal />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppContent />
    </ThemeProvider>
  );
}

