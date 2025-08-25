# How to Run the Terminal Output Chat Interface

## Step-by-Step Instructions

### 1. Install Dependencies (First Time Only)

**Backend Dependencies:**
```bash
pip install -r requirements-terminal.txt
```

**Frontend Dependencies:**
```bash
cd frontend
npm install socket.io-client react-router-dom
```

### 2. Start the System

**Terminal 1: Start the Backend**
```bash
python backend_main_terminal.py
```

**Terminal 2: Start the Frontend**
```bash
cd frontend
npm run dev
```

### 3. Access the Interface

**Open your browser and go to:**
```
http://localhost:5173/terminal
```

### 4. Use the Interface

1. You'll see a "Start main.py" button
2. Click it to start your main.py program
3. Watch the terminal output appear in real-time
4. Use "Stop main.py" to stop the program

## Quick Commands Summary

```bash
# Terminal 1
python backend_main_terminal.py

# Terminal 2
cd frontend
npm run dev
```

## What You'll See

- **Backend**: Running on http://localhost:5003
- **Frontend**: Running on http://localhost:5173
- **Terminal Page**: http://localhost:5173/terminal

## Troubleshooting

If you get "module not found" errors:
```bash
pip install flask flask-cors flask-socketio python-socketio eventlet
```

If ports are already in use:
- Backend: Change port in backend_main_terminal.py
- Frontend: Vite will automatically use next available port
