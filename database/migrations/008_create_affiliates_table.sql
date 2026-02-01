-- Migration: 008_create_affiliates_table
-- Description: Create affiliates table for affiliate program
-- Created: 2026-02-01

CREATE TYPE affiliate_status AS ENUM ('active', 'suspended', 'inactive');

CREATE TABLE affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(50) NOT NULL UNIQUE,
    commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 15.00,
    total_referrals INTEGER DEFAULT 0,
    successful_conversions INTEGER DEFAULT 0,
    total_earnings DECIMAL(10, 2) DEFAULT 0.00,
    pending_earnings DECIMAL(10, 2) DEFAULT 0.00,
    paid_earnings DECIMAL(10, 2) DEFAULT 0.00,
    payout_details JSONB,
    status affiliate_status NOT NULL DEFAULT 'active',
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX idx_affiliates_user_id ON affiliates(user_id);
CREATE UNIQUE INDEX idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX idx_affiliates_status ON affiliates(status);

-- Trigger for updated_at
CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON affiliates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE affiliates IS 'Affiliate partners who refer new users to the platform';
COMMENT ON COLUMN affiliates.referral_code IS 'Unique referral code for tracking';
COMMENT ON COLUMN affiliates.commission_rate IS 'Commission percentage (e.g., 15.00 for 15%)';
COMMENT ON COLUMN affiliates.payout_details IS 'Bank account, UPI, PayPal details for payouts';
