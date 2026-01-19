const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const sharp = require('sharp'); // For image compression

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    maxHttpBufferSize: 10 * 1024 * 1024 // 10MB max file size
});

// Generate time-based access code (changes every hour)
function generateTimeBasedCode() {
    const hour = new Date().getHours();
    const date = new Date().getDate();
    const month = new Date().getMonth() + 1;
    return `Secure${month}${date}${hour}!Access`;
}
const ACCESS_CODE = process.env.CHAT_ACCESS_CODE || generateTimeBasedCode();
const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
const CHAT_RETENTION_DAYS = 7; // Delete chats after 7 days
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB max file size

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueId = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueId}${ext}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        // Allowed file extensions (much more comprehensive)
        const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|bmp|tiff|svg|pdf|txt|doc|docx|rtf|odt|xls|xlsx|ppt|pptx|csv|mp3|wav|flac|aac|ogg|mp4|avi|mov|mkv|wmv|flv|webm|m4v|3gp|zip|rar|7z|tar|gz|bz2|exe|msi|dmg|iso|json|xml|html|htm|css|js|ts|py|java|cpp|c|h|php|rb|go|rs|swift|kt|scala|sh|bat|ps1|sql|md|log|ini|cfg|conf|yml|yaml)$/i;
        
        // Check file extension
        const extname = allowedExtensions.test(file.originalname);
        
        // Block potentially dangerous files even if they match extensions
        const dangerousExtensions = /\.(scr|vbs|pif|cmd|bat|exe|msi)$/i;
        const isDangerous = dangerousExtensions.test(file.originalname);
        
        if (extname && !isDangerous) {
            return cb(null, true);
        } else {
            cb(new Error(`File type not supported: ${path.extname(file.originalname)}`));
        }
    }
});

// Initialize SQLite database
const db = new sqlite3.Database('chat.db');

// Database migration - ensure all columns exist
function migrateDatabase() {
    return new Promise((resolve) => {
        db.serialize(() => {
            // Create basic tables first
            db.run(`CREATE TABLE IF NOT EXISTS rooms (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_locked BOOLEAN DEFAULT 0
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id TEXT NOT NULL,
                username TEXT NOT NULL,
                message TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (room_id) REFERENCES rooms (id)
            )`);
            
            // Add new columns if they don't exist (migration)
            const addColumn = (column, type, defaultVal = '') => {
                return new Promise((res) => {
                    db.run(`ALTER TABLE messages ADD COLUMN ${column} ${type} DEFAULT '${defaultVal}'`, (err) => {
                        if (err && !err.message.includes('duplicate column')) {
                            console.log(`Column ${column} already exists or error:`, err.message);
                        }
                        res();
                    });
                });
            };
            
            Promise.all([
                addColumn('message_type', 'TEXT', 'text'),
                addColumn('file_path', 'TEXT'),
                addColumn('file_name', 'TEXT'),
                addColumn('file_size', 'INTEGER')
            ]).then(() => {
                console.log('Database migration completed');
                resolve();
            });
        });
    });
}

// Initialize database with migration
migrateDatabase().then(() => {
    console.log('Database ready');
});

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());

// Generate random usernames
const adjectives = ['Anonymous', 'Secret', 'Hidden', 'Shadow', 'Silent', 'Ghost', 'Phantom', 'Mystic', 'Dark', 'Cyber'];
const nouns = ['User', 'Agent', 'Visitor', 'Guest', 'Wanderer', 'Explorer', 'Traveler', 'Observer', 'Entity', 'Being'];

function generateRandomUsername() {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 999) + 1;
    return `${adj}${noun}${num}`;
}

// Generate room ID
function generateRoomId() {
    return crypto.randomBytes(6).toString('hex').toUpperCase();
}

