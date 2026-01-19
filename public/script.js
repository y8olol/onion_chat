let socket;
let currentRoom = null;
let currentUsername = null;
let selectedFile = null;
let userColors = new Map(); // Store user colors

// Color palette for users (vibrant but readable colors)
const userColorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#EE5A24', '#009432', '#0652DD', '#9980FA', '#833471',
    '#F79F1F', '#A3CB38', '#1289A7', '#D63031', '#74B9FF',
    '#FD79A8', '#6C5CE7', '#A29BFE', '#00B894', '#FDCB6E'
];

// Generate random color for user
function getUserColor(username) {
    if (!userColors.has(username)) {
        // Use consistent color based on username hash for same session
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colorIndex = Math.abs(hash) % userColorPalette.length;
        userColors.set(username, userColorPalette[colorIndex]);
    }
    return userColors.get(username);
}

// Screen management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

// Access code verification
async function verifyAccess() {
    const code = document.getElementById('access-code').value;
    const errorDiv = document.getElementById('access-error');
    
    if (!code) {
        errorDiv.textContent = 'Please enter the access code';
        return;
    }
    
    try {
        const response = await fetch('/verify-access', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });
        
        const result = await response.json();
        
        if (result.success) {
            errorDiv.textContent = '';
            initializeSocket();
            showScreen('room-screen');
            loadRooms();
        } else {
            errorDiv.textContent = 'Invalid access code';
            document.getElementById('access-code').value = '';
        }
    } catch (error) {
        errorDiv.textContent = 'Connection error. Please try again.';
    }
}

// Socket.io initialization
function initializeSocket() {
    socket = io();
    
    socket.on('username-assigned', (data) => {
        currentUsername = data.username;
        document.getElementById('username-display').textContent = `Your name: ${currentUsername}`;
    });
    
    socket.on('new-message', (data) => {
        displayMessage(data);
    });
    
    socket.on('user-joined', (data) => {
        displaySystemMessage(`${data.username} joined the room`);
    });
    
    socket.on('user-left', (data) => {
        displaySystemMessage(`${data.username} left the room`);
    });
    
    socket.on('room-locked', () => {
        document.getElementById('room-locked-notice').classList.remove('hidden');
        document.getElementById('message-input').disabled = true;
        document.getElementById('file-input').disabled = true;
        document.querySelector('#chat-input-container button[onclick="sendMessage()"]').disabled = true;
    });
}

