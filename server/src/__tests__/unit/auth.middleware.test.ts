import { Request, Response, NextFunction } from 'express';
import { authenticate, optionalAuth, requireAdmin } from '../../middleware/auth';
import { generateToken } from '../../utils/jwt';
import { UnauthorizedError } from '../../utils/errors';

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    it('should call next with error when no token provided', () => {
      authenticate(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next with error when token format is invalid', () => {
      mockReq.headers = { authorization: 'InvalidFormat token' };
      authenticate(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should set user on request and call next for valid token', () => {
      const token = generateToken({ userId: 1, email: 'test@example.com', isAdmin: false });
      mockReq.headers = { authorization: `Bearer ${token}` };
      
      authenticate(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?.userId).toBe(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next with error for invalid token', () => {
      mockReq.headers = { authorization: 'Bearer invalid.token.here' };
      authenticate(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });
  });

  describe('optionalAuth', () => {
    it('should call next without user when no token provided', () => {
      optionalAuth(mockReq as Request, mockRes as Response, mockNext);
      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should set user for valid token', () => {
      const token = generateToken({ userId: 1, email: 'test@example.com', isAdmin: false });
      mockReq.headers = { authorization: `Bearer ${token}` };
      
      optionalAuth(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?.userId).toBe(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next without user for invalid token', () => {
      mockReq.headers = { authorization: 'Bearer invalid.token' };
      optionalAuth(mockReq as Request, mockRes as Response, mockNext);
      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('requireAdmin', () => {
    it('should call next with error when user is not admin', () => {
      mockReq.user = { userId: 1, email: 'test@example.com', isAdmin: false };
      requireAdmin(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next when user is admin', () => {
      mockReq.user = { userId: 1, email: 'admin@example.com', isAdmin: true };
      requireAdmin(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
