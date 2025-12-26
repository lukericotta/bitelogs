import rateLimit from 'express-rate-limit';
import { config } from '../config';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.NODE_ENV === 'test' ? 1000 : 100, // 100 requests per 15 min in production
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.NODE_ENV === 'test', // Skip in tests
});

// Strict rate limiter for auth endpoints (prevents brute force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.NODE_ENV === 'test' ? 1000 : 5, // 5 attempts per 15 min in production
  message: {
    error: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.NODE_ENV === 'test', // Skip in tests
});

// Rate limiter for registration (prevents spam accounts)
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.NODE_ENV === 'test' ? 1000 : 3, // 3 registrations per hour per IP
  message: {
    error: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
    message: 'Too many accounts created from this IP, please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.NODE_ENV === 'test', // Skip in tests
});

// Rate limiter for reviews (prevents spam reviews)
export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.NODE_ENV === 'test' ? 1000 : 20, // 20 reviews per hour
  message: {
    error: 'REVIEW_RATE_LIMIT_EXCEEDED',
    message: 'Too many reviews submitted, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.NODE_ENV === 'test', // Skip in tests
});
