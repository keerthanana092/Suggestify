@echo off
echo Starting Zenith Discovery Engine...
echo.

:: Start the Backend in a new window
start cmd /k "cd backend && npm run dev"

:: Start the Frontend in a new window
start cmd /k "cd frontend && npm run dev"

echo.
echo Both services are starting! 
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo You can close this window now.
pause
