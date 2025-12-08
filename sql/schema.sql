-- Bulk Mobile Money Payment System Database Schema
-- PostgreSQL 12+

-- Create database (run separately if needed)
-- CREATE DATABASE bulk_payments;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS api_logs CASCADE;
DROP TABLE IF EXISTS bulk_items CASCADE;
DROP TABLE IF EXISTS bulk_batches CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'FINANCE', 'VIEWER')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Bulk batches table
CREATE TABLE bulk_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(150) NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    total_items INT NOT NULL DEFAULT 0,
    total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    currency CHAR(3) DEFAULT 'UGX',
    status VARCHAR(20) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'PROCESSING', 'DONE', 'PARTIAL', 'FAILED')),
    success_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    pending_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Bulk items table (individual transactions)
CREATE TABLE bulk_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES bulk_batches(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('MTN', 'AIRTEL')),
    amount NUMERIC(18,2) NOT NULL,
    currency CHAR(3) DEFAULT 'UGX',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED')),
    operator_tx_id VARCHAR(100),
    operator_raw_response JSONB,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- API logs table (audit trail)
CREATE TABLE api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(20),
    direction VARCHAR(10) CHECK (direction IN ('OUT', 'IN')),
    url TEXT,
    http_method VARCHAR(10),
    http_status INT,
    request_body JSONB,
    response_body JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX idx_bulk_batches_created_by ON bulk_batches(created_by);
CREATE INDEX idx_bulk_batches_status ON bulk_batches(status);
CREATE INDEX idx_bulk_batches_created_at ON bulk_batches(created_at);

CREATE INDEX idx_bulk_items_batch_id ON bulk_items(batch_id);
CREATE INDEX idx_bulk_items_status ON bulk_items(status);
CREATE INDEX idx_bulk_items_provider ON bulk_items(provider);
CREATE INDEX idx_bulk_items_operator_tx_id ON bulk_items(operator_tx_id);

CREATE INDEX idx_api_logs_provider ON api_logs(provider);
CREATE INDEX idx_api_logs_created_at ON api_logs(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bulk_batches_updated_at BEFORE UPDATE ON bulk_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bulk_items_updated_at BEFORE UPDATE ON bulk_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
-- Hash generated with bcrypt for 'admin123'
INSERT INTO users (name, email, password_hash, role) VALUES 
('System Admin', 'admin@smsconstruction.com', '$2b$10$rBV2kWq7hYZJ3Z8kKJ3Z3OGDYqZQyY5LxN5qXZvZ5qZqZqZqZqZqZ', 'ADMIN');

-- Sample data for testing (optional)
-- INSERT INTO users (name, email, password_hash, role) VALUES 
-- ('Finance Manager', 'finance@smsconstruction.com', '$2b$10$rBV2kWq7hYZJ3Z8kKJ3Z3OGDYqZQyY5LxN5qXZvZ5qZqZqZqZqZqZ', 'FINANCE'),
-- ('Viewer User', 'viewer@smsconstruction.com', '$2b$10$rBV2kWq7hYZJ3Z8kKJ3Z3OGDYqZQyY5LxN5qXZvZ5qZqZqZqZqZqZ', 'VIEWER');

COMMENT ON TABLE users IS 'System users with role-based access';
COMMENT ON TABLE bulk_batches IS 'Payment batches created from CSV or API';
COMMENT ON TABLE bulk_items IS 'Individual payment transactions within a batch';
COMMENT ON TABLE api_logs IS 'Audit log of all external API calls';
