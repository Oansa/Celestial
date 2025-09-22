import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useSendChatMessage, useGetChatHistory, useWeatherQuery } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
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
      const formattedMessages: Message[] = chatHistory.map(msg => ({
        id: msg.id,
        sender: msg.sender === 'user' ? 'user' : 'bot',
        content: msg.content,
        timestamp: Number(msg.timestamp),
      }));
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
          content: weatherResponse,
          timestamp: Date.now(),
          isWeatherQuery: true,
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
    } else {
      // Handle non-weather queries with a helpful response
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        content: `Hi ${userProfile?.displayName || 'there'}! I'm your weather assistant. I can help you with weather information, forecasts, and climate data. Try asking me about current weather conditions, forecasts, or historical climate information for your location or any specific place.`,
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

  const isLoading = sendChatMessage.isPending || weatherQuery.isPending;

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
            <h1 className="text-3xl font-bold text-foreground">Weather Chat</h1>
            <p className="text-muted-foreground">
              Ask me about weather conditions, forecasts, and climate information
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
          <CardTitle className="text-lg">Chat with Weather Assistant</CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
            <div className="space-y-4 pb-4">
              {messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-2">👋 Welcome to your weather assistant!</p>
                  <p className="text-sm">Ask me about weather conditions, forecasts, or climate data.</p>
                </div>
              )}
              
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatTimestamp(msg.timestamp)}
                    </p>
                  </div>
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
                placeholder="Ask about weather, forecasts, or climate..."
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
