import { securityHeaders } from '../../middleware/security';

describe('Security Middleware', () => {
  describe('securityHeaders', () => {
    it('should be defined', () => {
      expect(securityHeaders).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof securityHeaders).toBe('function');
    });

    it('should return a middleware function', () => {
      const middleware = securityHeaders();
      expect(typeof middleware).toBe('function');
    });

    it('should return middleware with correct arity (req, res, next)', () => {
      const middleware = securityHeaders();
      // Helmet returns a function with length 3
      expect(middleware.length).toBe(3);
    });
  });

  describe('helmet integration', () => {
    it('should create middleware without throwing', () => {
      expect(() => securityHeaders()).not.toThrow();
    });

    it('should be callable multiple times', () => {
      const middleware1 = securityHeaders();
      const middleware2 = securityHeaders();
      expect(middleware1).toBeDefined();
      expect(middleware2).toBeDefined();
    });
  });
});
