# 📎 File Upload Support - Complete Guide

## ✅ **SUPPORTED FILE TYPES** (Comprehensive List)

### 🖼️ **Images** (with automatic compression)
- **JPEG/JPG** - Standard photo format
- **PNG** - High quality images with transparency  
- **GIF** - Animated images
- **WebP** - Modern compressed image format
- **BMP** - Bitmap images
- **TIFF** - High quality professional images
- **SVG** - Scalable vector graphics

### 📄 **Documents**
- **PDF** - Portable document format
- **TXT** - Plain text files
- **DOC/DOCX** - Microsoft Word documents
- **RTF** - Rich text format
- **ODT** - OpenDocument text files
- **XLS/XLSX** - Excel spreadsheets  
- **PPT/PPTX** - PowerPoint presentations
- **CSV** - Comma-separated values

### 🎵 **Audio Files**
- **MP3** - Most common audio format
- **WAV** - Uncompressed audio
- **FLAC** - Lossless audio compression
- **AAC** - Advanced audio codec
- **OGG** - Open source audio format

### 🎥 **Video Files**
- **MP4** - Most common video format
- **AVI** - Audio Video Interleave
- **MOV** - QuickTime movie format
- **MKV** - Matroska video container
- **WMV** - Windows Media Video
- **FLV** - Flash video format
- **WebM** - Web-optimized video
- **M4V** - iTunes video format
- **3GP** - Mobile video format

### 📦 **Archive Files**
- **ZIP** - Most common compression
- **RAR** - WinRAR archives
- **7Z** - 7-Zip archives
- **TAR** - Unix tape archive
- **GZ** - Gzip compressed files
- **BZ2** - Bzip2 compressed files

### 💻 **Development Files**
- **JSON** - JavaScript Object Notation
- **XML** - Extensible Markup Language
- **HTML/HTM** - Web pages
- **CSS** - Stylesheets
- **JS** - JavaScript files
- **TS** - TypeScript files
- **PY** - Python scripts
- **JAVA** - Java source code
- **CPP/C/H** - C/C++ files
- **PHP** - PHP scripts
- **RB** - Ruby files
- **GO** - Go language files
- **RS** - Rust files
- **SWIFT** - Swift files
- **KT** - Kotlin files
- **SCALA** - Scala files

### ⚙️ **System & Config Files**
- **SH** - Shell scripts
- **BAT** - Windows batch files
- **PS1** - PowerShell scripts
- **SQL** - Database scripts
- **MD** - Markdown files
- **LOG** - Log files
- **INI/CFG/CONF** - Configuration files
- **YML/YAML** - YAML configuration

### 💿 **Disk Images & Installers**
- **ISO** - Disk image files
- **DMG** - macOS disk images

## 🚫 **BLOCKED FILE TYPES** (Security)

For security reasons, these file types are **NOT ALLOWED**:

- **SCR** - Screen savers (often malware)
- **VBS** - VBScript files (can contain viruses)
- **PIF** - Program Information Files (legacy, dangerous)
- **CMD** - Windows command files (blocked for security)
- **EXE** - Windows executables (blocked for security)
- **MSI** - Windows installer packages (blocked for security)

> **Note**: While EXE and MSI are blocked by default for security, you can modify the code to allow them if needed for your specific use case.

## ⚡ **File Specifications**

### Size Limits
- **Maximum file size**: 5MB per file
- **Total storage**: Unlimited (files auto-delete after 7 days)

### Image Optimization
- **Automatic compression** for JPEG, PNG, WebP files
- **Resized to maximum**: 800x600 pixels
- **Quality**: 70% (balances size vs quality)
- **Smaller compressed files** replace originals automatically

### Upload Features
- **Progress bar** shows upload status
- **File preview** before sending
- **Drag & drop support** (in modern browsers)
- **File type detection** with appropriate icons
- **Error handling** for invalid files or size limits

## 🎯 **How to Use**

### Uploading Files
1. Click the **📎** attachment button
2. Select your file (any supported type)
3. See preview with filename and size
4. Click **Send** to share with the room
5. File appears with download link for others

### File Display
- **Images**: Show thumbnail + click for full size
- **Documents**: Show file icon + download link
- **Archives**: Show package icon + download link  
- **Audio/Video**: Show media icon + download link
- **Code files**: Show document icon + download link

### File Management
- **Automatic cleanup**: Files deleted after 7 days
- **No permanent storage**: Perfect for temporary sharing
- **Local storage only**: No cloud uploads for privacy

## 🔧 **Customization**

Want to modify file support? Edit `server.js`:

### Add New File Types
```javascript
const allowedExtensions = /\.(your|new|extensions|here)$/i;
```

### Change Size Limit
```javascript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```

### Modify Image Compression
```javascript
.resize(1200, 900, { fit: 'inside' })  // Bigger images
.jpeg({ quality: 85 })                 // Higher quality
```

## 🛡️ **Security Features**

- **Extension validation**: Files must have approved extensions
- **Size limits**: Prevents abuse with huge files
- **Dangerous file blocking**: Executables and scripts blocked
- **Auto-deletion**: No permanent file storage
- **Local storage**: Files never leave your server

---

## 📊 **Summary**

- ✅ **60+ file types supported**
- 🖼️ **Automatic image compression**
- 📦 **5MB maximum file size**
- 🛡️ **Security filtering**
- 🗑️ **7-day auto-deletion**
- 💾 **Local storage only**

**Perfect for sharing documents, images, code, archives, and media in your anonymous chat rooms!**
