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

// Check if we are in a PostgreSQL environment (e.g., Vercel with DATABASE_URL)
if (process.env.DATABASE_URL) {
  console.log('🔌 Connecting to PostgreSQL...');
  const { Pool } = require('pg');

  const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for most cloud providers (Neon, Supabase, Heroku)
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

} else {
  // Fallback to SQLite (Local Development or Vercel Demo Mode)
  console.log('🔌 Using SQLite...');
  const Database = require('better-sqlite3');

  // Determine database path
  let dbPath;

  if (process.env.VERCEL) {
    // Vercel Serverless environment (Readme only or /tmp)
    console.warn('⚠️ Running on Vercel without DATABASE_URL. Using ephemeral /tmp storage.');
    dbPath = '/tmp/bulk_payments.db';
  } else {
    // Local environment
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {
        console.warn('⚠️ Could not create data directory (likely read-only fs)');
      }
    }
    dbPath = process.env.SQLITE_DB_PATH || path.join(dataDir, 'bulk_payments.db');
  }

  try {
    db = new Database(dbPath, { verbose: console.log });
    db.pragma('foreign_keys = ON');

    // Initialize Schema
    const schemaPath = path.join(__dirname, '../../sql/schema-sqlite.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      db.exec(schema);
      console.log(`✅ SQLite database initialized at ${dbPath}`);
    } else {
      console.warn('⚠️ Schema file not found at', schemaPath);
    }

  } catch (error) {
    console.error('❌ SQLite initialization error:', error);
    // Fallback to in-memory if file access fails completely
    if (!db) {
      console.warn('⚠️ Falling back to in-memory database');
      db = new Database(':memory:');
      // Try formatting schema again
      const schemaPath = path.join(__dirname, '../../sql/schema-sqlite.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      db.exec(schema);
    }
  }

  // PostgreSQL Adapter for SQLite
  query = (text, params = []) => {
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
      console.error('Query:', text);
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
    end: () => db.close(),
    on: () => { }
  };
}

module.exports = {
  query: async (text, params) => query(text, params),
  pool,
  getClient,
  db // null if using Postgres
};
