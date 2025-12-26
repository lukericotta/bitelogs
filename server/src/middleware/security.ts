import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Security headers middleware using helmet
 * Configures various HTTP headers for security
 */
export const securityHeaders = (): RequestHandler => {
  return helmet({
    // Content Security Policy
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
    },
    // Strict-Transport-Security
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    // X-Content-Type-Options: nosniff
    noSniff: true,
    // X-Frame-Options: DENY
    frameguard: { action: 'deny' },
    // X-XSS-Protection (legacy but still useful)
    xssFilter: true,
    // Referrer-Policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });
};

/**
 * Rate limiter for general API endpoints
 * Allows 100 requests per 15 minutes per IP
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: 15,
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skipSuccessfulRequests: false,
  keyGenerator: (req: Request): string => {
    // Use X-Forwarded-For if behind a proxy, otherwise use IP
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
      || req.ip 
      || 'unknown';
  },
});

/**
 * Stricter rate limiter for authentication endpoints
 * Allows 5 requests per 15 minutes per IP to prevent brute force
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/register attempts per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many login attempts. Please try again in 15 minutes.',
    retryAfter: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  keyGenerator: (req: Request): string => {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
      || req.ip 
      || 'unknown';
  },
});

/**
 * Rate limiter for password reset endpoints
 * Very strict: 3 requests per hour
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    error: 'Too many password reset attempts',
    message: 'Too many password reset attempts. Please try again in an hour.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Custom middleware to add security-related response headers
 */
export const additionalSecurityHeaders = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Prevent caching of sensitive data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Permissions Policy (formerly Feature-Policy)
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  
  next();
};
