import io from 'socket.io-client';

class TerminalService {
  constructor() {
    this.sockets = {
      terminal: null,
      mainPy: null
    };
    this.listeners = {
      terminal: [],
      mainPy: []
    };
  }

  connectTerminal() {
    if (this.sockets.terminal) return;
    
    this.sockets.terminal = io('http://localhost:5002');
    
    this.sockets.terminal.on('connect', () => {
      this.notifyListeners('terminal', 'connected', { status: 'connected' });
    });

    this.sockets.terminal.on('disconnect', () => {
      this.notifyListeners('terminal', 'disconnected', { status: 'disconnected' });
    });

    this.sockets.terminal.on('terminal_output', (data) => {
      this.notifyListeners('terminal', 'output', data);
    });

    this.sockets.terminal.on('command_started', (data) => {
      this.notifyListeners('terminal', 'command_started', data);
    });

    this.sockets.terminal.on('command_stopped', (data) => {
      this.notifyListeners('terminal', 'command_stopped', data);
    });
  }

  connectMainPy() {
    if (this.sockets.mainPy) return;
    
    this.sockets.mainPy = io('http://localhost:5003');
    
    this.sockets.mainPy.on('connect', () => {
      this.notifyListeners('mainPy', 'connected', { status: 'connected' });
    });

    this.sockets.mainPy.on('disconnect', () => {
      this.notifyListeners('mainPy', 'disconnected', { status: 'disconnected' });
    });

    this.sockets.mainPy.on('terminal_output', (data) => {
      this.notifyListeners('mainPy', 'output', data);
    });

    this.sockets.mainPy.on('main_py_started', (data) => {
      this.notifyListeners('mainPy', 'main_py_started', data);
    });

    this.sockets.mainPy.on('main_py_stopped', (data) => {
      this.notifyListeners('mainPy', 'main_py_stopped', data);
    });
  }

  addListener(type, callback) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(callback);
  }

  removeListener(type, callback) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
  }

  notifyListeners(type, event, data) {
    if (!this.listeners[type]) return;
    this.listeners[type].forEach(callback => callback(event, data));
  }

  startTerminalCommand(command, cwd = null) {
    if (this.sockets.terminal) {
      this.sockets.terminal.emit('start_command', { command, cwd });
    }
  }

  startMainPy() {
    if (this.sockets.mainPy) {
      this.sockets.mainPy.emit('start_main_py');
    }
  }

  stopTerminalCommand() {
    if (this.sockets.terminal) {
      this.sockets.terminal.emit('stop_command');
    }
  }

  stopMainPy() {
    if (this.sockets.mainPy) {
      this.sockets.mainPy.emit('stop_main_py');
    }
  }

  sendTerminalInput(input) {
    if (this.sockets.terminal) {
      this.sockets.terminal.emit('send_input', { input });
    }
  }

  disconnect() {
    if (this.sockets.terminal) {
      this.sockets.terminal.disconnect();
      this.sockets.terminal = null;
    }
    if (this.sockets.mainPy) {
      this.sockets.mainPy.disconnect();
      this.sockets.mainPy = null;
    }
  }
}

export default new TerminalService();
