-- Migration: 007_create_notifications_table
-- Description: Create notifications table for user notifications
-- Created: 2026-02-01

CREATE TYPE notification_type AS ENUM (
    'request_created', 'request_assigned', 'request_updated', 'request_completed',
    'message_received', 'file_uploaded', 'feedback_received', 'deadline_approaching',
    'subscription_expiring', 'payment_received', 'payment_failed', 'credits_low',
    'designer_submitted', 'manager_approved', 'manager_rejected'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- Trigger for updated_at
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE notifications IS 'User notifications for various platform events';
COMMENT ON COLUMN notifications.link IS 'Deep link to related resource (e.g., /requests/123)';
COMMENT ON COLUMN notifications.metadata IS 'Additional notification data like request ID, user ID';
