-- Update files table to support local storage with role-based uploads
-- Migration: update_files_table_for_local_storage

-- Add new columns if they don't exist
DO $$ 
BEGIN
    -- Add file_path column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'files' AND column_name = 'file_path'
    ) THEN
        ALTER TABLE files ADD COLUMN file_path VARCHAR(500);
    END IF;

    -- Add uploaded_by_role column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'files' AND column_name = 'uploaded_by_role'
    ) THEN
        ALTER TABLE files ADD COLUMN uploaded_by_role VARCHAR(20);
    END IF;

    -- Add file_category column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'files' AND column_name = 'file_category'
    ) THEN
        ALTER TABLE files ADD COLUMN file_category VARCHAR(50) DEFAULT 'other';
    END IF;

    -- Add is_visible column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'files' AND column_name = 'is_visible'
    ) THEN
        ALTER TABLE files ADD COLUMN is_visible BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Update existing records with default values before adding constraints
UPDATE files 
SET 
    uploaded_by_role = COALESCE(uploaded_by_role, 'client'),
    file_category = COALESCE(file_category, 'other'),
    is_visible = COALESCE(is_visible, true)
WHERE uploaded_by_role IS NULL OR file_category IS NULL OR is_visible IS NULL;

-- Add constraints for uploaded_by_role
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'files_uploaded_by_role_check'
    ) THEN
        ALTER TABLE files 
        ADD CONSTRAINT files_uploaded_by_role_check 
        CHECK (uploaded_by_role IN ('client', 'designer', 'admin'));
    END IF;
END $$;

-- Add constraints for file_category
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'files_file_category_check'
    ) THEN
        ALTER TABLE files 
        ADD CONSTRAINT files_file_category_check 
        CHECK (file_category IN ('reference', 'deliverable', 'revision', 'brief', 'other'));
    END IF;
END $$;

-- Make s3 columns nullable if they exist and are NOT NULL
DO $$
BEGIN
    -- Check if s3_key exists and is NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'files' 
        AND column_name = 's3_key' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE files ALTER COLUMN s3_key DROP NOT NULL;
    END IF;

    -- Check if s3_bucket exists and is NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'files' 
        AND column_name = 's3_bucket' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE files ALTER COLUMN s3_bucket DROP NOT NULL;
    END IF;

    -- Check if s3_url exists and is NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'files' 
        AND column_name = 's3_url' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE files ALTER COLUMN s3_url DROP NOT NULL;
    END IF;
END $$;

-- Add indexes for new columns if they don't exist
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by_role ON files(uploaded_by_role);
CREATE INDEX IF NOT EXISTS idx_files_file_category ON files(file_category);
CREATE INDEX IF NOT EXISTS idx_files_is_visible ON files(is_visible);

-- Make new columns NOT NULL after setting defaults
ALTER TABLE files 
ALTER COLUMN file_category SET NOT NULL,
ALTER COLUMN is_visible SET NOT NULL;

-- Only set uploaded_by_role to NOT NULL if it has values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM files WHERE uploaded_by_role IS NULL
    ) THEN
        ALTER TABLE files ALTER COLUMN uploaded_by_role SET NOT NULL;
    END IF;
END $$;

-- Add comments
COMMENT ON COLUMN files.file_path IS 'Local file path relative to project root';
COMMENT ON COLUMN files.uploaded_by_role IS 'Role of user who uploaded the file (client, designer, admin)';
COMMENT ON COLUMN files.file_category IS 'Category of file (reference, deliverable, revision, brief, other)';
COMMENT ON COLUMN files.is_visible IS 'Whether file is visible to users (for soft delete/hide)';

