# WebAsia Backend - Setup Instructions

## Prerequisites

1. **PostgreSQL** installed and running
2. **Redis** installed and running (optional for development)
3. **Node.js** 18+ installed

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Configure Environment

```bash
# Copy the example environment file
copy .env.example .env

# Edit .env and set your database credentials
```

Minimum required environment variables:
```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=webasia_dev
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your-random-secret-key-min-32-chars
JWT_REFRESH_SECRET=another-random-secret-key-min-32-chars
```

## Step 3: Create PostgreSQL Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE webasia_dev;

-- Create user (optional)
CREATE USER webasia_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE webasia_dev TO webasia_user;

-- Exit
\q
```

## Step 4: Setup Database (Create Tables & Seed Data)

```bash
node scripts/setup-database.js
```

This will:
- ✅ Test database connection
- ✅ Create all tables (users, subscription_plans, subscriptions, requests)
- ✅ Seed subscription plans (Startup, Standard, Business, Enterprise)
- ✅ Create test users (admin, designer, client)

## Step 5: Start Development Server

```bash
npm run dev
```

You should see:
```
✅ Database connection established successfully.
✅ Database models synchronized
🚀 WebAsia Backend Server Started
================================
Environment: development
Port: 3000
API URL: http://localhost:3000/api
Health Check: http://localhost:3000/health
================================
```

## Test the API

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+919876543210"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@webasia.in",
    "password": "Admin@123"
  }'
```

### 4. Get Current User (Protected Route)
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Default Test Accounts

After running the seed script, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@webasia.in | Admin@123 |
| Designer | designer@webasia.in | Designer@123 |
| Client | client@webasia.in | Client@123 |

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -l`

### Port Already in Use
- Change `PORT` in `.env` to another port (e.g., 3001)

### Module Not Found Errors
- Delete `node_modules` and run `npm install` again
- Ensure you're using Node.js 18+: `node --version`

## Next Steps

1. Test all authentication endpoints
2. Create subscription management endpoints
3. Build request management system
4. Implement file upload functionality
5. Add WebSocket real-time features

---

**Happy Coding! 🚀**
