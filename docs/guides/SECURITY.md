# BiteLogs Security Guide

## Overview

BiteLogs implements multiple layers of security to protect user data and prevent common attacks. This document details all security measures in place.

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Security Layers                          │
├─────────────────────────────────────────────────────────────┤
│  Transport    │  HTTPS, HSTS                                │
├───────────────┼─────────────────────────────────────────────┤
│  Headers      │  Helmet (CSP, X-Frame, etc.)                │
├───────────────┼─────────────────────────────────────────────┤
│  Rate Limit   │  General API + Auth-specific limits         │
├───────────────┼─────────────────────────────────────────────┤
│  Auth         │  JWT tokens, bcrypt passwords               │
├───────────────┼─────────────────────────────────────────────┤
│  Validation   │  Input sanitization, type checking          │
├───────────────┼─────────────────────────────────────────────┤
│  Database     │  Parameterized queries                      │
└─────────────────────────────────────────────────────────────┘
```

## HTTP Security Headers

BiteLogs uses Helmet.js to set security headers:

### Content-Security-Policy (CSP)

```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  },
}
```

### Strict-Transport-Security (HSTS)

```javascript
hsts: {
  maxAge: 31536000,        // 1 year
  includeSubDomains: true,
  preload: true,
}
```

### Other Headers

| Header | Value | Purpose |
|--------|-------|---------|
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 1; mode=block | Legacy XSS protection |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer info |
| Permissions-Policy | camera=(), microphone=()... | Restrict browser features |

### Additional Headers

```javascript
// Custom security headers
res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
res.setHeader('Pragma', 'no-cache');
res.setHeader('Expires', '0');
res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
```

## Rate Limiting

### General API Rate Limit

```javascript
// 100 requests per 15 minutes per IP
generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
  standardHeaders: true,
});
```

### Authentication Rate Limit

```javascript
// 5 attempts per 15 minutes per IP (brute force protection)
authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,
  skipSuccessfulRequests: true,  // Don't count successful logins
});
```

### Password Reset Rate Limit

```javascript
// 3 requests per hour per IP
passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 3,
});
```

### Rate Limit Response

When rate limit is exceeded:

```json
{
  "error": "Too many requests",
  "message": "You have exceeded the rate limit. Please try again later.",
  "retryAfter": 15
}
```

## Authentication

### Password Requirements

Passwords must meet ALL of the following:

1. **Minimum 8 characters**
2. **At least one uppercase letter** (A-Z)
3. **At least one lowercase letter** (a-z)
4. **At least one number** (0-9)
5. **At least one special character** (!@#$%^&*()_+-=[]{}|;':",.<>/?)

Example valid passwords:
- `MyP@ssw0rd!`
- `Str0ng#Pass`
- `C0mpl3x!ty`

### Password Hashing

```javascript
// bcrypt with 10 rounds
const hash = await bcrypt.hash(password, 10);
```

### JWT Tokens

```javascript
// Token generation
const token = jwt.sign(
  { userId, email },
  JWT_SECRET,
  { expiresIn: '7d' }
);

// Token verification
const decoded = jwt.verify(token, JWT_SECRET);
```

### Token Storage

- Tokens stored in `localStorage` on client
- Sent via `Authorization: Bearer <token>` header
- 7-day expiration by default

## Input Validation

### Validation Functions

```typescript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
isValidEmail(email: string): boolean

// Password complexity
validatePasswordComplexity(password: string): {
  isValid: boolean;
  errors: string[];
}

// Rating validation (1-5)
isValidRating(rating: number): boolean

// Price range validation (1-4)
isValidPriceRange(range: number): boolean

// String sanitization
sanitizeString(str: string): string  // Removes < > characters
```

### Request Validation

All API endpoints validate:
1. Required fields present
2. Correct data types
3. Value ranges
4. String lengths

## SQL Injection Prevention

All database queries use parameterized queries:

```typescript
// SAFE: Parameterized query
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// NEVER: String concatenation (vulnerable)
// const result = await pool.query(
//   `SELECT * FROM users WHERE email = '${email}'`
// );
```

## XSS Prevention

### Server-side

1. Input sanitization removes `<` and `>` characters
2. CSP headers restrict script execution
3. JSON responses properly encoded

### Client-side

1. React automatically escapes rendered content
2. `dangerouslySetInnerHTML` not used
3. User input never directly inserted into DOM

## CORS Configuration

```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
```

## File Upload Security

```typescript
// Allowed file types
const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

// File size limit
const maxSize = 5 * 1024 * 1024; // 5MB

// File validation
if (!allowedMimes.includes(file.mimetype)) {
  throw new ValidationError('Invalid file type');
}
```

## Request Timeout

Client-side timeout prevents hung requests:

```typescript
// 30-second default timeout
const fetchWithTimeout = async (url, options, timeout = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};
```

## Error Handling

### Production Error Responses

In production, internal errors don't expose details:

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

### Development Error Responses

In development, full error details are returned for debugging:

```json
{
  "error": "ValidationError",
  "message": "Invalid email format",
  "stack": "..."
}
```

## Security Checklist

### Before Deployment

- [ ] Set strong `JWT_SECRET` (32+ characters)
- [ ] Use HTTPS in production
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Review rate limit settings
- [ ] Enable database SSL
- [ ] Set up log monitoring
- [ ] Configure backup strategy

### Regular Audits

- [ ] Review user permissions
- [ ] Check for dependency vulnerabilities (`npm audit`)
- [ ] Review access logs for anomalies
- [ ] Test rate limiting effectiveness
- [ ] Verify backup restoration

## Dependency Security

Regularly check for vulnerabilities:

```bash
# Check for vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# Review and manually update
npm audit --json
```

## Reporting Vulnerabilities

If you discover a security vulnerability:

1. **Do not** open a public issue
2. Email security details to the maintainers
3. Include steps to reproduce
4. Allow time for a fix before disclosure

## Security Best Practices for Users

1. **Use strong, unique passwords**
2. **Don't share JWT tokens**
3. **Log out on shared devices**
4. **Report suspicious activity**
5. **Keep your email address current**
