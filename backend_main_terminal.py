from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import subprocess
import threading
import queue
import os
import sys
from datetime import datetime

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

active_sessions = {}

class MainPyTerminalSession:
    def __init__(self, session_id):
        self.session_id = session_id
        self.process = None
        self.output_queue = queue.Queue()
        self.is_running = False

    def start_main_py(self):
        if self.is_running:
            return False
        try:
            working_dir = os.getcwd()
            self.process = subprocess.Popen(
                [sys.executable, 'main.py'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                stdin=subprocess.PIPE,
                text=True,
                cwd=working_dir,
                bufsize=1,
                universal_newlines=True
            )
            self.is_running = True
            threading.Thread(target=self._read_output, args=(self.process.stdout, 'stdout'), daemon=True).start()
            threading.Thread(target=self._read_output, args=(self.process.stderr, 'stderr'), daemon=True).start()
            return True
        except Exception as e:
            self.output_queue.put({
                'type': 'error',
                'data': str(e),
                'timestamp': datetime.now().isoformat()
            })
            return False

    def _read_output(self, pipe, stream_type):
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

    def stop_main_py(self):
        if self.process and self.process.poll() is None:
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.process.kill()
        self.is_running = False

    def get_status(self):
        return {
            'session_id': self.session_id,
            'is_running': self.is_running,
            'pid': self.process.pid if self.process else None
        }

@app.route('/')
def home():
    return jsonify({
        'message': 'Main.py Terminal Server is running',
        'status': 'healthy',
        'endpoints': {
            'websocket': 'ws://localhost:5003',
            'status': '/api/main_py/status'
        }
    })

@app.route('/api/main_py/status', methods=['GET'])
def get_main_py_status():
    return jsonify({
        'active_sessions': len(active_sessions),
        'sessions': [session.get_status() for session in active_sessions.values()],
        'message': 'Main.py Terminal Server Status'
    })

@socketio.on('connect')
def handle_connect():
    session_id = request.sid
    active_sessions[session_id] = MainPyTerminalSession(session_id)
    emit('connected', {'session_id': session_id})

@socketio.on('disconnect')
def handle_disconnect():
    session_id = request.sid
    if session_id in active_sessions:
        active_sessions[session_id].stop_main_py()
        del active_sessions[session_id]

@socketio.on('start_main_py')
def handle_start_main_py():
    session_id = request.sid
    if session_id not in active_sessions:
        active_sessions[session_id] = MainPyTerminalSession(session_id)
    session = active_sessions[session_id]
    success = session.start_main_py()
    emit('main_py_started', {'success': success, 'session_id': session_id})
    if success:
        emit('start_output_stream')

@socketio.on('stop_main_py')
def handle_stop_main_py():
    session_id = request.sid
    if session_id in active_sessions:
        active_sessions[session_id].stop_main_py()
        emit('main_py_stopped', {'session_id': session_id})

@socketio.on('start_output_stream')
def handle_start_output_stream():
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

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5003)
