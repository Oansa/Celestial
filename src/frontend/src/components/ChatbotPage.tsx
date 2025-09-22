import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, MapPin, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSendChatMessage, useGetChatHistory, useWeatherQuery, usePlatformDataQuery, useVoteWeatherReport, useGetWeatherReportVotes, useGetUserVoteStatus } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { VoteType } from '../backend';
import { toast } from 'sonner';

interface ChatbotPageProps {
  onBack: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: number;
  isWeatherQuery?: boolean;
  reportId?: string;
}

interface WeatherReportCardProps {
  reportId: string;
  content: string;
  timestamp: number;
}

function WeatherReportCard({ reportId, content, timestamp }: WeatherReportCardProps) {
  const { data: votes } = useGetWeatherReportVotes(reportId);
  const { data: userVote } = useGetUserVoteStatus(reportId);
  const voteWeatherReport = useVoteWeatherReport();

  const handleVote = async (voteType: VoteType) => {
    try {
      await voteWeatherReport.mutateAsync({ reportId, voteType });
      toast.success(`Vote ${voteType === VoteType.upvote ? 'up' : 'down'} recorded!`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already voted')) {
        toast.error('You have already voted on this weather report');
      } else {
        toast.error('Failed to record vote. Please try again.');
      }
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-[85%] bg-muted rounded-lg p-4 break-words">
      <div className="whitespace-pre-wrap text-muted-foreground mb-3 break-words overflow-wrap-anywhere">
        {content}
      </div>
      
      <Separator className="my-3" />
      
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant={userVote === VoteType.upvote ? "default" : "outline"}
              size="sm"
              onClick={() => handleVote(VoteType.upvote)}
              disabled={voteWeatherReport.isPending}
              className="flex items-center gap-1"
            >
              <ThumbsUp className="w-3 h-3" />
              <span>{votes ? Number(votes.upvotes) : 0}</span>
            </Button>
            
            <Button
              variant={userVote === VoteType.downvote ? "default" : "outline"}
              size="sm"
              onClick={() => handleVote(VoteType.downvote)}
              disabled={voteWeatherReport.isPending}
              className="flex items-center gap-1"
            >
              <ThumbsDown className="w-3 h-3" />
              <span>{votes ? Number(votes.downvotes) : 0}</span>
            </Button>
          </div>
          
          {userVote && (
            <Badge variant="secondary" className="text-xs">
              You voted {userVote === VoteType.upvote ? 'up' : 'down'}
            </Badge>
          )}
        </div>
        
        <p className="text-xs opacity-70">
          {formatTimestamp(timestamp)}
        </p>
      </div>
    </div>
  );
}

export default function ChatbotPage({ onBack }: ChatbotPageProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: chatHistory } = useGetChatHistory();
  const sendChatMessage = useSendChatMessage();
  const weatherQuery = useWeatherQuery();
  const platformDataQuery = usePlatformDataQuery();

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
        }
      );
    }
  }, []);

  // Load chat history
  useEffect(() => {
    if (chatHistory) {
      const formattedMessages: Message[] = chatHistory.map(msg => {
        // Check if this is a weather report by looking for weather report ID in the message
        const reportIdMatch = msg.content.match(/\[REPORT_ID:([^\]]+)\]/);
        const isWeatherReport = msg.sender === 'bot' && !!reportIdMatch;
        
        return {
          id: msg.id,
          sender: msg.sender === 'user' ? 'user' : 'bot',
          content: isWeatherReport ? msg.content.replace(/\[REPORT_ID:[^\]]+\]/, '').trim() : msg.content,
          timestamp: Number(msg.timestamp),
          isWeatherQuery: isWeatherReport,
          reportId: reportIdMatch ? reportIdMatch[1] : undefined,
        };
      });
      setMessages(formattedMessages);
    }
  }, [chatHistory]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const isWeatherQuery = (text: string): boolean => {
    const weatherKeywords = [
      'weather', 'temperature', 'forecast', 'rain', 'sunny', 'cloudy', 'wind',
      'humidity', 'climate', 'hot', 'cold', 'warm', 'cool', 'storm', 'snow'
    ];
    return weatherKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
  };

  const isPlatformDataQuery = (text: string): boolean => {
    const platformKeywords = [
      'submission', 'action', 'activity', 'user', 'profile', 'member', 'community',
      'tree', 'plant', 'cleanup', 'clean', 'renewable', 'energy', 'solar', 'wind',
      'location', 'where', 'place', 'recent', 'latest', 'new', 'statistic', 'total',
      'count', 'how many', 'show me', 'find', 'search'
    ];
    return platformKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: message.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Save user message to backend
    try {
      await sendChatMessage.mutateAsync({
        id: userMessage.id,
        sender: 'user',
        content: userMessage.content,
        timestamp: BigInt(userMessage.timestamp),
      });
    } catch (error) {
      console.error('Failed to save user message:', error);
    }

    const userQuery = message.trim();
    setMessage('');

    // Check if it's a weather-related query
    if (isWeatherQuery(userQuery)) {
      try {
        const weatherResponse = await weatherQuery.mutateAsync({
          query: userQuery,
          location: userLocation,
        });

        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          content: weatherResponse.content,
          timestamp: Date.now(),
          isWeatherQuery: !!weatherResponse.reportId,
          reportId: weatherResponse.reportId || undefined,
        };

        setMessages(prev => [...prev, botMessage]);

        // Save bot response to backend with report ID if available
        const contentToSave = weatherResponse.reportId 
          ? `${weatherResponse.content} [REPORT_ID:${weatherResponse.reportId}]`
          : weatherResponse.content;

        await sendChatMessage.mutateAsync({
          id: botMessage.id,
          sender: 'bot',
          content: contentToSave,
          timestamp: BigInt(botMessage.timestamp),
        });
      } catch (error) {
        console.error('Weather query failed:', error);
        const errorMessage: Message = {
          id: `bot-error-${Date.now()}`,
          sender: 'bot',
          content: 'Sorry, I encountered an error while fetching weather information. Please try again later.',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMessage]);
        toast.error('Failed to fetch weather data');
      }
    }
    // Check if it's a platform data query
    else if (isPlatformDataQuery(userQuery)) {
      try {
        const platformResponse = await platformDataQuery.mutateAsync(userQuery);

        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          content: platformResponse.content,
          timestamp: Date.now(),
        };

        setMessages(prev => [...prev, botMessage]);

        // Save bot response to backend
        await sendChatMessage.mutateAsync({
          id: botMessage.id,
          sender: 'bot',
          content: botMessage.content,
          timestamp: BigInt(botMessage.timestamp),
        });
      } catch (error) {
        console.error('Platform data query failed:', error);
        const errorMessage: Message = {
          id: `bot-error-${Date.now()}`,
          sender: 'bot',
          content: 'Sorry, I encountered an error while searching platform data. Please try again later.',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMessage]);
        toast.error('Failed to search platform data');
      }
    }
    // Handle general queries with helpful response
    else {
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        content: `Hi ${userProfile?.displayName || 'there'}! I'm your climate assistant. I can help you with:\n\n🌤️ **Weather Information:**\n• Current weather conditions\n• Weather forecasts\n• Climate data for any location\n\n🌍 **Platform Data:**\n• Climate action submissions\n• User profiles and activities\n• Community statistics\n• Recent submissions\n\nTry asking me about weather conditions, or explore our community's climate actions by asking about tree planting, cleanup activities, renewable energy projects, or recent submissions!`,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMessage]);

      // Save bot response to backend
      try {
        await sendChatMessage.mutateAsync({
          id: botMessage.id,
          sender: 'bot',
          content: botMessage.content,
          timestamp: BigInt(botMessage.timestamp),
        });
      } catch (error) {
        console.error('Failed to save bot message:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isLoading = sendChatMessage.isPending || weatherQuery.isPending || platformDataQuery.isPending;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
        
        <div className="flex items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Climate Assistant</h1>
            <p className="text-muted-foreground">
              Ask me about weather, climate data, and community activities
            </p>
          </div>
          {userLocation && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Location detected
            </Badge>
          )}
        </div>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Chat with Climate Assistant</CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
            <div className="space-y-4 pb-4">
              {messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-2">🌍 Welcome to your climate assistant!</p>
                  <p className="text-sm">Ask me about weather, climate actions, or community activities.</p>
                </div>
              )}
              
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'user' ? (
                    <div className="max-w-[85%] bg-primary text-primary-foreground rounded-lg px-4 py-2 break-words">
                      <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTimestamp(msg.timestamp)}
                      </p>
                    </div>
                  ) : msg.isWeatherQuery && msg.reportId ? (
                    <WeatherReportCard
                      reportId={msg.reportId}
                      content={msg.content}
                      timestamp={msg.timestamp}
                    />
                  ) : (
                    <div className="max-w-[85%] bg-muted text-muted-foreground rounded-lg px-4 py-2 break-words">
                      <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTimestamp(msg.timestamp)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-lg px-4 py-2 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about weather, climate actions, or community data..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
