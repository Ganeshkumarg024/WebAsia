-- Migration: 003_create_subscriptions_table
-- Description: Create subscriptions table for user subscriptions
-- Created: 2026-02-01

CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled', 'expired', 'past_due');

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status subscription_status NOT NULL DEFAULT 'active',
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    next_billing_date TIMESTAMP,
    auto_renew BOOLEAN DEFAULT TRUE,
    graphics_credits_remaining INTEGER DEFAULT 0,
    video_credits_remaining INTEGER DEFAULT 0,
    web_credits_remaining INTEGER DEFAULT 0,
    credits_reset_date TIMESTAMP,
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_billing_date ON subscriptions(next_billing_date);
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE subscriptions IS 'Active and historical user subscriptions';
COMMENT ON COLUMN subscriptions.graphics_credits_remaining IS 'Remaining graphics credits for current billing period';
COMMENT ON COLUMN subscriptions.video_credits_remaining IS 'Remaining video credits for current billing period';
COMMENT ON COLUMN subscriptions.web_credits_remaining IS 'Remaining web development credits for current billing period';
COMMENT ON COLUMN subscriptions.credits_reset_date IS 'Date when credits will be reset for next billing period';
