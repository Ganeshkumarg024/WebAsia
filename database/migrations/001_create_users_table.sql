-- Migration: 001_create_users_table
-- Description: Create users table with all roles and authentication fields
-- Created: 2026-02-01

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('client', 'designer', 'manager', 'admin', 'affiliate');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'client',
    status user_status NOT NULL DEFAULT 'active',
    photo_url VARCHAR(500),
    bio TEXT,
    skills TEXT[],
    portfolio JSONB DEFAULT '{}',
    social_links JSONB DEFAULT '{}',
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    refresh_token TEXT,
    reset_password_token VARCHAR(255),
    reset_password_expiry TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expiry TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'All platform users including clients, designers, managers, admins, and affiliates';
COMMENT ON COLUMN users.role IS 'User role determines access level and dashboard type';
COMMENT ON COLUMN users.skills IS 'Array of skills for designers (e.g., logo design, video editing)';
COMMENT ON COLUMN users.portfolio IS 'Designer portfolio with work samples';
