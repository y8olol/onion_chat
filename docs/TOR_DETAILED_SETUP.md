# Complete Tor Hidden Service Setup Guide

## Prerequisites

1. **Download Tor Expert Bundle**
   - Go to https://www.torproject.org/download/
   - Download "Expert Bundle" (not Tor Browser)
   - Extract to `C:\tor\` (or your preferred location)

## Step-by-Step Setup

### 1. Prepare Directories

Run the setup script or create manually:
```
mkdir C:\tor-data
mkdir C:\tor-data\anonymous-chat
mkdir C:\tor-logs
```

### 2. Configure Tor

Create `C:\tor\torrc` with this content:

```
# Basic Configuration
SocksPort 9050
ControlPort 9051
CookieAuthentication 1

# Logging
Log notice file C:\tor-logs\notices.log

# Hidden Service for Chat
HiddenServiceDir C:\tor-data\anonymous-chat\
HiddenServicePort 80 127.0.0.1:3000

# Security Settings
HiddenServiceVersion 3
```

### 3. Start Tor Service

Open Command Prompt as Administrator and run:
```
cd C:\tor
tor.exe -f torrc
```

You should see output like:
```
[notice] Tor 0.4.x.x running on Win32
[notice] Opened new control socket
[notice] Created new hidden service directory
```

### 4. Get Your .onion Address

After Tor starts, check:
```
type C:\tor-data\anonymous-chat\hostname
```

This will show your .onion address (something like `abc123def456.onion`)

### 5. Start Chat Server

In a new terminal:
```
cd C:\onion-chat
npm start
```

### 6. Test Access

**Local testing**: http://127.0.0.1:3000
**Tor access**: `your-address.onion` (via Tor Browser)

## Troubleshooting

### Tor Won't Start
- Check if port 9050/9051 are already in use
- Run as Administrator
- Check logs in `C:\tor-logs\`

### Can't Access .onion Site
- Ensure Tor is running and created the hostname file
- Use Tor Browser, not regular browser
- Wait a few minutes for the hidden service to propagate

### Chat Server Connection Issues
- Verify server is running on port 3000
- Check Windows Firewall isn't blocking localhost connections
- Ensure Node.js dependencies are installed

## Security Best Practices

### Protecting Your Hidden Service

1. **Backup Your Keys**
   ```
   copy C:\tor-data\anonymous-chat\* C:\backup-location\
   ```

2. **Secure File Permissions**
   - Set folder permissions to only allow your user account
   - Keep the secret keys private

3. **Monitor Access**
   - Check Tor logs for unusual activity
   - Monitor chat server logs

### Operational Security

1. **Change Access Code**
   - Edit `server.js` and modify `ACCESS_CODE`
   - Restart the server

2. **Regular Updates**
   - Keep Tor updated
   - Update Node.js dependencies: `npm update`

3. **Clean Logs**
   - Periodically clear `C:\tor-logs\`
   - Set log rotation if running long-term

## Running as Windows Service

For permanent operation, use NSSM (Non-Sucking Service Manager):

1. Download NSSM from https://nssm.cc/
2. Install Tor as service:
   ```
   nssm install TorService C:\tor\tor.exe
   nssm set TorService Parameters "-f C:\tor\torrc"
   nssm set TorService Start SERVICE_AUTO_START
   ```

3. Install Chat as service:
   ```
   nssm install ChatService C:\Program Files\nodejs\node.exe
   nssm set ChatService Parameters "C:\onion-chat\server.js"
   nssm set ChatService AppDirectory C:\onion-chat
   nssm set ChatService Start SERVICE_AUTO_START
   ```

4. Start services:
   ```
   net start TorService
   net start ChatService
   ```

## Maintenance

### Regular Tasks
- Check Tor logs for errors
- Monitor chat database size (`chat.db`)
- Clean up old locked rooms if needed
- Update access codes periodically

### Database Management
The chat uses SQLite. To view/manage data:
```sql
sqlite3 chat.db
.tables
SELECT * FROM rooms;
SELECT * FROM messages LIMIT 10;
```

### Performance Monitoring
- Watch CPU/memory usage
- Monitor network connections
- Check disk space usage

---

## Emergency Procedures

### If Hidden Service Compromised
1. Stop Tor service immediately
2. Delete `C:\tor-data\anonymous-chat\`
3. Restart Tor (new .onion address will be generated)
4. Notify users of new address

### If Chat System Compromised
1. Stop chat server
2. Review `chat.db` for suspicious activity
3. Clear database if needed: `rm chat.db`
4. Change access code
5. Restart with new configuration

Remember: Your .onion address is only as secure as your operational security!
