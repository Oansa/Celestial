from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import subprocess
import threading
import queue
import os
import sys
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Store active terminal sessions
active_sessions = {}

class TerminalSession:
    def __init__(self, session_id):
        self.session_id = session_id
        self.process = None
        self.output_queue = queue.Queue()
        self.is_running = False
        
    def start_command(self, command, cwd=None):
        """Start a new terminal command"""
        if self.is_running:
            return False
            
        try:
            # Set working directory
            if cwd and os.path.exists(cwd):
                working_dir = cwd
            else:
                working_dir = os.getcwd()
                
            # Start the process
            self.process = subprocess.Popen(
                command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                stdin=subprocess.PIPE,
                text=True,
                cwd=working_dir,
                bufsize=1,
                universal_newlines=True
            )
            
            self.is_running = True
            
            # Start output reading threads
            threading.Thread(
                target=self._read_output,
                args=(self.process.stdout, 'stdout'),
                daemon=True
            ).start()
            
            threading.Thread(
                target=self._read_output,
                args=(self.process.stderr, 'stderr'),
                daemon=True
            ).start()
            
            return True
            
        except Exception as e:
            self.output_queue.put({
                'type': 'error',
                'data': str(e),
                'timestamp': datetime.now().isoformat()
            })
            return False
    
    def _read_output(self, pipe, stream_type):
        """Read output from process pipes"""
        try:
            for line in iter(pipe.readline, ''):
                if line:
                    self.output_queue.put({
                        'type': stream_type,
                        'data': line.rstrip(),
                        'timestamp': datetime.now().isoformat()
                    })
        except Exception as e:
            self.output_queue.put({
                'type': 'error',
                'data': str(e),
                'timestamp': datetime.now().isoformat()
            })
        finally:
            pipe.close()
    
    def send_input(self, input_text):
        """Send input to the running process"""
        if self.process and self.process.poll() is None:
            try:
                self.process.stdin.write(input_text + '\n')
                self.process.stdin.flush()
                return True
            except Exception as e:
                return False
        return False
    
    def stop_command(self):
        """Stop the running command"""
        if self.process and self.process.poll() is None:
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.process.kill()
        self.is_running = False
    
    def get_status(self):
        """Get current session status"""
        return {
            'session_id': self.session_id,
            'is_running': self.is_running,
            'pid': self.process.pid if self.process else None
        }

@socketio.on('connect')
def handle_connect():
    """Handle new WebSocket connection"""
    session_id = request.sid
    active_sessions[session_id] = TerminalSession(session_id)
    emit('connected', {'session_id': session_id})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection"""
    session_id = request.sid
    if session_id in active_sessions:
        active_sessions[session_id].stop_command()
        del active_sessions[session_id]

@socketio.on('start_command')
def handle_start_command(data):
    """Start a new terminal command"""
    session_id = request.sid
    if session_id not in active_sessions:
        active_sessions[session_id] = TerminalSession(session_id)
    
    session = active_sessions[session_id]
    command = data.get('command', '')
    cwd = data.get('cwd', None)
    
    success = session.start_command(command, cwd)
    emit('command_started', {
        'success': success,
        'command': command,
        'session_id': session_id
    })

@socketio.on('send_input')
def handle_send_input(data):
    """Send input to running command"""
    session_id = request.sid
    if session_id in active_sessions:
        input_text = data.get('input', '')
        success = active_sessions[session_id].send_input(input_text)
        emit('input_sent', {'success': success})

@socketio.on('stop_command')
def handle_stop_command():
    """Stop the running command"""
    session_id = request.sid
    if session_id in active_sessions:
        active_sessions[session_id].stop_command()
        emit('command_stopped', {'session_id': session_id})

@socketio.on('get_status')
def handle_get_status():
    """Get current session status"""
    session_id = request.sid
    if session_id in active_sessions:
        status = active_sessions[session_id].get_status()
        emit('status', status)

# Background thread to emit output
@socketio.on('start_output_stream')
def handle_start_output_stream():
    """Start streaming terminal output"""
    session_id = request.sid
    
    def stream_output():
        if session_id in active_sessions:
            session = active_sessions[session_id]
            while session.is_running or not session.output_queue.empty():
                try:
                    output = session.output_queue.get(timeout=0.1)
                    socketio.emit('terminal_output', output, room=session_id)
                except queue.Empty:
                    continue
    
    threading.Thread(target=stream_output, daemon=True).start()

@app.route('/api/terminal/status', methods=['GET'])
def get_terminal_status():
    """Get status of all terminal sessions"""
    return jsonify({
        'active_sessions': len(active_sessions),
        'sessions': [session.get_status() for session in active_sessions.values()]
    })

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5002)
