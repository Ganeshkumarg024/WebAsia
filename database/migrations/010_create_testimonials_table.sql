-- Migration: 010_create_testimonials_table
-- Description: Create testimonials table for client feedback
-- Created: 2026-02-01

CREATE TYPE testimonial_status AS ENUM ('pending', 'approved', 'rejected', 'archived');

CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT NOT NULL,
    service_type service_type,
    is_public BOOLEAN DEFAULT FALSE,
    status testimonial_status NOT NULL DEFAULT 'pending',
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_testimonials_user_id ON testimonials(user_id);
CREATE INDEX idx_testimonials_request_id ON testimonials(request_id);
CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_testimonials_is_public ON testimonials(is_public);
CREATE INDEX idx_testimonials_featured ON testimonials(featured);
CREATE INDEX idx_testimonials_rating ON testimonials(rating);
CREATE INDEX idx_testimonials_service_type ON testimonials(service_type);

-- Trigger for updated_at
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE testimonials IS 'Client feedback and testimonials for completed requests';
COMMENT ON COLUMN testimonials.is_public IS 'User consent to display on public website';
COMMENT ON COLUMN testimonials.featured IS 'Featured testimonials shown on homepage';
COMMENT ON COLUMN testimonials.display_order IS 'Order for displaying testimonials';
