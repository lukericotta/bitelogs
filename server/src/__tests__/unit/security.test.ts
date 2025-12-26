import { Request, Response, NextFunction } from 'express';
import {
  securityHeaders,
  generalRateLimiter,
  authRateLimiter,
  passwordResetRateLimiter,
  additionalSecurityHeaders,
} from '../../middleware/security';

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

  describe('generalRateLimiter', () => {
    it('should be defined', () => {
      expect(generalRateLimiter).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof generalRateLimiter).toBe('function');
    });

    it('should have correct arity for middleware', () => {
      expect(generalRateLimiter.length).toBe(3);
    });
  });

  describe('authRateLimiter', () => {
    it('should be defined', () => {
      expect(authRateLimiter).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof authRateLimiter).toBe('function');
    });

    it('should have correct arity for middleware', () => {
      expect(authRateLimiter.length).toBe(3);
    });
  });

  describe('passwordResetRateLimiter', () => {
    it('should be defined', () => {
      expect(passwordResetRateLimiter).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof passwordResetRateLimiter).toBe('function');
    });

    it('should have correct arity for middleware', () => {
      expect(passwordResetRateLimiter.length).toBe(3);
    });
  });

  describe('additionalSecurityHeaders', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    let setHeaderMock: jest.Mock;

    beforeEach(() => {
      mockReq = {};
      setHeaderMock = jest.fn();
      mockRes = {
        setHeader: setHeaderMock,
      };
      mockNext = jest.fn();
    });

    it('should be defined', () => {
      expect(additionalSecurityHeaders).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof additionalSecurityHeaders).toBe('function');
    });

    it('should call next()', () => {
      additionalSecurityHeaders(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set Cache-Control header', () => {
      additionalSecurityHeaders(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(setHeaderMock).toHaveBeenCalledWith(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      );
    });

    it('should set Pragma header', () => {
      additionalSecurityHeaders(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(setHeaderMock).toHaveBeenCalledWith('Pragma', 'no-cache');
    });

    it('should set Expires header', () => {
      additionalSecurityHeaders(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(setHeaderMock).toHaveBeenCalledWith('Expires', '0');
    });

    it('should set Permissions-Policy header', () => {
      additionalSecurityHeaders(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(setHeaderMock).toHaveBeenCalledWith(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=()'
      );
    });

    it('should set all required headers', () => {
      additionalSecurityHeaders(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );
      expect(setHeaderMock).toHaveBeenCalledTimes(4);
    });
  });
});
