import React, { useState, useCallback } from 'react';
import { Mic, Send, Square } from 'lucide-react';

export const AssistantMessage = ({ message, onPlayTTS, onStopTTS }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = useCallback(async () => {
    if (isPlaying) {
      onStopTTS();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await onPlayTTS(message.text, () => setIsPlaying(false));
    }
  }, [isPlaying, onPlayTTS, onStopTTS, message.text]);

  return (
    <div className="flex justify-start">
      <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800">
        <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">{message.text}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
          <button
            onClick={handlePlay}
            className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            title={isPlaying ? 'Stop' : 'Play'}
          >
            {isPlaying ? (
              <Square className="w-4 h-4 text-red-500" />
            ) : (
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4v12l10-6L5 4z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const EnergyMessageComposer = ({ 
  onSendMessage, 
  onStartRecording, 
  onStopRecording, 
  isRecording, 
  transcript, 
  isSending 
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const textToSend = transcript || inputText;
    if (textToSend.trim()) {
      onSendMessage(textToSend);
      setInputText('');
    }
  }, [onSendMessage, transcript, inputText]);

  const handleRecording = useCallback(() => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  }, [isRecording, onStartRecording, onStopRecording]);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-3 pb-2">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <button
          type="button"
          onClick={handleRecording}
          className={`p-2 rounded-full transition-colors ${
            isRecording 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <Square className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
        
        <div className="flex-1">
          {transcript && !isRecording && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Transcript: {transcript}
            </div>
          )}
          <div className="flex items-center bg-white border border-gray-300 rounded-full p-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isRecording ? "Listening..." : "Ask anything..."}
              className="flex-1 bg-transparent border-none text-gray-900 placeholder-gray-500 focus:outline-none px-4 py-2"
              disabled={isRecording || isSending}
            />
            <button
              type="submit"
              disabled={isSending || (!transcript && !inputText.trim())}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
      
      {isRecording && (
        <div className="mt-2 text-sm text-center text-red-500 animate-pulse">
          Recording... Speak now
        </div>
      )}
    </div>
  );
};

export default EnergyMessageComposer;
