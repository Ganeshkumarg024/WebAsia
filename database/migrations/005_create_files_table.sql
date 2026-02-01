-- Migration: 005_create_files_table
-- Description: Create files table for uploads and deliveries
-- Created: 2026-02-01

CREATE TYPE file_type AS ENUM ('reference', 'brand_asset', 'design_version', 'final_delivery', 'message_attachment');
CREATE TYPE file_status AS ENUM ('uploading', 'processing', 'ready', 'failed', 'deleted');

CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_type file_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    file_size BIGINT,
    mime_type VARCHAR(100),
    status file_status NOT NULL DEFAULT 'uploading',
    version_number INTEGER DEFAULT 1,
    parent_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
    metadata JSONB,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_files_request_id ON files(request_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_file_type ON files(file_type);
CREATE INDEX idx_files_parent_file_id ON files(parent_file_id);
CREATE INDEX idx_files_status ON files(status);
CREATE INDEX idx_files_is_approved ON files(is_approved);

-- Trigger for updated_at
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE files IS 'All file uploads including references, brand assets, design versions, and final deliveries';
COMMENT ON COLUMN files.version_number IS 'Version number for design iterations';
COMMENT ON COLUMN files.parent_file_id IS 'Reference to previous version for version control';
COMMENT ON COLUMN files.metadata IS 'Additional file metadata like dimensions, duration, format details';
