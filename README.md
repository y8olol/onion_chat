# Onion Chat

Anonymous chat system designed for privacy-focused communication over Tor hidden services.

## Features

- **Access Code Protection**: Entry requires access code
- **Anonymous Usernames**: Random usernames assigned per session  
- **Multiple Rooms**: Create and join different chat rooms
- **File Sharing**: Upload files up to 5MB with automatic image compression
- **Emoji Support**: Click-to-insert emoji picker
- **Chat Export**: Export chat history as JSON or TXT
- **Auto Cleanup**: Messages and files deleted after 7 days
- **Tor Compatible**: Works as a Tor hidden service

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the server**
   ```bash
   npm start
   ```

3. **Open browser**
   - Go to http://127.0.0.1:3000
   - Enter the access code to join

## Tor Setup

1. Download Tor Expert Bundle
2. Run `setup-tor.bat` 
3. Copy `torrc.sample` to your Tor directory as `torrc`
4. Start Tor with `tor -f torrc`
5. Start the chat server with `npm start`
6. Your .onion address will be in `C:\tor-data\anonymous-chat\hostname`

## Configuration

Edit these settings in `server.js`:

- `ACCESS_CODE`: Entry code (default changes hourly)
- `INACTIVITY_TIMEOUT`: Room auto-lock time (1 hour)
- `CHAT_RETENTION_DAYS`: Auto-delete period (7 days)
- `MAX_FILE_SIZE`: Upload limit (30MB)

## Supported Files

Images (JPEG, PNG, GIF), Documents (PDF, DOC, TXT), Media (MP3, MP4), Archives (ZIP, RAR)

## License

MIT
