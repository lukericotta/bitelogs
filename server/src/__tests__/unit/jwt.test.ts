import { generateToken, verifyToken, decodeToken, JwtPayload } from '../../utils/jwt';

describe('JWT Utilities', () => {
  const mockPayload: JwtPayload = {
    userId: 1,
    email: 'test@example.com',
    isAdmin: false,
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = generateToken(mockPayload);
      const token2 = generateToken({ ...mockPayload, userId: 2 });
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return payload', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.isAdmin).toBe(mockPayload.isAdmin);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid.token.here')).toThrow();
    });

    it('should throw error for tampered token', () => {
      const token = generateToken(mockPayload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      expect(() => verifyToken(tamperedToken)).toThrow();
    });
  });

  describe('decodeToken', () => {
    it('should decode a valid token without verification', () => {
      const token = generateToken(mockPayload);
      const decoded = decodeToken(token);
      
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(mockPayload.userId);
    });

    it('should return payload with all fields', () => {
      const token = generateToken(mockPayload);
      const decoded = decodeToken(token);
      
      expect(decoded?.email).toBe(mockPayload.email);
      expect(decoded?.isAdmin).toBe(mockPayload.isAdmin);
    });

    it('should return null for invalid token format', () => {
      const decoded = decodeToken('not-a-valid-token');
      expect(decoded).toBeNull();
    });

    it('should return null for empty token', () => {
      const decoded = decodeToken('');
      expect(decoded).toBeNull();
    });
  });
});
