import React from 'react';
import MainPyTerminal from '../components/MainPyTerminal';

const TerminalPage = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Main.py Terminal Output</h1>
      <p>Real-time terminal output from your main.py execution</p>
      
      <div style={{ marginTop: '20px' }}>
        <MainPyTerminal />
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Usage Instructions:</h3>
        <ul>
          <li>Start the backend terminal server: <code>python backend_main_terminal.py</code></li>
          <li>Click "Start main.py" to begin execution and see real-time output</li>
          <li>Watch the terminal output stream in real-time</li>
          <li>Use "Stop main.py" to terminate the process</li>
        </ul>
      </div>
    </div>
  );
};

export default TerminalPage;
