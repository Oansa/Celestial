import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const TerminalChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5002');

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      addMessage('system', 'Connected to terminal server');
    });

    socketRef.current.on('connected', (data) => {
      addMessage('system', `Connected to terminal session: ${data.session_id}`);
    });

    socketRef.current.on('terminal_output', (data) => {
      addMessage(data.type, data.data);
    });

    socketRef.current.on('command_started', (data) => {
      setIsRunning(data.success);
      if (data.success) {
        addMessage('system', `Started command: ${data.command}`);
      }
    });

    socketRef.current.on('command_stopped', () => {
      setIsRunning(false);
      addMessage('system', 'Command stopped');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      addMessage('system', 'Disconnected from terminal server');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (type, text) => {
    setMessages(prev => [...prev, { 
      id: Date.now() + Math.random(), 
      type, 
      text, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const handleSendCommand = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current) return;

    addMessage('user', `$ ${inputText}`);

    socketRef.current.emit('start_command', {
      command: inputText,
      cwd: '/'
    });
    
    socketRef.current.emit('start_output_stream');
    setInputText('');
  };

  return (
    <div className="terminal-chat-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '400px', 
      border: '1px solid #ccc', 
      borderRadius: '4px', 
      padding: '10px', 
      backgroundColor: '#000', 
      color: '#0f0', 
      fontFamily: 'monospace', 
      overflow: 'hidden' 
    }}>
      <div className="terminal-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '10px' 
      }}>
        <div className="terminal-title">Terminal Output</div>
        <div className="terminal-status">
          <span style={{ color: isConnected ? '#0f0' : '#f00' }}>
            {isConnected ? '● Connected' : '○ Disconnected'}
          </span>
          {isRunning && <span style={{ color: '#ff0', marginLeft: '10px' }}>Running...</span>}
        </div>
      </div>

      <div className="terminal-messages" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        marginBottom: '10px',
        padding: '5px',
        backgroundColor: '#111'
      }}>
        {messages.map((message) => (
          <div key={message.id} style={{ 
            marginBottom: '4px', 
            color: message.type === 'stderr' ? '#f00' : 
                   message.type === 'system' ? '#0ff' : '#0f0',
            fontSize: '13px'
          }}>
            {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendCommand} style={{ display: 'flex' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter command..."
          style={{ 
            flex: 1, 
            padding: '8px', 
            fontSize: '13px', 
            fontFamily: 'monospace',
            backgroundColor: '#222',
            color: '#0f0',
            border: '1px solid #333'
          }}
        />
        <button 
          type="submit" 
          disabled={!isConnected || !inputText.trim()}
          style={{ 
            padding: '8px 16px', 
            marginLeft: '8px',
            backgroundColor: '#0f0',
            color: '#000',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default TerminalChat;
