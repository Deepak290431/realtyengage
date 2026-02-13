@echo off
echo ========================================
echo   RealtyEngage - Complete Application
echo ========================================
echo.
echo Starting Backend and Frontend servers...
echo.
echo IMPORTANT: Keep this window open!
echo.

REM Start Backend Server in new window
echo [1/2] Starting Backend Server (Port 5007)...
start "RealtyEngage Backend" cmd /k "cd /d "%~dp0backend" && npm start"

REM Wait a few seconds for backend to initialize
timeout /t 5 /nobreak >nul

REM Start Frontend Server in new window
echo [2/2] Starting Frontend Server (Port 4000)...
start "RealtyEngage Admin Frontend" cmd /k "cd /d "%~dp0frontend" && set NODE_OPTIONS=--max-old-space-size=4096 && npm run start:admin"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:5007
echo Frontend: http://localhost:4000/admin
echo.
echo Wait 10-15 seconds for servers to start,
echo then open: http://localhost:4000/admin
echo.
echo Press any key to open the admin dashboard...
pause >nul

REM Open browser
start http://localhost:4000/admin

echo.
echo Application is running!
echo.
echo To stop the servers:
echo - Close the "RealtyEngage Backend" window
echo - Close the "RealtyEngage Admin Frontend" window
echo.
pause
