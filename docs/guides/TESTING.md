# BiteLogs Testing Guide

## Overview

BiteLogs uses Jest as the testing framework for the backend. All tests are written in TypeScript and located in the `server/src/__tests__/` directory.

## Test Structure

```
server/src/__tests__/
├── setup.ts                    # Test environment setup
└── unit/
    ├── auth.middleware.test.ts # Auth middleware tests
    ├── errors.test.ts          # Error classes tests
    ├── jwt.test.ts             # JWT utility tests
    ├── logger.test.ts          # Logger utility tests
    ├── rowTypes.test.ts        # Database row type tests
    ├── security.test.ts        # Security middleware tests
    └── validators.test.ts      # Validator function tests
```

## Running Tests

### All Tests

```bash
cd server

# Run all tests
npm test

# Run with verbose output
npm test -- --verbose
```

### Unit Tests Only

```bash
npm run test:unit
```

### With Coverage

```bash
npm run test:coverage
```

Coverage report is generated in `server/coverage/` directory. Open `coverage/lcov-report/index.html` for detailed HTML report.

### Watch Mode

```bash
npm run test:watch
```

Automatically re-runs tests when files change.

## Test Results

**Current Status: 175/175 PASSED ✅**

| Test Suite | Tests | Description |
|------------|-------|-------------|
| validators.test.ts | 51 | Input validation functions |
| errors.test.ts | 21 | Custom error classes |
| jwt.test.ts | 10 | JWT token operations |
| auth.middleware.test.ts | 9 | Authentication middleware |
| rowTypes.test.ts | 44 | Database row interfaces |
| security.test.ts | 19 | Security middleware |
| logger.test.ts | 21 | Logging utility |

## Test Categories

### Validator Tests

Tests for all input validation functions:

```typescript
describe('isValidEmail', () => {
  it('should return true for valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });
  
  it('should return false for invalid email', () => {
    expect(isValidEmail('invalid')).toBe(false);
  });
});
```

**Covered Functions:**
- `isValidEmail` - Email format validation
- `isValidPassword` - Password complexity validation
- `validatePasswordComplexity` - Detailed password validation
- `isRequired` - Required field validation
- `isValidRating` - Rating range validation (1-5)
- `isValidPriceRange` - Price range validation (1-4)
- `sanitizeString` - Input sanitization
- `validateRegistration` - Registration data validation
- `validateReview` - Review data validation

### Error Class Tests

Tests for custom error classes:

```typescript
describe('NotFoundError', () => {
  it('should have correct status code', () => {
    const error = new NotFoundError('Resource not found');
    expect(error.statusCode).toBe(404);
  });
  
  it('should have correct message', () => {
    const error = new NotFoundError('User not found');
    expect(error.message).toBe('User not found');
  });
});
```

**Covered Classes:**
- `AppError` - Base error class
- `ValidationError` - 400 Bad Request
- `AuthenticationError` - 401 Unauthorized
- `ForbiddenError` - 403 Forbidden
- `NotFoundError` - 404 Not Found
- `ConflictError` - 409 Conflict

### JWT Tests

Tests for JWT token operations:

```typescript
describe('generateToken', () => {
  it('should generate valid JWT', () => {
    const token = generateToken({ userId: 1, email: 'test@example.com' });
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });
});
```

**Covered Functions:**
- `generateToken` - Token generation
- `verifyToken` - Token verification
- `decodeToken` - Token decoding

### Auth Middleware Tests

Tests for authentication middleware:

```typescript
describe('authenticate', () => {
  it('should call next() for valid token', () => {
    // ... mock setup
    authenticate(req, res, next);
    expect(next).toHaveBeenCalled();
  });
  
  it('should return 401 for missing token', () => {
    // ... mock setup
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
```

**Covered Middleware:**
- `authenticate` - Required authentication
- `optionalAuth` - Optional authentication
- `requireAdmin` - Admin authorization

### Security Middleware Tests

Tests for security middleware:

```typescript
describe('securityHeaders', () => {
  it('should return middleware function', () => {
    const middleware = securityHeaders();
    expect(typeof middleware).toBe('function');
  });
});

describe('additionalSecurityHeaders', () => {
  it('should set Cache-Control header', () => {
    additionalSecurityHeaders(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Cache-Control',
      expect.any(String)
    );
  });
});
```

**Covered Middleware:**
- `securityHeaders` - Helmet configuration
- `generalRateLimiter` - General rate limiting
- `authRateLimiter` - Auth endpoint rate limiting
- `passwordResetRateLimiter` - Password reset rate limiting
- `additionalSecurityHeaders` - Custom security headers

### Logger Tests

Tests for logging utility:

```typescript
describe('logger', () => {
  it('should log info messages', () => {
    logger.info('test message');
    expect(console.info).toHaveBeenCalled();
  });
  
  it('should log HTTP requests appropriately', () => {
    logger.http('GET', '/api/test', 200, 50);
    expect(console.info).toHaveBeenCalled();
    
    logger.http('GET', '/api/error', 500, 100);
    expect(console.error).toHaveBeenCalled();
  });
});
```

**Covered Methods:**
- `logger.debug` - Debug level logging
- `logger.info` - Info level logging
- `logger.warn` - Warning level logging
- `logger.error` - Error level logging
- `logger.http` - HTTP request logging

### Row Type Tests

Tests for database row interfaces:

```typescript
describe('UserRow', () => {
  it('should allow index signature access', () => {
    const row: UserRow = {
      id: 1,
      email: 'test@example.com',
      // ... other fields
    };
    expect(row['id']).toBe(1);
  });
});
```

**Covered Interfaces:**
- `UserRow` - User table row type
- `RestaurantRow` - Restaurant table row type
- `MenuItemRow` - Menu item table row type
- `ReviewRow` - Review table row type

## Writing New Tests

### Test File Template

```typescript
import { functionToTest } from '../../path/to/module';

describe('ModuleName', () => {
  describe('functionToTest', () => {
    // Setup
    beforeEach(() => {
      // Reset state, create mocks
    });

    afterEach(() => {
      // Cleanup
    });

    it('should handle normal case', () => {
      const result = functionToTest('input');
      expect(result).toBe('expected');
    });

    it('should handle edge case', () => {
      expect(() => functionToTest('')).toThrow();
    });
  });
});
```

### Mocking

```typescript
// Mock a module
jest.mock('../../utils/someModule', () => ({
  someFunction: jest.fn().mockReturnValue('mocked'),
}));

// Mock Express req/res
const mockReq = {
  headers: {},
  body: {},
} as Partial<Request>;

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as Partial<Response>;

const mockNext = jest.fn();
```

### Best Practices

1. **One assertion per test** when possible
2. **Descriptive test names** that explain the scenario
3. **Arrange-Act-Assert** pattern
4. **Test edge cases** and error conditions
5. **Mock external dependencies**
6. **Keep tests independent** - no shared state

## Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| Statements | 80% | ~25% |
| Branches | 75% | ~27% |
| Functions | 80% | ~22% |
| Lines | 80% | ~24% |

Note: Current coverage is lower because models and routes require database integration tests. Unit tests focus on utilities and middleware.

## Continuous Integration

For CI/CD pipelines, use:

```bash
# Run tests with coverage and fail if thresholds not met
npm run test:coverage -- --ci --coverage --coverageThreshold='{"global":{"branches":20,"functions":20,"lines":20,"statements":20}}'
```
