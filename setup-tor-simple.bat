@echo off
echo ==========================================
echo    TOR HIDDEN SERVICE SETUP
echo ==========================================
echo.

echo This will set up your anonymous chat as a Tor hidden service.
echo.

REM Check if Tor is installed
if not exist "C:\tor\tor.exe" (
    echo ERROR: Tor not found at C:\tor\tor.exe
    echo.
    echo Please download Tor Expert Bundle from:
    echo https://www.torproject.org/download/
    echo Extract it to C:\tor\ and run this script again.
    echo.
    pause
    exit /b 1
)

echo ✓ Tor found at C:\tor\
echo.

REM Create directories
echo Creating Tor directories...
if not exist "C:\tor-data" mkdir C:\tor-data
if not exist "C:\tor-data\anonymous-chat" mkdir C:\tor-data\anonymous-chat
if not exist "C:\tor-logs" mkdir C:\tor-logs

echo ✓ Directories created
echo.

REM Create torrc configuration
echo Creating Tor configuration...
(
echo # Tor Hidden Service Configuration for Anonymous Chat
echo # Generated automatically - do not edit manually
echo.
echo # Basic Configuration
echo SocksPort 9050
echo ControlPort 9051
echo CookieAuthentication 1
echo.
echo # Logging
echo Log notice file C:\tor-logs\notices.log
echo.
echo # Hidden Service for Anonymous Chat
echo HiddenServiceDir C:\tor-data\anonymous-chat\
echo HiddenServicePort 80 127.0.0.1:3000
echo.
echo # Security Settings  
echo HiddenServiceVersion 3
echo HiddenServiceNumIntroductionPoints 5
) > C:\tor\torrc

echo ✓ Configuration file created at C:\tor\torrc
echo.

echo ==========================================
echo    SETUP COMPLETE!
echo ==========================================
echo.
echo Next steps:
echo.
echo 1. OPEN COMMAND PROMPT AS ADMINISTRATOR
echo 2. Run: cd C:\tor
echo 3. Run: tor.exe -f torrc
echo 4. Wait for "Bootstrapped 100%% (done): Done"
echo.
echo 5. In ANOTHER command prompt:
echo 6. Run: cd C:\onion-chat
echo 7. Run: npm start
echo.
echo 8. Get your .onion address:
echo    type C:\tor-data\anonymous-chat\hostname
echo.
echo 9. Share the .onion address with users!
echo    Access code: UWO2025!
echo.
echo ==========================================
echo.
echo Press any key to open the Tor directory...
pause >nul
explorer C:\tor
echo.
echo Press any key to continue...
pause
