@echo off
echo ========================================
echo Starting Terminal Output Chat System
echo ========================================
echo.

echo [1/3] Installing dependencies...
pip install -r requirements-terminal.txt
echo Dependencies installed!

echo.
echo [2/3] Starting Backend (main.py terminal)...
start cmd /k "title Backend Terminal Server && python backend_main_terminal.py"

echo.
echo [3/3] Starting Frontend...
cd frontend
start cmd /k "title Frontend Server && npm run dev"

echo.
echo ========================================
echo System is starting...
echo Backend: http://localhost:5003
echo Frontend: http://localhost:5173
echo Terminal Page: http://localhost:5173/terminal
echo ========================================
echo.
echo Press any key to close these instructions...
pause > nul
