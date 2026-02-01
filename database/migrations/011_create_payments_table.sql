-- Migration: 011_create_payments_table
-- Description: Create payments table for transaction tracking
-- Created: 2026-02-01

CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE payment_gateway AS ENUM ('razorpay', 'stripe');

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status payment_status NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_gateway payment_gateway NOT NULL,
    gateway_order_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),
    gateway_signature VARCHAR(500),
    invoice_number VARCHAR(100) UNIQUE,
    invoice_url VARCHAR(500),
    receipt_url VARCHAR(500),
    refund_amount DECIMAL(10, 2),
    refund_reason TEXT,
    refunded_at TIMESTAMP,
    metadata JSONB,
    failure_reason TEXT,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_gateway_order_id ON payments(gateway_order_id);
CREATE INDEX idx_payments_gateway_payment_id ON payments(gateway_payment_id);
CREATE UNIQUE INDEX idx_payments_invoice_number ON payments(invoice_number);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);

-- Trigger for updated_at
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL AND NEW.status = 'completed' THEN
        NEW.invoice_number = 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(nextval('invoice_sequence')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE SEQUENCE invoice_sequence START 1;

CREATE TRIGGER set_invoice_number BEFORE INSERT OR UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

COMMENT ON TABLE payments IS 'All payment transactions including subscriptions and one-time payments';
COMMENT ON COLUMN payments.gateway_signature IS 'Payment gateway signature for verification';
COMMENT ON COLUMN payments.metadata IS 'Additional payment details from gateway';
