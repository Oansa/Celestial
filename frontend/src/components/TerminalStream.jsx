import React, { useEffect, useState, useRef } from 'react';
import { useSSE } from '../hooks/useSSE';

const TerminalStream = ({ url, onDone, className = "" }) => {
  const [text, setText] = useState("");
  const [running, setRunning] = useState(false);
  const { start, stop, isRunning, text: streamText, error } = useSSE();
  const endRef = useRef(null);

  useEffect(() => {
    if (url) {
      setText("");
      setRunning(true);
      start(url);
    }
  }, [url, start]);

  useEffect(() => {
    setText(streamText);
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    
    if (!isRunning && streamText) {
      setRunning(false);
      onDone?.();
    }
  }, [streamText, isRunning, onDone]);

  useEffect(() => {
    if (error) {
      setText(prev => prev + `\nERROR: ${error}`);
      setRunning(false);
    }
  }, [error]);

  const handleStop = () => {
    stop();
    setRunning(false);
  };

  return (
    <div className={`bg-black text-green-400 font-mono p-4 rounded-lg ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-slate-400">Terminal Output</span>
        {running && (
          <button
            onClick={handleStop}
            className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded"
          >
            Stop
          </button>
        )}
      </div>
      <div className="whitespace-pre-wrap overflow-auto max-h-96">
        {text || (running ? "Running..." : "Idle")}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default TerminalStream;
