-- SQLite Database Schema
-- Bulk Mobile Money Payment System

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Users table
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

-- Bulk batches table
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

-- Bulk items table (individual transactions)
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
    retry_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- API logs table (audit trail)
CREATE TABLE IF NOT EXISTS api_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    provider TEXT,
    direction TEXT CHECK (direction IN ('OUT', 'IN')),
    url TEXT,
    http_method TEXT,
    http_status INTEGER,
    request_body TEXT,
    response_body TEXT,
    error_message TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bulk_batches_created_by ON bulk_batches(created_by);
CREATE INDEX IF NOT EXISTS idx_bulk_batches_status ON bulk_batches(status);
CREATE INDEX IF NOT EXISTS idx_bulk_batches_created_at ON bulk_batches(created_at);

CREATE INDEX IF NOT EXISTS idx_bulk_items_batch_id ON bulk_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_bulk_items_status ON bulk_items(status);
CREATE INDEX IF NOT EXISTS idx_bulk_items_provider ON bulk_items(provider);
CREATE INDEX IF NOT EXISTS idx_bulk_items_operator_tx_id ON bulk_items(operator_tx_id);

CREATE INDEX IF NOT EXISTS idx_api_logs_provider ON api_logs(provider);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);

-- Insert default admin user (password: admin123)
-- Hash: $2b$10$rBV2kWq7hYZJ3Z8kKJ3Z3OGDYqZQyY5LxN5qXZvZ5qZqZqZqZqZqZ
INSERT OR IGNORE INTO users (id, name, email, password_hash, role) VALUES 
('admin-user-001', 'System Admin', 'admin@spacebera.com', '$2b$10$rBV2kWq7hYZJ3Z8kKJ3Z3OGDYqZQyY5LxN5qXZvZ5qZqZqZqZqZqZ', 'ADMIN');
