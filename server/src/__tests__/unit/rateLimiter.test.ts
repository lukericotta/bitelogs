import { apiLimiter, authLimiter, registrationLimiter, reviewLimiter } from '../../middleware/rateLimiter';

describe('Rate Limiters', () => {
  describe('apiLimiter', () => {
    it('should be defined', () => {
      expect(apiLimiter).toBeDefined();
    });

    it('should be a function (middleware)', () => {
      expect(typeof apiLimiter).toBe('function');
    });
  });

  describe('authLimiter', () => {
    it('should be defined', () => {
      expect(authLimiter).toBeDefined();
    });

    it('should be a function (middleware)', () => {
      expect(typeof authLimiter).toBe('function');
    });
  });

  describe('registrationLimiter', () => {
    it('should be defined', () => {
      expect(registrationLimiter).toBeDefined();
    });

    it('should be a function (middleware)', () => {
      expect(typeof registrationLimiter).toBe('function');
    });
  });

  describe('reviewLimiter', () => {
    it('should be defined', () => {
      expect(reviewLimiter).toBeDefined();
    });

    it('should be a function (middleware)', () => {
      expect(typeof reviewLimiter).toBe('function');
    });
  });

  describe('rate limiter behavior in test environment', () => {
    // Rate limiters should skip in test environment
    it('all limiters should be Express middleware functions', () => {
      // Express middleware has length of 3 (req, res, next)
      expect(apiLimiter.length).toBe(3);
      expect(authLimiter.length).toBe(3);
      expect(registrationLimiter.length).toBe(3);
      expect(reviewLimiter.length).toBe(3);
    });
  });
});
