# WebAsia Creative Services Platform

A subscription-based SaaS creative services marketplace built with the MERN stack.

## Project Structure

```
WebAsia-Platform/
├── backend/              # Node.js + Express API
├── frontend/             # React.js application
├── database/             # PostgreSQL migrations & seeds
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+
- Redis 6+
- AWS S3 account (or GCP Storage)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run migrate
npm run seed
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## Documentation

- [Implementation Plan](docs/implementation_plan.md)
- [Database Schema](docs/database_schema.md)
- [API Documentation](docs/api_documentation.md)
- [Frontend Architecture](docs/frontend_architecture.md)
- [Deployment Guide](docs/deployment_guide.md)

## Features

- 🔐 JWT Authentication with OAuth (Google, LinkedIn)
- 💳 Subscription Management (Razorpay + Stripe)
- 📝 Request Workflow System
- 💬 Real-time Messaging (Socket.io)
- 👥 Multi-role CRM (Client, Designer, Manager, Admin, Affiliate)
- 📊 Analytics Dashboard
- 🎨 Annotation Tool for Design Feedback
- 🔔 Real-time Notifications
- 💰 Affiliate System with Commission Tracking

## Tech Stack

**Backend:**
- Node.js + Express.js
- PostgreSQL + Redis
- Socket.io
- JWT Authentication
- AWS S3

**Frontend:**
- React 18
- Redux Toolkit
- Tailwind CSS
- Framer Motion
- Socket.io Client

## Development

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Lint code
npm run lint

# Format code
npm run format
```

## License

MIT License - WebAsia IT Solutions

## Support

For support, email support@webasia.in
