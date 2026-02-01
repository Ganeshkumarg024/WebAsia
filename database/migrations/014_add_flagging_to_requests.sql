-- Migration: 014_add_flagging_to_requests
-- Description: Add is_flagged and flag_reason to requests table for moderation
-- Created: 2026-02-01

ALTER TABLE requests 
ADD COLUMN is_flagged BOOLEAN DEFAULT FALSE,
ADD COLUMN flag_reason TEXT;

CREATE INDEX idx_requests_is_flagged ON requests(is_flagged);

COMMENT ON COLUMN requests.is_flagged IS 'Whether the request thread has been flagged for moderation';
COMMENT ON COLUMN requests.flag_reason IS 'Reason why the request thread was flagged';
