import React, { useState, useRef, useEffect } from 'react';
import { Send, StopCircle } from 'lucide-react';

const ChatInput = ({ onSend, isLoading, onStop }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="max-w-3xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              className="w-full resize-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute right-3 bottom-3 text-xs text-slate-400">
              {isLoading ? 'Shift+Enter for new line' : 'Enter to send'}
            </div>
          </div>
          
          {isLoading ? (
            <button
              type="button"
              onClick={onStop}
              className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors"
              title="Stop generation"
            >
              <StopCircle size={20} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white transition-colors"
              title="Send message"
            >
              <Send size={20} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
