# 🧅 Complete Tor Hidden Service Setup Guide

## Step 1: Download Tor Expert Bundle

1. **Go to**: https://www.torproject.org/download/
2. **Download**: "Expert Bundle" (NOT Tor Browser)
3. **Choose**: Windows version (.zip file)
4. **Extract to**: `C:\tor\` 

After extraction, you should have:
```
C:\tor\
├── tor.exe
├── geoip
├── geoip6
└── (other Tor files)
```

## Step 2: Automated Setup (Easy Way)

Run the provided setup script:

```bash
# From your chat directory:
cd C:\onion-chat
install-tor.bat
```

This will:
- Create necessary directories
- Copy configuration files
- Guide you through the process

## Step 3: Manual Setup (If Preferred)

### Create Directories
```bash
mkdir C:\tor-data
mkdir C:\tor-data\anonymous-chat
mkdir C:\tor-logs
```

### Create Tor Configuration
Create `C:\tor\torrc` with this content:

```
# Basic Tor Configuration
SocksPort 9050
ControlPort 9051
CookieAuthentication 1

# Logging
Log notice file C:\tor-logs\notices.log

# Hidden Service for Anonymous Chat
HiddenServiceDir C:\tor-data\anonymous-chat\
HiddenServicePort 80 127.0.0.1:3000

# Security Settings
HiddenServiceVersion 3
HiddenServiceNumIntroductionPoints 5
```

## Step 4: Start Everything

### Terminal 1 - Start Tor
```bash
cd C:\tor
tor.exe -f torrc
```

**Wait for this message**:
```
[notice] Bootstrapped 100% (done): Done
```

### Terminal 2 - Start Chat Server
```bash
cd C:\onion-chat
npm start
```

**You should see**:
```
Anonymous chat server running on http://127.0.0.1:3000
Access code required: UWO2025!
Chat retention: 7 days
Max file size: 30MB
```

## Step 5: Get Your .onion Address

After Tor starts successfully:

```bash
type C:\tor-data\anonymous-chat\hostname
```

This will show your .onion address like:
```
abc123def456ghi789jkl.onion
```

## Step 6: Test Access

### Local Testing
- **URL**: http://127.0.0.1:3000
- **Access Code**: `UWO2025!`

### Tor Access (Share This!)
- **URL**: `your-address.onion` (from hostname file)
- **Browser**: Tor Browser ONLY
- **Access Code**: `UWO2025!`

## 🔧 Troubleshooting

### Tor Won't Start
```bash
# Check if ports are in use
netstat -an | findstr 9050
netstat -an | findstr 9051

# Kill conflicting processes if found
taskkill /f /pid [PID_NUMBER]
```

### No .onion Address Generated
- Wait 2-3 minutes after "Bootstrapped 100%"
- Check `C:\tor-logs\notices.log` for errors
- Ensure directories were created correctly

### Can't Access via Tor Browser
- Verify Tor is running and bootstrapped
- Check the exact .onion address (copy/paste carefully)
- Try accessing after a few minutes (propagation time)

### Chat Server Issues
```bash
# If port 3000 is in use
taskkill /f /im node.exe

# Restart server
cd C:\onion-chat
npm start
```

## 🔒 Security Best Practices

### Protect Your Keys
```bash
# Backup your hidden service keys
copy C:\tor-data\anonymous-chat\* C:\backup-location\
```

**CRITICAL**: Never lose these files! They contain your .onion identity.

### Change Access Code (Recommended)
Edit `server.js`:
```javascript
const ACCESS_CODE = 'YOUR_NEW_SECRET_CODE';
```

### Monitor Logs
```bash
# Check Tor logs
type C:\tor-logs\notices.log

# Check for suspicious activity
```

## 🚀 Running as Windows Service (Optional)

For 24/7 operation, install as Windows services:

### Install NSSM (Service Manager)
1. Download from: https://nssm.cc/download
2. Extract to `C:\nssm\`

### Install Tor Service
```bash
cd C:\nssm
nssm install TorService C:\tor\tor.exe
nssm set TorService Parameters "-f C:\tor\torrc"
nssm set TorService Start SERVICE_AUTO_START
```

### Install Chat Service
```bash
nssm install ChatService "C:\Program Files\nodejs\node.exe"
nssm set ChatService Parameters "C:\onion-chat\server.js"
nssm set ChatService AppDirectory "C:\onion-chat"
nssm set ChatService Start SERVICE_AUTO_START
```

### Start Services
```bash
net start TorService
net start ChatService
```

## 📋 Quick Start Checklist

- [ ] Download Tor Expert Bundle to `C:\tor\`
- [ ] Run `install-tor.bat` OR create directories manually
- [ ] Create `torrc` configuration file
- [ ] Start Tor: `tor.exe -f torrc`
- [ ] Wait for "Bootstrapped 100%"
- [ ] Start chat: `npm start`
- [ ] Get .onion address from hostname file
- [ ] Test locally: http://127.0.0.1:3000
- [ ] Test via Tor Browser: `your-address.onion`
- [ ] Share .onion address + access code with users

## 🎯 Final Result

You'll have:
- **Anonymous chat** accessible via `.onion` address
- **30MB file uploads** with 60+ supported formats
- **User colors** for easy conversation tracking
- **Emoji support** with picker
- **Chat export** functionality
- **7-day auto-cleanup** for privacy
- **Complete anonymity** via Tor hidden service

## 📞 Support Commands

### Check if Tor is running
```bash
netstat -an | findstr 9050
```

### Restart everything
```bash
# Kill all Node processes
taskkill /f /im node.exe

# Kill Tor (if needed)
taskkill /f /im tor.exe

# Restart Tor
cd C:\tor
tor.exe -f torrc

# Restart Chat (in new terminal)
cd C:\onion-chat
npm start
```

---

**🎉 Once setup is complete, share your .onion address and access code with users for completely anonymous chat with file sharing!**
