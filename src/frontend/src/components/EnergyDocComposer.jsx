import React, { useState, useEffect, useCallback } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { apiService } from '../services/api';
import EnergyMessageComposer, { AssistantMessage } from './EnergyMessageComposer';

const EnergyDocComposer = () => {
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [draft, setDraft] = useState('');
  
  const {
    isSupported: speechSupported,
    isListening,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  const {
    isSupported: ttsSupported,
    isSpeaking,
    speak: speakTTS,
    stop: stopTTS
  } = useTextToSpeech();

  // Load draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem('energyDocDraft');
    if (savedDraft) {
      setDraft(savedDraft);
    }
  }, []);

  // Save draft to localStorage
  useEffect(() => {
    localStorage.setItem('energyDocDraft', draft);
  }, [draft]);

  const handleSendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    setIsSending(true);
    
    const userMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
      inputMode: isListening ? 'dictated' : 'typed'
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await apiService.sendEnergyMessage({
        text,
        inputMode: userMessage.inputMode,
        language: navigator.language || 'en-US'
      });

      const assistantMessage = {
        id: Date.now() + 1,
        text: response.text || "I couldn't generate a response. Please try again.",
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: `Error: ${error.message || 'Failed to get response'}`,
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
      resetTranscript();
    }
  }, [isListening, resetTranscript]);

  const handleStartRecording = useCallback(() => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }
    
    if (speechError) {
      alert(`Speech recognition error: ${speechError}`);
      return;
    }
    
    startListening();
  }, [speechSupported, speechError, startListening]);

  const handleStopRecording = useCallback(() => {
    stopListening();
  }, [stopListening]);

  const handlePlayTTS = useCallback(async (text, onProgress) => {
    if (!ttsSupported) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }
    
    try {
      await speakTTS(text, onProgress);
    } catch (error) {
      console.error('TTS error:', error);
    }
  }, [ttsSupported, speakTTS]);

  const handleStopTTS = useCallback(() => {
    stopTTS();
  }, [stopTTS]);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          message.sender === 'assistant' ? (
            <AssistantMessage
              key={message.id}
              message={message}
              onPlayTTS={handlePlayTTS}
              onStopTTS={handleStopTTS}
              isSpeaking={isSpeaking}
            />
          ) : (
            <div key={message.id} className="flex justify-end">
              <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-blue-500 text-white">
                <p className="whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )
        ))}
      </div>
      
      <EnergyMessageComposer
        onSendMessage={handleSendMessage}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        isRecording={isListening}
        transcript={transcript}
        isSending={isSending}
      />
    </div>
  );
};

export default EnergyDocComposer;