// Room management
async function loadRooms() {
    try {
        const response = await fetch('/rooms');
        const rooms = await response.json();
        
        const container = document.getElementById('rooms-container');
        
        if (rooms.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #888;">No rooms available. Create the first one!</p>';
            return;
        }
        
        container.innerHTML = rooms.map(room => `
            <div class="room-item ${room.is_locked ? 'locked' : ''}" onclick="joinRoom('${room.id}', '${room.name}', ${room.is_locked})">
                <div>
                    <div class="room-name">${escapeHtml(room.name)}</div>
                    <div class="room-id">ID: ${room.id}</div>
                </div>
                <div class="room-status">
                    ${room.is_locked ? '🔒 LOCKED' : '🟢 ACTIVE'}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading rooms:', error);
        document.getElementById('rooms-container').innerHTML = '<p style="color: #ff6b6b;">Error loading rooms</p>';
    }
}

function showCreateRoom() {
    document.getElementById('create-room').classList.remove('hidden');
}

function hideCreateRoom() {
    document.getElementById('create-room').classList.add('hidden');
    document.getElementById('room-name').value = '';
}

async function createRoom() {
    const name = document.getElementById('room-name').value.trim();
    
    if (!name) {
        alert('Please enter a room name');
        return;
    }
    
    try {
        const response = await fetch('/create-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });
        
        const result = await response.json();
        
        if (result.roomId) {
            hideCreateRoom();
            loadRooms();
            joinRoom(result.roomId, result.name, false);
        }
    } catch (error) {
        console.error('Error creating room:', error);
        alert('Error creating room. Please try again.');
    }
}

function joinRoom(roomId, roomName, isLocked) {
    currentRoom = roomId;
    document.getElementById('chat-room-name').textContent = roomName;
    
    if (isLocked) {
        document.getElementById('room-locked-notice').classList.remove('hidden');
        document.getElementById('message-input').disabled = true;
        document.getElementById('file-input').disabled = true;
        document.querySelector('#chat-input-container button[onclick="sendMessage()"]').disabled = true;
    } else {
        document.getElementById('room-locked-notice').classList.add('hidden');
        document.getElementById('message-input').disabled = false;
        document.getElementById('file-input').disabled = false;
        document.querySelector('#chat-input-container button[onclick="sendMessage()"]').disabled = false;
    }
    
    // Clear previous messages and file selection
    document.getElementById('messages-container').innerHTML = '';
    clearFileSelection();
    
    // Join the room via socket
    socket.emit('join-room', { roomId });
    
    // Load existing messages
    loadMessages(roomId);
    
    showScreen('chat-screen');
}

// Load room messages
async function loadMessages(roomId) {
    try {
        const response = await fetch(`/room/${roomId}/messages`);
        const messages = await response.json();
        
        messages.forEach(message => {
            displayMessage(message);
        });
        
        scrollToBottom();
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// File handling
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (30MB limit)
    const maxSize = 30 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('File too large! Maximum size is 30MB.');
        event.target.value = '';
        return;
    }
    
    selectedFile = file;
    
    // Show file preview
    document.getElementById('file-preview-name').textContent = file.name;
    document.getElementById('file-preview-size').textContent = formatFileSize(file.size);
    document.getElementById('file-preview').classList.remove('hidden');
}

function clearFileSelection() {
    selectedFile = null;
    document.getElementById('file-input').value = '';
    document.getElementById('file-preview').classList.add('hidden');
    document.querySelector('.file-upload-progress').classList.add('hidden');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'doc';
    if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'flac'].includes(ext)) return 'audio';
    if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
    
    return 'default';
}

// Upload file
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', currentRoom);
    
    // Show upload progress
    const progressContainer = document.querySelector('.file-upload-progress');
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    progressContainer.classList.remove('hidden');
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const result = await response.json();
        progressFill.style.width = '100%';
        progressText.textContent = 'Upload complete!';
        
        // Send file message
        setTimeout(() => {
            socket.emit('send-message', {
                message: `Shared file: ${file.name}`,
                messageType: 'file',
                fileName: result.originalName,
                filePath: result.path,
                fileSize: result.size
            });
            
            clearFileSelection();
        }, 500);
        
    } catch (error) {
        console.error('Upload error:', error);
        alert('File upload failed. Please try again.');
        clearFileSelection();
    }
}

// Message handling
function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!currentRoom) return;
    
    // Handle file upload
    if (selectedFile) {
        uploadFile(selectedFile);
        input.value = '';
        return;
    }
    
    // Handle text message
    if (!message) return;
    
    socket.emit('send-message', { message });
    input.value = '';
    input.focus();
}

function displayMessage(messageData) {
    const container = document.getElementById('messages-container');
    const messageDiv = document.createElement('div');
    const isFileMessage = messageData.message_type === 'file';
    const userColor = getUserColor(messageData.username);
    
    messageDiv.className = `message ${isFileMessage ? 'file-message' : ''}`;
    
    const timestamp = new Date(messageData.timestamp).toLocaleTimeString();
    
    let messageContent = '';
    
    if (isFileMessage) {
        const fileIcon = getFileIcon(messageData.file_name);
        const isImage = fileIcon === 'image';
        
        messageContent = `
            <div class="message-header">
                <span class="message-username" style="color: ${userColor}; font-weight: bold;">${escapeHtml(messageData.username)}</span>
                <span class="message-timestamp">${timestamp}</span>
            </div>
            <div class="message-text">${escapeHtml(messageData.message)}</div>
            <div class="file-attachment">
                <div class="file-icon ${fileIcon}"></div>
                <div class="file-info">
                    <div class="file-name">${escapeHtml(messageData.file_name)}</div>
                    <div class="file-size">${formatFileSize(messageData.file_size)}</div>
                </div>
                <a href="${messageData.file_path}" download="${messageData.file_name}" class="file-download">Download</a>
            </div>
        `;
        
        if (isImage) {
            messageContent += `
                <img src="${messageData.file_path}" 
                     alt="${escapeHtml(messageData.file_name)}" 
                     class="image-preview" 
                     onclick="showImageLightbox('${messageData.file_path}', '${escapeHtml(messageData.file_name)}')">
            `;
        }
    } else {
        messageContent = `
            <div class="message-header">
                <span class="message-username" style="color: ${userColor}; font-weight: bold;">${escapeHtml(messageData.username)}</span>
                <span class="message-timestamp">${timestamp}</span>
            </div>
            <div class="message-text">${escapeHtml(messageData.message)}</div>
        `;
    }
    
    // Add colored left border to match username color
    messageDiv.style.borderLeftColor = userColor;
    messageDiv.innerHTML = messageContent;
    container.appendChild(messageDiv);
    scrollToBottom();
}

function displaySystemMessage(text) {
    const container = document.getElementById('messages-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system-message';
    messageDiv.innerHTML = `<div class="message-text">${escapeHtml(text)}</div>`;
    container.appendChild(messageDiv);
    scrollToBottom();
}

// Image lightbox
function showImageLightbox(src, filename) {
    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.innerHTML = `<img src="${src}" alt="${filename}" onclick="closeLightbox()">`;
    lightbox.onclick = closeLightbox;
    document.body.appendChild(lightbox);
}

function closeLightbox() {
    const lightbox = document.querySelector('.image-lightbox');
    if (lightbox) {
        lightbox.remove();
    }
}

// Emoji picker functions
function toggleEmojiPicker() {
    const container = document.getElementById('emoji-picker-container');
    container.classList.toggle('hidden');
    
    // Initialize emoji picker if not already done
    if (!container.querySelector('emoji-picker').hasEventListener) {
        const picker = container.querySelector('emoji-picker');
        picker.addEventListener('emoji-click', (event) => {
            const input = document.getElementById('message-input');
            input.value += event.detail.unicode;
            input.focus();
            container.classList.add('hidden');
        });
        picker.hasEventListener = true;
    }
}

// Chat export functions
function exportChat() {
    document.getElementById('export-modal').classList.remove('hidden');
}

function closeExportModal() {
    document.getElementById('export-modal').classList.add('hidden');
}

async function downloadExport(format) {
    if (!currentRoom) return;
    
    try {
        const response = await fetch(`/export/${currentRoom}?format=${format}`);
        if (!response.ok) throw new Error('Export failed');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat_${currentRoom}_${Date.now()}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        closeExportModal();
    } catch (error) {
        console.error('Export error:', error);
        alert('Export failed. Please try again.');
    }
}

function scrollToBottom() {
    const container = document.getElementById('messages-container');
    container.scrollTop = container.scrollHeight;
}

function leaveRoom() {
    if (socket && currentRoom) {
        socket.disconnect();
        socket.connect();
        initializeSocket();
    }
    
    currentRoom = null;
    currentUsername = null;
    clearFileSelection();
    
    showScreen('room-screen');
    loadRooms();
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
document.getElementById('access-code').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        verifyAccess();
    }
});

document.getElementById('room-name').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        createRoom();
    }
});

document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Close emoji picker when clicking outside
document.addEventListener('click', (e) => {
    const emojiContainer = document.getElementById('emoji-picker-container');
    const emojiBtn = document.getElementById('emoji-btn');
    
    if (!emojiContainer.contains(e.target) && e.target !== emojiBtn) {
        emojiContainer.classList.add('hidden');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showScreen('access-screen');
    document.getElementById('access-code').focus();
});
