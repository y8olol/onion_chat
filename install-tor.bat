@echo off
echo ====================================
echo Tor Installation Helper
echo ====================================
echo.

echo This script will help you download and set up Tor Expert Bundle.
echo.

REM Check if Tor is already installed
if exist "C:\tor\tor.exe" (
    echo Tor appears to be already installed at C:\tor\
    echo If you want to reinstall, please delete C:\tor\ first.
    echo.
    goto :CONFIGURE
)

echo Step 1: Download Tor Expert Bundle
echo.
echo Please download Tor Expert Bundle from:
echo https://www.torproject.org/download/
echo.
echo Look for "Expert Bundle" (not Tor Browser)
echo Download the Windows version (.zip file)
echo.
echo Extract the contents to: C:\tor\
echo (You should have C:\tor\tor.exe when done)
echo.
pause

REM Check if user extracted Tor
if not exist "C:\tor\tor.exe" (
    echo ERROR: Tor not found at C:\tor\tor.exe
    echo Please extract the Tor Expert Bundle to C:\tor\
    echo.
    pause
    exit /b 1
)

:CONFIGURE
echo.
echo Step 2: Setting up Tor configuration...
echo.

REM Create directories
if not exist "C:\tor-data" mkdir C:\tor-data
if not exist "C:\tor-data\anonymous-chat" mkdir C:\tor-data\anonymous-chat
if not exist "C:\tor-logs" mkdir C:\tor-logs

REM Copy torrc
if not exist "C:\tor\torrc" (
    copy "torrc.sample" "C:\tor\torrc"
    echo Configuration file copied to C:\tor\torrc
) else (
    echo Configuration file already exists at C:\tor\torrc
)

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Open Command Prompt as Administrator
echo 2. Run: cd C:\tor
echo 3. Run: tor.exe -f torrc
echo 4. Wait for "Bootstrap 100%%: Done"
echo 5. Your .onion address will be in: C:\tor-data\anonymous-chat\hostname
echo.
echo Then start the chat server with: npm start
echo.
pause
