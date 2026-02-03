-- Run both migrations to fix enum issues

-- 1. Add 'status_changed' to the activity_type enum
ALTER TYPE enum_request_activities_activity_type ADD VALUE IF NOT EXISTS 'status_changed';

-- 2. Add 'admin' to the file_type enum (optional - for future use)
-- Note: Currently using 'final_deliverable' for admin uploads
-- Uncomment below if you want to add 'admin' as a separate file type
-- ALTER TYPE enum_files_file_type ADD VALUE IF NOT EXISTS 'admin';

-- Note: These migrations add new values to enums to support:
-- - Tracking status change activities
-- - (Optional) Admin-uploaded files as a distinct type
