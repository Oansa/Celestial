import React from 'react';
import { format } from 'date-fns';

export const ChatDisplay = ({ messages, isLoading }) => {
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  return (
    <div className="chat-display-container">
      <div className="chat-messages">
        {messages.length === 0 && !isLoading && (
          <div className="chat-empty-state">
            <p>Ask Energy Doc anything about Mars energy potential...</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${message.sender}`}
          >
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              <div className="message-time">
                {formatMessageTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="chat-message ai loading">
            <div className="message-content">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={scrollRef} />
      </div>
    </div>
  );
};
