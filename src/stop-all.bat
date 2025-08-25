@echo off
echo ========================================
echo Stopping Terminal Output Chat System
echo ========================================
echo.

echo Stopping Python processes...
taskkill /f /im python.exe 2>nul

echo Stopping Node processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.cmd 2>nul

echo Stopping any remaining backend processes...
taskkill /f /fi "windowtitle eq Backend Terminal Server" 2>nul

echo Stopping any remaining frontend processes...
taskkill /f /fi "windowtitle eq Frontend Server" 2>nul

echo.
echo All processes stopped!
echo You can now run start-all.bat again
echo ========================================
pause
