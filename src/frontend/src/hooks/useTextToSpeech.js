import { useState, useEffect, useCallback } from 'react';

export const useTextToSpeech = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Check if browser supports SpeechSynthesis
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speak = useCallback(async (text, onProgress) => {
    if (!isSupported) {
      throw new Error('Text-to-speech is not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      if (!text.trim()) {
        reject(new Error('No text provided'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        if (onProgress) onProgress(0);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onProgress) onProgress(1);
        resolve();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      utterance.onboundary = (event) => {
        if (onProgress && event.name === 'word') {
          const progress = event.charIndex / text.length;
          onProgress(progress);
        }
      };

      speechSynthesis.speak(utterance);
    });
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    isSupported,
    isSpeaking,
    speak,
    stop
  };
};
