// Database migration script to add missing columns
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('chat.db');

console.log('Updating database schema...');

db.serialize(() => {
    // Check if columns exist and add them if they don't
    db.run(`ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text'`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.log('message_type column already exists or other error:', err.message);
        } else if (!err) {
            console.log('Added message_type column');
        }
    });
    
    db.run(`ALTER TABLE messages ADD COLUMN file_path TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.log('file_path column already exists or other error:', err.message);
        } else if (!err) {
            console.log('Added file_path column');
        }
    });
    
    db.run(`ALTER TABLE messages ADD COLUMN file_name TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.log('file_name column already exists or other error:', err.message);
        } else if (!err) {
            console.log('Added file_name column');
        }
    });
    
    db.run(`ALTER TABLE messages ADD COLUMN file_size INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.log('file_size column already exists or other error:', err.message);
        } else if (!err) {
            console.log('Added file_size column');
        }
        
        console.log('Database schema update complete!');
        db.close();
    });
});
