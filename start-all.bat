@echo off
title Space Explorer - Complete Setup & Launch
color 0A
echo ========================================
echo Space Explorer - Complete Setup & Launch
echo ========================================
echo.

:: Check if Python is installed
echo [CHECK] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)
echo [OK] Python found!

:: Check if Node.js is installed
echo.
echo [CHECK] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found!

:: Install Python dependencies
echo.
echo [1/5] Installing Python dependencies...
echo Installing requirements-terminal.txt...
pip install -r requirements-terminal.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies!
    pause
    exit /b 1
)

echo Installing requirements.txt...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies!
    pause
    exit /b 1
)
echo [OK] Python dependencies installed!

:: Install Node.js dependencies
echo.
echo [2/5] Installing Node.js dependencies...
echo Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [WARNING] Root npm install failed, continuing...
)

echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies!
    pause
    exit /b 1
)
cd ..
echo [OK] Node.js dependencies installed!

:: Start services
echo.
echo [3/5] Starting Main.py Terminal Server...
start "Main.py Terminal Server" cmd /k "color 0B && echo === Main.py Terminal Server === && python backend_main_terminal.py"

echo.
echo [4/5] Starting Backend Terminal Server...
start "Backend Terminal Server" cmd /k "color 0C && echo === Backend Terminal Server === && python backend_terminal.py"

echo.
echo [5/5] Starting Frontend Development Server...
start "Frontend Server" cmd /k "color 0D && echo === Frontend Server === && cd frontend && npm run dev"

:: Wait a moment for services to start
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo 🚀 Space Explorer is Starting...
echo ========================================
echo.
echo 📡 Services:
echo    • Main Terminal Server: http://localhost:5003
echo    • Backend Terminal Server: http://localhost:5002
echo    • Frontend: http://localhost:5173
echo    • Terminal Page: http://localhost:5173/terminal
echo.
echo 📝 Quick Commands:
echo    • Stop all services: run stop-all.bat
echo    • View logs: Check the terminal windows above
echo.
echo ✅ Setup complete! Opening browser...
echo.

:: Open browser after a short delay
timeout /t 2 /nobreak > nul
start http://localhost:5173

echo Press any key to minimize this window...
pause > nul
