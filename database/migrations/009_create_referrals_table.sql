-- Migration: 009_create_referrals_table
-- Description: Create referrals table for tracking affiliate referrals
-- Created: 2026-02-01

CREATE TYPE referral_status AS ENUM ('clicked', 'registered', 'subscribed', 'converted', 'cancelled');

CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    referred_email VARCHAR(255),
    status referral_status NOT NULL DEFAULT 'clicked',
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    commission_amount DECIMAL(10, 2),
    commission_paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP,
    clicked_at TIMESTAMP,
    registered_at TIMESTAMP,
    converted_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_referrals_affiliate_id ON referrals(affiliate_id);
CREATE INDEX idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX idx_referrals_subscription_id ON referrals(subscription_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_commission_paid ON referrals(commission_paid);
CREATE INDEX idx_referrals_converted_at ON referrals(converted_at);

-- Trigger for updated_at
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE referrals IS 'Individual referral tracking for affiliate program';
COMMENT ON COLUMN referrals.metadata IS 'IP address, user agent, UTM parameters for attribution';
COMMENT ON COLUMN referrals.commission_amount IS 'Commission earned for this referral';
