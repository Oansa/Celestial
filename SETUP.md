# Celestial AI - ChatGPT-like Chat UI Setup Guide

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 16+ installed
- Ollama installed and running on your system
- At least one model pulled (e.g., `ollama pull llama2`)

### Step 1: Install Backend Dependencies

```bash
npm install
```

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 3: Start the Backend Server

```bash
npm start
```

The backend will start on http://localhost:4000

### Step 4: Start the Frontend Server

In a new terminal:
```bash
cd frontend
npm run dev
```

The frontend will start on http://localhost:5173

### Step 5: Access the Chat Interface

Navigate to http://localhost:5173/chat to access the ChatGPT-like interface.

## 🎯 Features Available

### Chat Interface (`/chat`)
- ChatGPT-like message bubbles
- Real-time streaming responses
- Markdown support with syntax highlighting
- Code blocks with copy functionality
- Model selection dropdown
- Stop generation button
- Auto-scroll to latest messages

### Terminal Streaming
- Real-time terminal output via SSE
- Green-on-black terminal styling
- Stop functionality

### API Endpoints
- `GET /health` - Health check
- `GET /api/stream/ollama?model=llama2&prompt=...` - GET streaming
- `POST /api/chat/stream` - POST streaming with JSON body
- `GET /api/models` - Available models

## 🛠️ Troubleshooting

### Ollama Not Found
If you get "Ollama not found" errors:
1. Install Ollama from https://ollama.ai
2. Pull a model: `ollama pull llama2`
3. Start Ollama: `ollama serve`

### Port Already in Use
If ports 4000 or 5173 are already in use:
- Backend: Change PORT in server.js
- Frontend: Vite will automatically use the next available port

### CORS Issues
The backend is configured to allow all origins. If you have CORS issues, check your browser's console for specific error messages.

## 📁 Project Structure

```
├── server.js                 # Backend Express server
├── package.json              # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MessageBubble.jsx    # Chat message component
│   │   │   ├── ChatInput.jsx        # Input component
│   │   │   └── TerminalStream.jsx   # Terminal streaming component
│   │   ├── pages/
│   │   │   ├── ChatPage.jsx         # Main chat interface
│   │   │   └── WelcomePage.jsx      # Welcome page
│   │   ├── hooks/
│   │   │   └── useSSE.js            # SSE hook
│   │   └── App.jsx
└── SETUP.md
```

## 🎨 Styling

The app uses a dark theme with:
- Background: `bg-slate-950`
- User messages: `bg-blue-600`
- Assistant messages: `bg-slate-800`
- Terminal: `bg-black text-green-400`
- Font: Orbitron for headings

## 🚀 Next Steps

1. Test the chat interface at http://localhost:5173/chat
2. Try different models from the dropdown
3. Test the terminal streaming component
4. Customize the styling as needed
5. Add more features like file uploads or voice input
