# BiteLogs 🍔

A comprehensive crowdsourced web application that functions as a "Yelp for dishes" - focusing on rating and reviewing individual menu items rather than restaurants themselves.

## Overview

BiteLogs allows users to:
- Discover restaurants and browse specific menu items
- Share detailed culinary experiences through reviews and photos
- Find top-rated dishes across restaurants
- Track their food journey with a personal profile

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt password hashing
- **Image Processing**: Sharp
- **Security**: Helmet, express-rate-limit

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6

### Shared
- **Types**: Shared TypeScript types between client and server

## Project Structure

```
bitelogs/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context (auth)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client services
│   │   └── styles/         # Global styles
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── __tests__/      # Test files
│   │   ├── middleware/     # Express middleware
│   │   ├── migrations/     # Database migrations
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   └── ...
├── shared/                 # Shared TypeScript types
│   └── src/
│       └── types.ts
└── docs/                   # Documentation
    ├── design/             # Architecture & design docs
    ├── guides/             # Setup & usage guides
    └── api/                # API reference
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone and install dependencies**
   ```bash
   cd bitelogs
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

2. **Set up environment variables**
   ```bash
   # server/.env
   DATABASE_URL=postgresql://user:password@localhost:5432/bitelogs
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   PORT=3001
   ```

3. **Run database migrations**
   ```bash
   cd server
   npm run migrate
   npm run seed  # Optional: add demo data
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev

   # Terminal 2: Frontend
   cd client && npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - API: http://localhost:3001/api

## Testing

```bash
cd server

# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Test Results: 175/175 PASSED ✅**

| Test Suite | Tests |
|------------|-------|
| validators.test.ts | 51 |
| errors.test.ts | 21 |
| jwt.test.ts | 10 |
| auth.middleware.test.ts | 9 |
| rowTypes.test.ts | 44 |
| security.test.ts | 19 |
| logger.test.ts | 21 |

## Security Features

- **Rate Limiting**: Protects against brute force attacks
  - General API: 100 requests / 15 minutes
  - Auth endpoints: 5 attempts / 15 minutes
- **Security Headers**: Helmet middleware (CSP, HSTS, etc.)
- **Password Policy**: Complexity requirements enforced
- **Request Timeout**: 30-second timeout on API calls

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | User login |
| GET | /api/auth/me | Get current user |
| GET | /api/restaurants | List restaurants |
| GET | /api/restaurants/:id | Get restaurant details |
| GET | /api/menu-items | List menu items |
| GET | /api/menu-items/:id | Get menu item details |
| POST | /api/reviews | Create review |
| GET | /api/discover/top-rated | Get top rated dishes |
| GET | /api/discover/recent-photos | Get recent photos |

See [API Documentation](./docs/api/API.md) for full details.

## Documentation

- [Architecture](./docs/design/ARCHITECTURE.md)
- [Database Schema](./docs/design/DATABASE.md)
- [Development Phases](./docs/design/PHASES.md)
- [Testing Guide](./docs/guides/TESTING.md)
- [Deployment Guide](./docs/guides/DEPLOYMENT.md)
- [Security Guide](./docs/guides/SECURITY.md)
- [API Reference](./docs/api/API.md)

## Demo Credentials

After running `npm run seed`:
- **Email**: demo@example.com
- **Password**: Demo123!@#

## License

MIT
