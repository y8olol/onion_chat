@echo off
echo Stopping all services...

REM Kill Tor and Node processes
taskkill /f /im tor.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

echo Services stopped.
echo.
echo Waiting 3 seconds before restart...
timeout /t 3 /nobreak >nul

echo Starting Tor...
cd C:\tor\tor
start "Tor Service" tor.exe -f ..\torrc

echo Waiting 30 seconds for Tor to bootstrap...
timeout /t 30 /nobreak

echo Starting Chat Server...
cd C:\onion-chat
start "Chat Server" npm start

echo Waiting 10 seconds for chat server to start...
timeout /t 10 /nobreak

echo.
echo Your .onion address:
type C:\tor-data\anonymous-chat\hostname

echo.
echo All services started!
pause
