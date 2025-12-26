# BiteLogs Architecture

## System Overview

BiteLogs is a full-stack web application built with a modern JavaScript/TypeScript stack. The architecture follows a client-server model with a clear separation of concerns.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   React Client  │────▶│  Express API    │────▶│   PostgreSQL    │
│   (Vite/TS)     │     │  (Node.js/TS)   │     │   Database      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Shared Types   │     │   File Storage  │
│  (@bitelogs/    │     │   (Local/S3)    │
│   shared)       │     │                 │
└─────────────────┘     └─────────────────┘
```

## Component Architecture

### Frontend (client/)

```
src/
├── components/
│   ├── layout/           # Layout components (Header, Footer)
│   ├── ui/               # Reusable UI (Button, Input, StarRating)
│   └── ErrorBoundary.tsx # Error boundary wrapper
├── context/
│   └── AuthContext.tsx   # Authentication state management
├── pages/                # Route page components
├── services/             # API client modules
│   ├── api.ts            # Base API client with timeout
│   ├── auth.ts           # Auth service
│   ├── restaurants.ts    # Restaurant service
│   ├── menuItems.ts      # Menu items service
│   ├── reviews.ts        # Reviews service
│   └── discovery.ts      # Discovery service
└── styles/               # Global CSS
```

### Backend (server/)

```
src/
├── __tests__/            # Test files
│   ├── unit/             # Unit tests
│   └── setup.ts          # Test configuration
├── middleware/
│   ├── auth.ts           # JWT authentication
│   ├── security.ts       # Helmet & rate limiting
│   ├── upload.ts         # File upload handling
│   └── errorHandler.ts   # Global error handler
├── migrations/
│   ├── migrate.ts        # Database migrations
│   └── seed.ts           # Demo data seeding
├── models/
│   ├── User.ts           # User model
│   ├── Restaurant.ts     # Restaurant model
│   ├── MenuItem.ts       # Menu item model
│   └── Review.ts         # Review model
├── routes/
│   ├── auth.ts           # Auth endpoints
│   ├── restaurants.ts    # Restaurant CRUD
│   ├── menuItems.ts      # Menu item CRUD
│   ├── reviews.ts        # Review CRUD
│   ├── discovery.ts      # Discovery endpoints
│   └── health.ts         # Health checks
└── utils/
    ├── jwt.ts            # JWT utilities
    ├── validators.ts     # Input validation
    ├── errors.ts         # Custom error classes
    └── logger.ts         # Structured logging
```

## Data Flow

### Authentication Flow

```
1. User submits credentials
   │
   ▼
2. POST /api/auth/login
   │
   ▼
3. Server validates credentials
   │
   ▼
4. Server generates JWT token
   │
   ▼
5. Client stores token in localStorage
   │
   ▼
6. Subsequent requests include token in Authorization header
   │
   ▼
7. Server validates token via authenticate middleware
```

### Review Creation Flow

```
1. User fills review form
   │
   ▼
2. Client validates input
   │
   ▼
3. POST /api/reviews with JWT
   │
   ▼
4. Server validates token
   │
   ▼
5. Server validates review data
   │
   ▼
6. Server creates review in database
   │
   ▼
7. Server updates menu item average rating
   │
   ▼
8. Response returned to client
```

## Security Architecture

### Layers of Security

1. **Transport Security**
   - HTTPS in production
   - Strict-Transport-Security header

2. **Request Security**
   - Rate limiting (general + auth-specific)
   - Request timeout (30s default)
   - Content-Security-Policy headers

3. **Authentication Security**
   - JWT tokens with expiration
   - bcrypt password hashing (10 rounds)
   - Password complexity requirements

4. **Data Security**
   - Input validation and sanitization
   - SQL parameterized queries
   - XSS protection headers

### Security Middleware Stack

```typescript
// Applied in order:
app.use(securityHeaders());         // Helmet
app.use(additionalSecurityHeaders); // Custom headers
app.use('/api', generalRateLimiter);
app.use('/api/auth', authRateLimiter);
```

## Error Handling

### Error Class Hierarchy

```
Error
└── AppError (base class)
    ├── ValidationError (400)
    ├── AuthenticationError (401)
    ├── ForbiddenError (403)
    ├── NotFoundError (404)
    └── ConflictError (409)
```

### Global Error Handler

All errors pass through a centralized error handler that:
- Logs errors appropriately
- Formats consistent error responses
- Hides internal details in production

## Scalability Considerations

### Current Design (Single Server)

- Stateless API (JWT tokens)
- Connection pooling for PostgreSQL
- Local file storage for uploads

### Future Scaling Path

1. **Horizontal Scaling**
   - Load balancer in front of multiple API instances
   - Move sessions to Redis if needed

2. **Database Scaling**
   - Read replicas for query distribution
   - Connection pooling with PgBouncer

3. **File Storage**
   - Move to S3 or similar object storage
   - CDN for static assets

4. **Caching**
   - Redis for frequently accessed data
   - Cache invalidation on writes

## Development Principles

1. **Type Safety**: TypeScript throughout the stack
2. **Shared Types**: Common types in @bitelogs/shared
3. **Separation of Concerns**: Clear boundaries between layers
4. **Error Handling**: Consistent error responses
5. **Testing**: Unit tests for utilities and middleware
6. **Security First**: Security considered at every layer
