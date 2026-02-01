-- Migration: 013_add_manager_id_to_users
-- Description: Add manager_id to users table to support Manager Pods / Team Mapping
-- Created: 2026-02-01

ALTER TABLE users 
ADD COLUMN manager_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_users_manager_id ON users(manager_id);

COMMENT ON COLUMN users.manager_id IS 'Reference to the manager assigned to this user (e.g., designer assigned to a manager pod)';
