-- Migration: 002_create_subscription_plans_table
-- Description: Create subscription plans table with pricing and features
-- Created: 2026-02-01

CREATE TYPE plan_duration AS ENUM ('weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE plan_status AS ENUM ('active', 'inactive', 'archived');

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    duration plan_duration NOT NULL DEFAULT 'monthly',
    status plan_status NOT NULL DEFAULT 'active',
    active_request_limit INTEGER NOT NULL DEFAULT 1,
    graphics_credits INTEGER DEFAULT 0,
    video_credits INTEGER DEFAULT 0,
    web_credits INTEGER DEFAULT 0,
    turnaround_hours INTEGER DEFAULT 48,
    features JSONB DEFAULT '[]',
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_subscription_plans_slug ON subscription_plans(slug);
CREATE INDEX idx_subscription_plans_status ON subscription_plans(status);
CREATE INDEX idx_subscription_plans_display_order ON subscription_plans(display_order);

-- Trigger for updated_at
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE subscription_plans IS 'Subscription plan templates with pricing and credit allocations';
COMMENT ON COLUMN subscription_plans.active_request_limit IS 'Maximum number of requests that can be active simultaneously';
COMMENT ON COLUMN subscription_plans.graphics_credits IS 'Monthly graphics design credits';
COMMENT ON COLUMN subscription_plans.video_credits IS 'Monthly video production credits';
COMMENT ON COLUMN subscription_plans.web_credits IS 'Monthly web development credits';
COMMENT ON COLUMN subscription_plans.turnaround_hours IS 'Standard SLA turnaround time in hours';
