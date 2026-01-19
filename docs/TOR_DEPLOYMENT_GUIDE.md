# 🧅 Getting Your Chat on Tor - Complete Guide

## ✅ **Emojis Removed**
- Interface now shows clean "Anonymous Chat System" and "Anonymous Chat Rooms"
- No emoji clutter in the headers

## 🚀 **Quick Tor Setup** (3 Steps)

### Step 1: Download Tor Expert Bundle
1. Go to: **https://www.torproject.org/download/**
2. Download: **"Expert Bundle"** (Windows .zip)
3. Extract to: **C:\tor\**

### Step 2: Run Setup Script
```bash
cd C:\onion-chat
setup-tor-simple.bat
```
This automatically creates all directories and configuration files.

### Step 3: Start Services

**Terminal 1** (Run as Administrator):
```bash
cd C:\tor
tor.exe -f torrc
```
Wait for: `[notice] Bootstrapped 100% (done): Done`

**Terminal 2**:
```bash
cd C:\onion-chat
npm start
```

## 🎯 **Get Your .onion Address**

After Tor starts successfully:
```bash
type C:\tor-data\anonymous-chat\hostname
```

This shows your .onion address like:
```
abc123def456ghi789jkl.onion
```

## 📢 **Share with Users**

Give users:
1. **Your .onion address** (from hostname file)
2. **Access code**: `UWO2025!`
3. **Instructions**: "Use Tor Browser to access the .onion URL"

## 🔧 **What You Get**

### Anonymous Features
- **Complete anonymity** via Tor hidden service
- **No IP tracking** - all traffic through Tor
- **Random usernames** that change each session
- **7-day auto-delete** - no permanent records

### Rich Chat Features
- **User colors** - each person gets unique color
- **30MB file uploads** - 6x larger than before
- **60+ file types** - documents, code, media, archives
- **Emoji picker** - full emoji support
- **Chat export** - download conversation history
- **Real-time messaging** - instant delivery

### File Sharing
- **Images**: Auto-compressed, clickable previews
- **Documents**: PDF, Word, Excel, PowerPoint
- **Code**: All programming languages supported
- **Media**: Audio, video with download links
- **Archives**: ZIP, RAR, 7Z for large projects

## 🛡️ **Security Features**

- **Access code protection** (`UWO2025!`)
- **Tor hidden service** (no direct IP access)
- **Local storage only** (no cloud uploads)
- **Auto-cleanup** (7-day message retention)
- **File validation** (dangerous types blocked)

## 📋 **Troubleshooting**

### Tor Issues
```bash
# Check if running
netstat -an | findstr 9050

# Kill and restart if needed
taskkill /f /im tor.exe
cd C:\tor
tor.exe -f torrc
```

### Chat Server Issues
```bash
# Kill and restart
taskkill /f /im node.exe
cd C:\onion-chat
npm start
```

### Can't Access .onion Site
- Use **Tor Browser** (not regular browser)
- Wait 2-3 minutes after Tor starts
- Check exact .onion address (copy/paste)
- Try clearing Tor Browser cache

## 🎉 **Final Result**

Once setup is complete, you'll have:

✅ **Anonymous chat system** accessible via `.onion` address  
✅ **Clean interface** without emoji clutter  
✅ **User colors** for easy conversation tracking  
✅ **30MB file uploads** with comprehensive format support  
✅ **Complete privacy** with Tor hidden service  
✅ **7-day auto-cleanup** prevents data accumulation  

## 📞 **Support**

Your chat system is now ready for deployment! The server is running at http://127.0.0.1:3000 for local testing.

**Key Files Created:**
- `setup-tor-simple.bat` - One-click Tor setup
- `TOR_COMPLETE_SETUP.md` - Detailed setup guide
- `torrc.sample` - Tor configuration template

**Share with Users:**
1. Your `.onion` address (from hostname file)
2. Access code: `UWO2025!`
3. Instructions to use Tor Browser

---

**🎯 Your anonymous chat system is now ready for Tor deployment with clean interface, user colors, and 30MB file support!**
