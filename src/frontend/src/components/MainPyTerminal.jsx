import React, { useState, useEffect, useRef } from 'react';
import terminalService from '../services/terminalService';

const MainPyTerminal = () => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to main.py terminal
    terminalService.connectMainPy();

    // Set up listeners
    terminalService.addListener('mainPy', 'connected', () => {
      setIsConnected(true);
      addMessage('system', 'Connected to main.py terminal server');
    });

    terminalService.addListener('mainPy', 'main_py_started', (event, data) => {
      setIsRunning(data.success);
      if (data.success) {
        addMessage('system', 'main.py started successfully');
      }
    });

    terminalService.addListener('mainPy', 'main_py_stopped', () => {
      setIsRunning(false);
      addMessage('system', 'main.py stopped');
    });

    terminalService.addListener('mainPy', 'output', (event, data) => {
      addMessage(data.type, data.data);
    });

    terminalService.addListener('mainPy', 'disconnected', () => {
      setIsConnected(false);
      addMessage('system', 'Disconnected from main.py terminal server');
    });

    return () => {
      terminalService.removeListener('mainPy', 'connected');
      terminalService.removeListener('mainPy', 'main_py_started');
      terminalService.removeListener('mainPy', 'main_py_stopped');
      terminalService.removeListener('mainPy', 'output');
      terminalService.removeListener('mainPy', 'disconnected');
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

  const handleStartMainPy = () => {
    addMessage('system', 'Starting main.py...');
    terminalService.startMainPy();
  };

  const handleStopMainPy = () => {
    terminalService.stopMainPy();
  };

  return (
    <div className="main-py-terminal" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '500px', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      padding: '15px', 
      backgroundColor: '#1a1a1a', 
      color: '#00ff00', 
      fontFamily: 'Consolas, Monaco, monospace'
    }}>
      <div className="terminal-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '10px',
        paddingBottom: '10px',
        borderBottom: '1px solid #333'
      }}>
        <div className="terminal-title">Main.py Terminal Output</div>
        <div className="terminal-status">
          <span style={{ color: isConnected ? '#00ff00' : '#ff0000' }}>
            {isConnected ? '● Connected' : '○ Disconnected'}
          </span>
          {isRunning && <span style={{ color: '#ffff00', marginLeft: '10px' }}>Running...</span>}
        </div>
      </div>

      <div className="terminal-controls" style={{ marginBottom: '10px' }}>
        <button 
          onClick={handleStartMainPy}
          disabled={!isConnected || isRunning}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            backgroundColor: '#00ff00',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Start main.py
        </button>
        <button 
          onClick={handleStopMainPy}
          disabled={!isConnected || !isRunning}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff0000',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Stop main.py
        </button>
      </div>

      <div className="terminal-messages" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '10px',
        backgroundColor: '#000',
        border: '1px solid #333',
        borderRadius: '4px',
        fontSize: '13px',
        lineHeight: '1.4'
      }}>
        {messages.map((message) => (
          <div key={message.id} style={{ 
            marginBottom: '4px', 
            color: message.type === 'stderr' ? '#ff6b6b' : 
                   message.type === 'system' ? '#00bfff' : '#00ff00',
            whiteSpace: 'pre-wrap'
          }}>
            <span style={{ color: '#666', marginRight: '8px' }}>[{message.timestamp}]</span>
            {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MainPyTerminal;
