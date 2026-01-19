@echo off
title Anonymous Chat System

echo Starting Anonymous Chat System...
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Start the server
echo Chat server starting on http://127.0.0.1:3000
echo Access code: UWO2025!
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js

pause
