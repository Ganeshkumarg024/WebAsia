-- Migration: 004_create_requests_table
-- Description: Create requests table for client design requests
-- Created: 2026-02-01

CREATE TYPE service_type AS ENUM ('graphic_design', 'video_production', 'social_media', 'web_development', 'branding');
CREATE TYPE request_status AS ENUM ('queued', 'active', 'assigned', 'in_progress', 'pending_review', 'client_review', 'revision_requested', 'completed', 'cancelled');
CREATE TYPE request_priority AS ENUM ('normal', 'urgent');

CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    service_type service_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    specifications JSONB,
    status request_status NOT NULL DEFAULT 'queued',
    priority request_priority NOT NULL DEFAULT 'normal',
    queue_position INTEGER,
    assigned_designer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP,
    sla_hours INTEGER,
    deadline TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    credits_cost JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_requests_client_id ON requests(client_id);
CREATE INDEX idx_requests_assigned_designer_id ON requests(assigned_designer_id);
CREATE INDEX idx_requests_assigned_manager_id ON requests(assigned_manager_id);
CREATE INDEX idx_requests_subscription_id ON requests(subscription_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_service_type ON requests(service_type);
CREATE INDEX idx_requests_deadline ON requests(deadline);
CREATE INDEX idx_requests_priority ON requests(priority);
CREATE INDEX idx_requests_client_status ON requests(client_id, status);
CREATE INDEX idx_requests_designer_status ON requests(assigned_designer_id, status);

-- Trigger for updated_at
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-calculate deadline when assigned
CREATE OR REPLACE FUNCTION calculate_request_deadline()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.assigned_at IS NOT NULL AND NEW.deadline IS NULL AND NEW.sla_hours IS NOT NULL THEN
        NEW.deadline = NEW.assigned_at + (NEW.sla_hours || ' hours')::INTERVAL;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_request_deadline BEFORE INSERT OR UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION calculate_request_deadline();

COMMENT ON TABLE requests IS 'Client design and creative service requests';
COMMENT ON COLUMN requests.queue_position IS 'Position in queue when status is queued';
COMMENT ON COLUMN requests.sla_hours IS 'Service level agreement turnaround time in hours';
COMMENT ON COLUMN requests.specifications IS 'Detailed request specifications including dimensions, formats, references';
COMMENT ON COLUMN requests.credits_cost IS 'Credits deducted for this request by service type';
