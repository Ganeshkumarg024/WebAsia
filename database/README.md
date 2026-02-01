# WebAsia Database

This directory contains database migrations and seeds for the WebAsia Creative Services Platform.

## Structure

```
database/
├── migrations/       # SQL migration files
├── seeds/           # SQL seed files
├── migrate.js       # Migration runner script
└── README.md        # This file
```

## Prerequisites

- PostgreSQL 14+
- Node.js 18+
- Environment variables configured in backend/.env

## Environment Variables

Create a `.env` file in the `backend` directory with:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=webasia
DB_USER=postgres
DB_PASSWORD=your_password
```

## Usage

### Run Migrations

```bash
node migrate.js migrate
```

### Run Seeds

```bash
node migrate.js seed
```

### Fresh Install (Drop, Migrate, Seed)

```bash
node migrate.js fresh
```

⚠️ **Warning**: This will drop all existing tables and data!

### Reset Database (Drop and Migrate)

```bash
node migrate.js reset
```

## Migration Files

Migrations are numbered and run in order:

1. `001_create_users_table.sql` - Users table with all roles
2. `002_create_subscription_plans_table.sql` - Subscription plan templates
3. `003_create_subscriptions_table.sql` - User subscriptions
4. `004_create_requests_table.sql` - Creative service requests
5. `005_create_files_table.sql` - File uploads and deliveries
6. `006_create_messages_table.sql` - Real-time messaging
7. `007_create_notifications_table.sql` - User notifications
8. `008_create_affiliates_table.sql` - Affiliate program
9. `009_create_referrals_table.sql` - Referral tracking
10. `010_create_testimonials_table.sql` - Client feedback
11. `011_create_payments_table.sql` - Payment transactions
12. `012_create_request_activities_table.sql` - Request audit trail

## Seed Files

1. `001_subscription_plans.sql` - Default subscription plans
2. `002_admin_user.sql` - Default admin user
3. `003_sample_designers.sql` - Sample designer and manager users

## Database Schema

### Key Tables

- **users**: All platform users (clients, designers, managers, admins, affiliates)
- **subscription_plans**: Plan templates with pricing and features
- **subscriptions**: Active and historical user subscriptions
- **requests**: Client creative service requests
- **files**: File uploads, versions, and deliveries
- **messages**: Real-time communication
- **notifications**: User notifications
- **affiliates**: Affiliate program participants
- **referrals**: Referral tracking
- **testimonials**: Client feedback and reviews
- **payments**: Payment transactions
- **request_activities**: Request audit trail

### Relationships

- User → Subscriptions (one-to-many)
- Subscription → Requests (one-to-many)
- Request → Files (one-to-many)
- Request → Messages (one-to-many)
- Request → Activities (one-to-many)
- User → Affiliate (one-to-one)
- Affiliate → Referrals (one-to-many)

## Notes

- All tables use UUID primary keys
- Timestamps are automatically managed with triggers
- Soft deletes are not implemented (use status fields instead)
- Foreign keys use appropriate CASCADE/SET NULL strategies
- Indexes are created for common query patterns

## Troubleshooting

### Connection Issues

If you get connection errors, verify:
1. PostgreSQL is running
2. Database exists: `createdb webasia`
3. User has proper permissions
4. Environment variables are correct

### Migration Errors

If a migration fails:
1. Check the error message
2. Fix the SQL in the migration file
3. Run `node migrate.js reset` to start fresh
4. Re-run migrations

### Seed Data

The seed files include placeholder password hashes. Before using in production:

1. Generate proper bcrypt hashes:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword', 10).then(console.log);"
```

2. Replace the `$2a$10$YourHashedPasswordHere` placeholders in seed files
