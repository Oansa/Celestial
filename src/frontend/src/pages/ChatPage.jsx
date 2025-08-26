import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [model, setModel] = useState('llama2');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (prompt) => {
    if (!prompt.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString()
    };

    // Add placeholder assistant message
    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '',
      isStreaming: false,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    try {
      // Use the correct backend API endpoint
      const response = await fetch('http://localhost:5001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          use_voice: false
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update assistant message with AI response
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: data.ai_response || "I couldn't generate a response. Please try again.", isStreaming: false }
            : msg
        ));
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: `Error: ${data.error || 'Unknown error'}`, isStreaming: false }
            : msg
        ));
      }
    } catch (err) {
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: `Error: ${err.message}`, isStreaming: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-5xl mx-auto flex items-center gap-3 p-3">
          <h1 className="text-xl font-bold tracking-wide font-orbitron">Celestial</h1>
          <span className="text-slate-400">·</span>
          <select 
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
            value={model} 
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="llama2">Llama 2</option>
            <option value="llama2:7b">Llama 2 7B</option>
            <option value="mistral">Mistral</option>
            <option value="codellama">CodeLlama</option>
          </select>
          <button 
            className="ml-auto text-sm text-slate-300 hover:text-white"
            onClick={() => setMessages([])}
          >
            New Chat
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-3 py-6 flex flex-col">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role}
              content={message.content}
              isStreaming={message.isStreaming}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatPage;