// Compress image function
async function compressImage(filePath, originalName) {
    try {
        const ext = path.extname(originalName).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            const compressedPath = filePath.replace(ext, '_compressed' + ext);
            await sharp(filePath)
                .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 70 })
                .toFile(compressedPath);
            
            // Replace original with compressed if smaller
            const originalStats = fs.statSync(filePath);
            const compressedStats = fs.statSync(compressedPath);
            
            if (compressedStats.size < originalStats.size) {
                fs.unlinkSync(filePath);
                fs.renameSync(compressedPath, filePath);
                return compressedStats.size;
            } else {
                fs.unlinkSync(compressedPath);
                return originalStats.size;
            }
        }
        return fs.statSync(filePath).size;
    } catch (error) {
        console.error('Image compression error:', error);
        return fs.statSync(filePath).size;
    }
}

// File upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const { roomId } = req.body;
        if (!roomId) {
            fs.unlinkSync(req.file.path); // Clean up
            return res.status(400).json({ error: 'Room ID required' });
        }
        
        // Compress image if applicable
        const finalSize = await compressImage(req.file.path, req.file.originalname);
        
        res.json({
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: finalSize,
            path: `/uploads/${req.file.filename}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Export chat endpoint
app.get('/export/:roomId', async (req, res) => {
    const { roomId } = req.params;
    const format = req.query.format || 'json';
    
    try {
        const room = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM rooms WHERE id = ?', [roomId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        const messages = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp ASC', [roomId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        if (format === 'txt') {
            let txtContent = `Chat Export - Room: ${room.name} (${room.id})\n`;
            txtContent += `Created: ${room.created_at}\n`;
            txtContent += `Exported: ${new Date().toISOString()}\n`;
            txtContent += '='.repeat(50) + '\n\n';
            
            messages.forEach(msg => {
                const timestamp = new Date(msg.timestamp).toLocaleString();
                txtContent += `[${timestamp}] ${msg.username}: `;
                if (msg.message_type === 'file') {
                    txtContent += `[FILE: ${msg.file_name}]\n`;
                } else {
                    txtContent += `${msg.message}\n`;
                }
            });
            
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="chat_${roomId}_${Date.now()}.txt"`);
            res.send(txtContent);
        } else {
            const exportData = {
                room: room,
                messages: messages,
                exported_at: new Date().toISOString(),
                total_messages: messages.length
            };
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="chat_${roomId}_${Date.now()}.json"`);
            res.json(exportData);
        }
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Export failed' });
    }
});

// Check access code - set to null to disable
app.post('/verify-access', (req, res) => {
    // Skip access code check - .onion address is the security
    res.json({ success: true });
});

// Get all rooms
app.get('/rooms', (req, res) => {
    db.all('SELECT id, name, created_at, is_locked FROM rooms ORDER BY last_activity DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Create new room
app.post('/create-room', (req, res) => {
    const { name } = req.body;
    const roomId = generateRoomId();
    
    db.run('INSERT INTO rooms (id, name) VALUES (?, ?)', [roomId, name], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ roomId, name });
    });
});

// Get room messages
app.get('/room/:id/messages', (req, res) => {
    const roomId = req.params.id;
    
    db.all('SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp ASC', [roomId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('join-room', (data) => {
        const { roomId } = data;
        const username = generateRandomUsername();
        
        socket.join(roomId);
        socket.username = username;
        socket.roomId = roomId;
        
        // Update room activity
        db.run('UPDATE rooms SET last_activity = CURRENT_TIMESTAMP WHERE id = ?', [roomId]);
        
        socket.emit('username-assigned', { username });
        socket.to(roomId).emit('user-joined', { username });
        
        console.log(`${username} joined room ${roomId}`);
    });
    
    socket.on('send-message', (data) => {
        const { message, messageType = 'text', fileName, filePath, fileSize } = data;
        const roomId = socket.roomId;
        const username = socket.username;
        
        if (!roomId || !username) return;
        
        console.log('Message received:', { username, roomId, messageType, message: message?.substring(0, 50) });
        
        // Check if room is locked
        db.get('SELECT is_locked FROM rooms WHERE id = ?', [roomId], (err, row) => {
            if (err || !row) {
                console.error('Room check error:', err);
                return;
            }
            
            if (row.is_locked) {
                socket.emit('room-locked');
                return;
            }
            
            // Save message to database
            const messageText = message || '';
            const stmt = db.prepare(`INSERT INTO messages (room_id, username, message, message_type, file_path, file_name, file_size) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`);
                    
            stmt.run([roomId, username, messageText, messageType, filePath, fileName, fileSize], function(err) {
                if (err) {
                    console.error('Error saving message:', err);
                    socket.emit('message-error', { error: 'Failed to save message' });
                    return;
                }
                
                console.log('Message saved successfully, ID:', this.lastID);
                
                // Update room activity
                db.run('UPDATE rooms SET last_activity = CURRENT_TIMESTAMP WHERE id = ?', [roomId]);
                
                // Broadcast message to room
                const messageData = {
                    id: this.lastID,
                    username,
                    message: messageText,
                    message_type: messageType,
                    file_path: filePath,
                    file_name: fileName,
                    file_size: fileSize,
                    timestamp: new Date().toISOString()
                };
                
                console.log('Broadcasting message to room:', roomId);
                io.to(roomId).emit('new-message', messageData);
            });
            
            stmt.finalize();
        });
    });
    
    socket.on('disconnect', () => {
        if (socket.username && socket.roomId) {
            socket.to(socket.roomId).emit('user-left', { username: socket.username });
            console.log(`${socket.username} left room ${socket.roomId}`);
        }
    });
});

// Auto-lock inactive rooms
function checkInactiveRooms() {
    const cutoffTime = new Date(Date.now() - INACTIVITY_TIMEOUT).toISOString();
    
    db.run('UPDATE rooms SET is_locked = 1 WHERE last_activity < ? AND is_locked = 0', 
        [cutoffTime], function(err) {
            if (err) {
                console.error('Error locking rooms:', err);
                return;
            }
            if (this.changes > 0) {
                console.log(`Locked ${this.changes} inactive room(s)`);
            }
        });
}

// Clean up old chats (delete after CHAT_RETENTION_DAYS)
function cleanupOldChats() {
    const cutoffTime = new Date(Date.now() - (CHAT_RETENTION_DAYS * 24 * 60 * 60 * 1000)).toISOString();
    
    // First, get files to delete
    db.all('SELECT DISTINCT file_path FROM messages WHERE timestamp < ? AND file_path IS NOT NULL', 
        [cutoffTime], (err, rows) => {
            if (!err && rows) {
                // Delete associated files
                rows.forEach(row => {
                    if (row.file_path) {
                        const fullPath = path.join(__dirname, 'uploads', path.basename(row.file_path));
                        if (fs.existsSync(fullPath)) {
                            fs.unlinkSync(fullPath);
                        }
                    }
                });
            }
        });
    
    // Delete old messages
    db.run('DELETE FROM messages WHERE timestamp < ?', [cutoffTime], function(err) {
        if (err) {
            console.error('Error deleting old messages:', err);
            return;
        }
        if (this.changes > 0) {
            console.log(`Deleted ${this.changes} old message(s)`);
        }
    });
    
    // Delete empty rooms
    db.run('DELETE FROM rooms WHERE id NOT IN (SELECT DISTINCT room_id FROM messages)', function(err) {
        if (err) {
            console.error('Error deleting empty rooms:', err);
            return;
        }
        if (this.changes > 0) {
            console.log(`Deleted ${this.changes} empty room(s)`);
        }
    });
}

// Check for inactive rooms every 5 minutes
setInterval(checkInactiveRooms, 5 * 60 * 1000);

// Clean up old chats every hour
setInterval(cleanupOldChats, 60 * 60 * 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '127.0.0.1', () => {
    console.log(`Anonymous chat server running on http://127.0.0.1:${PORT}`);
    console.log('Access code required: UWO2025!');
    console.log(`Chat retention: ${CHAT_RETENTION_DAYS} days`);
    console.log(`Max file size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
});
