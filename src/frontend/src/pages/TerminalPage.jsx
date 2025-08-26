import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

const TerminalPage = () => {
  useEffect(() => {
    const socket = io('http://localhost:5003'); // Connect to the backend WebSocket

    socket.on('connect', () => {
      console.log('Connected to the terminal WebSocket');
    });

    socket.on('terminal_response', (data) => {
      console.log('Terminal response:', data.message);
    });

    return () => {
      socket.disconnect(); // Clean up on component unmount
    };
  }, []);

  return (
    <div>
      <h1>Terminal Interface</h1>
      <p>This is where the terminal interface will be displayed.</p>
    </div>
  );
};

export default TerminalPage;
