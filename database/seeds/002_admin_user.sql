-- Seed: 002_admin_user
-- Description: Create default admin user
-- Created: 2026-02-01
-- Note: Password is 'Admin@123' (hashed with bcrypt)

INSERT INTO users (
    id,
    email,
    password,
    first_name,
    last_name,
    phone,
    role,
    status,
    email_verified,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'admin@webasia.in',
    '$2a$10$YourHashedPasswordHere',  -- This should be replaced with actual bcrypt hash
    'WebAsia',
    'Admin',
    '+91-9876543210',
    'admin',
    'active',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Note: Before running this seed, generate a proper bcrypt hash for the password
-- You can use: bcrypt.hash('Admin@123', 10) in Node.js
-- Or run: node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin@123', 10).then(console.log);"
