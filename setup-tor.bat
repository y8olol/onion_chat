@echo off
echo Setting up Tor Hidden Service for Anonymous Chat...

REM Create necessary directories
if not exist "C:\tor-data" mkdir C:\tor-data
if not exist "C:\tor-data\anonymous-chat" mkdir C:\tor-data\anonymous-chat
if not exist "C:\tor-logs" mkdir C:\tor-logs

echo Directories created.

REM Check if Tor is installed
where tor >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Tor found in PATH.
) else (
    echo WARNING: Tor not found in PATH.
    echo Please ensure Tor is installed and added to your PATH.
    echo Download from: https://www.torproject.org/download/
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Copy torrc.sample to your Tor installation directory as 'torrc'
echo 2. Start Tor: tor -f torrc
echo 3. Start the chat server: npm start
echo 4. Your .onion address will be in: C:\tor-data\anonymous-chat\hostname
echo.
echo IMPORTANT: Keep the files in C:\tor-data\anonymous-chat\ safe!
echo These contain your hidden service keys.
echo.
pause
