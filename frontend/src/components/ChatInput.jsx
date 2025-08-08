import React, { useState, useRef, useEffect } from 'react';

export const ChatInput = ({ onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef(null);

  // Calculate textarea height based on content
  const calculateHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 24; // Approximate line height in pixels
      const maxHeight = lineHeight * 7; // 7 lines max
      const newHeight = Math.min(scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    calculateHeight();
  }, [inputText]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleMicrophoneClick = () => {
    console.log('Microphone clicked - voice recording functionality to be added');
    // Placeholder for voice recording functionality
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Ask Energy Doc anything..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <div className="chat-controls">
            <button
              type="button"
              className="microphone-button"
              onClick={handleMicrophoneClick}
              aria-label="Voice input"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 1C10.8954 1 10 1.89543 10 3V12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12V3C14 1.89543 13.1046 1 12 1Z"
                  fill="currentColor"
                />
                <path
                  d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10C5 9.44772 4.55228 9 4 9C3.44772 9 3 9.44772 3 10V12C3 16.971 7.02901 21 12 21C16.971 21 21 16.971 21 12V10C21 9.44772 20.5523 9 20 9C19.4477 9 19 9.44772 19 10Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              type="submit"
              className="send-button"
              aria-label="Send message"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 2L11 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
