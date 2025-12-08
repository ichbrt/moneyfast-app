// Script to update admin password in database
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'bulk_payments.db');
const db = new Database(dbPath);

// Correct bcrypt hash for 'admin123'
const correctHash = '$2b$10$wUQQ4UcVqIkG7haytVATAe6xnlGVo.slZeZ5UPYfP8zuLGcw94WI2';

const result = db.prepare(`
  UPDATE users 
  SET password_hash = ? 
  WHERE email = 'admin@smsconstruction.com'
`).run(correctHash);

console.log('✅ Admin password updated!');
console.log('Rows affected:', result.changes);

// Verify
const user = db.prepare('SELECT email, role FROM users WHERE email = ?')
    .get('admin@smsconstruction.com');

console.log('User verified:', user);
db.close();
