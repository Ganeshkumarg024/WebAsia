-- Seed: 003_sample_designers
-- Description: Create sample designer users for development
-- Created: 2026-02-01

INSERT INTO users (
    id,
    email,
    password,
    first_name,
    last_name,
    role,
    status,
    skills,
    bio,
    email_verified,
    created_at,
    updated_at
) VALUES
(
    uuid_generate_v4(),
    'designer1@webasia.in',
    '$2a$10$YourHashedPasswordHere',  -- Replace with bcrypt hash of 'Designer@123'
    'Priya',
    'Sharma',
    'designer',
    'active',
    ARRAY['graphic_design', 'social_media', 'branding'],
    'Senior graphic designer with 5+ years of experience in brand identity and social media design.',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    uuid_generate_v4(),
    'designer2@webasia.in',
    '$2a$10$YourHashedPasswordHere',  -- Replace with bcrypt hash of 'Designer@123'
    'Rahul',
    'Kumar',
    'designer',
    'active',
    ARRAY['video_production', 'motion_graphics'],
    'Video editor and motion graphics specialist. Expert in creating engaging social media videos.',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    uuid_generate_v4(),
    'designer3@webasia.in',
    '$2a$10$YourHashedPasswordHere',  -- Replace with bcrypt hash of 'Designer@123'
    'Anjali',
    'Patel',
    'designer',
    'active',
    ARRAY['web_development', 'ui_design'],
    'Full-stack web developer and UI designer. Specialized in responsive web applications.',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Create a sample manager user
INSERT INTO users (
    id,
    email,
    password,
    first_name,
    last_name,
    role,
    status,
    bio,
    email_verified,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'manager@webasia.in',
    '$2a$10$YourHashedPasswordHere',  -- Replace with bcrypt hash of 'Manager@123'
    'Vikram',
    'Singh',
    'manager',
    'active',
    'Project manager with expertise in creative workflow management and quality assurance.',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
