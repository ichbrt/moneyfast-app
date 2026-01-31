/**
 * Database Configuration
 * Supports both SQLite (local/dev) and PostgreSQL (production/Vercel)
 */

const path = require('path');
const fs = require('fs');

let pool;
let query;
let getClient;
let db = null; // Only available in SQLite mode

// Embedded Schema to avoid file reading issues on Vercel
const SQL_SCHEMA = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'FINANCE', 'VIEWER')),
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS bulk_batches (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    reference TEXT NOT NULL,
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    total_items INTEGER NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'UGX',
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'PROCESSING', 'DONE', 'PARTIAL', 'FAILED')),
    success_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    pending_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS bulk_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    batch_id TEXT NOT NULL REFERENCES bulk_batches(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('MTN', 'AIRTEL')),
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'UGX',
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED')),
    operator_tx_id TEXT,
    operator_raw_response TEXT,
    error_message TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS api_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    provider TEXT,
    direction TEXT,
    http_method TEXT,
    http_status INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO users (id, name, email, password_hash, role) VALUES 
('admin-user-001', 'System Admin', 'admin@spacebera.com', '$2b$10$Dv1CZEwWkHfPqhEBKgxsJOzHPDOBoTlwIZWgBWUFsybg5fmXhVMe6', 'ADMIN');
`;

// Check if we are in a PostgreSQL environment (e.g., Vercel with DATABASE_URL)
// But respect MOCK_MODE to force SQLite/Memory (e.g. for testing)
if (process.env.DATABASE_URL && process.env.MOCK_MODE !== 'true') {
  console.log('🔌 Connecting to PostgreSQL...');
  try {
    const { Pool } = require('pg');
    const poolConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    };

    pool = new Pool(poolConfig);
    query = (text, params) => pool.query(text, params);
    getClient = () => pool.connect();

    // Test connection
    pool.query('SELECT NOW()', (err, res) => {
      if (err) console.error('❌ PostgreSQL connection error:', err);
      else console.log('✅ PostgreSQL connected successfully');
    });

  } catch (err) {
    console.error('❌ Failed to initialize PostgreSQL:', err);
    // Fallback dummies to prevent crash
    query = async () => ({ rows: [], rowCount: 0 });
    getClient = async () => ({ query, release: () => { } });
  }

} else {
  // Fallback to SQLite (Local Development or Vercel Demo Mode)
  console.log('🔌 Using SQLite...');

  try {
    const Database = require('better-sqlite3');
    let dbPath;

    if (process.env.VERCEL) {
      console.warn('⚠️ Running on Vercel without DATABASE_URL. Using ephemeral /tmp storage.');
      dbPath = '/tmp/bulk_payments.db';
    } else {
      const dataDir = path.join(__dirname, '../../data');
      if (!fs.existsSync(dataDir)) {
        try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) { }
      }
      dbPath = process.env.SQLITE_DB_PATH || path.join(dataDir, 'bulk_payments.db');
    }

    db = new Database(dbPath, { verbose: console.log });
    db.exec(SQL_SCHEMA);
    console.log(`✅ SQLite database initialized at ${dbPath}`);

  } catch (error) {
    console.warn('⚠️ SQLite initialization failed (likely missing binary or read-only fs). Falling back to in-memory.');
    try {
      const Database = require('better-sqlite3');
      db = new Database(':memory:');
      db.exec(SQL_SCHEMA);
      console.log('✅ In-memory SQLite database initialized');
    } catch (memError) {
      console.error('❌ CRITICAL: Could not initialize any database:', memError);
      db = null;
    }
  }

  // PostgreSQL Adapter for SQLite
  query = (text, params = []) => {
    if (!db) {
      console.error('❌ Database is not initialized. Query ignored.');
      return { rows: [], rowCount: 0 };
    }
    try {
      // Convert $1, $2 to ?
      let sqliteQuery = text;
      if (params && params.length > 0) {
        for (let i = params.length; i >= 1; i--) {
          sqliteQuery = sqliteQuery.replace(new RegExp('\\$' + i, 'g'), '?');
        }
      }

      const stmt = db.prepare(sqliteQuery);

      if (text.trim().toUpperCase().startsWith('SELECT') || text.trim().toUpperCase().startsWith('WITH')) {
        const rows = stmt.all(...params);
        return { rows, rowCount: rows.length };
      } else {
        const info = stmt.run(...params);
        return { rows: [], rowCount: info.changes };
      }
    } catch (error) {
      console.error('SQLite Query Error:', error.message);
      throw error;
    }
  };

  getClient = async () => {
    return {
      query: async (text, params) => query(text, params),
      release: () => { }
    };
  };

  pool = {
    query: async (text, params) => query(text, params),
    connect: getClient,
    end: () => db ? db.close() : null,
    on: () => { }
  };
}

module.exports = {
  query: async (text, params) => query(text, params),
  pool,
  getClient,
  db
};
