import { useState, useRef, useCallback } from 'react';

export const useSSE = () => {
  const [text, setText] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [chunks, setChunks] = useState([]);
  const eventSourceRef = useRef(null);
  const abortControllerRef = useRef(null);

  const start = useCallback(async (url, options = {}) => {
    // Reset state
    setText('');
    setIsRunning(true);
    setError(null);
    setChunks([]);
    
    // Stop any existing stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      if (options.method === 'POST' && options.body) {
        // Handle POST requests with fetch and ReadableStream
        abortControllerRef.current = new AbortController();
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(options.body),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const data = line.slice(5).trim();
              if (data === '[DONE]') {
                setIsRunning(false);
                return;
              }
              if (data.startsWith('ERROR:')) {
                setError(data.slice(6));
                setIsRunning(false);
                return;
              }
              if (data) {
                setText(prev => prev + data);
                setChunks(prev => [...prev, data]);
              }
            }
          }
        }
      } else {
        // Handle GET requests with EventSource
        eventSourceRef.current = new EventSource(url);
        
        eventSourceRef.current.onmessage = (event) => {
          if (event.data === '[DONE]') {
            setIsRunning(false);
            eventSourceRef.current?.close();
            return;
          }
          if (event.data.startsWith('ERROR:')) {
            setError(event.data.slice(6));
            setIsRunning(false);
            eventSourceRef.current?.close();
            return;
          }
          setText(prev => prev + event.data);
          setChunks(prev => [...prev, event.data]);
        };

        eventSourceRef.current.onerror = (err) => {
          setError('Connection error');
          setIsRunning(false);
          eventSourceRef.current?.close();
        };
      }
    } catch (err) {
      setError(err.message);
      setIsRunning(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  return {
    start,
    stop,
    isRunning,
    text,
    chunks,
    error,
  };
};
