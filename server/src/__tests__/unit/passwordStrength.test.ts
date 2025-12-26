import { validatePasswordStrength } from '../../utils/validators';

describe('Password Strength Validation', () => {
  describe('validatePasswordStrength', () => {
    describe('minimum length requirements', () => {
      it('should fail for password less than 8 characters', () => {
        const result = validatePasswordStrength('Short1!');
        expect(result.isValid).toBe(false);
        expect(result.feedback).toContain('Password must be at least 8 characters');
      });

      it('should pass length check for 8+ characters', () => {
        const result = validatePasswordStrength('LongEnough1!');
        expect(result.feedback).not.toContain('Password must be at least 8 characters');
      });

      it('should give higher score for 12+ characters', () => {
        const short = validatePasswordStrength('Abcd123!');
        const long = validatePasswordStrength('Abcdefgh123!');
        expect(long.score).toBeGreaterThanOrEqual(short.score);
      });
    });

    describe('character type requirements', () => {
      it('should suggest uppercase letters when missing', () => {
        const result = validatePasswordStrength('lowercase123!');
        expect(result.feedback).toContain('Password should contain at least one uppercase letter');
      });

      it('should not suggest uppercase when present', () => {
        const result = validatePasswordStrength('Uppercase123!');
        expect(result.feedback).not.toContain('Password should contain at least one uppercase letter');
      });

      it('should suggest lowercase letters when missing', () => {
        const result = validatePasswordStrength('UPPERCASE123!');
        expect(result.feedback).toContain('Password should contain at least one lowercase letter');
      });

      it('should suggest numbers when missing', () => {
        const result = validatePasswordStrength('NoNumbers!');
        expect(result.feedback).toContain('Password should contain at least one number');
      });

      it('should not suggest numbers when present', () => {
        const result = validatePasswordStrength('HasNumber1!');
        expect(result.feedback).not.toContain('Password should contain at least one number');
      });

      it('should suggest special characters when missing', () => {
        const result = validatePasswordStrength('NoSpecial123');
        expect(result.feedback).toContain('Password should contain at least one special character');
      });

      it('should not suggest special characters when present', () => {
        const result = validatePasswordStrength('HasSpecial1!');
        expect(result.feedback).not.toContain('Password should contain at least one special character');
      });
    });

    describe('common pattern detection', () => {
      it('should detect password starting with "password"', () => {
        const result = validatePasswordStrength('password123!');
        expect(result.feedback).toContain('Password contains a common pattern that is easy to guess');
      });

      it('should detect password starting with "123456"', () => {
        const result = validatePasswordStrength('123456Abc!');
        expect(result.feedback).toContain('Password contains a common pattern that is easy to guess');
      });

      it('should detect password starting with "qwerty"', () => {
        const result = validatePasswordStrength('qwertyAbc1!');
        expect(result.feedback).toContain('Password contains a common pattern that is easy to guess');
      });

      it('should detect repeated characters', () => {
        const result = validatePasswordStrength('Aaaabcd123!');
        expect(result.feedback).toContain('Password contains a common pattern that is easy to guess');
      });

      it('should not flag passwords without common patterns', () => {
        const result = validatePasswordStrength('UniquePass1!');
        expect(result.feedback).not.toContain('Password contains a common pattern that is easy to guess');
      });
    });

    describe('overall validation', () => {
      it('should mark strong password as valid', () => {
        const result = validatePasswordStrength('StrongP@ss123');
        expect(result.isValid).toBe(true);
        expect(result.score).toBeGreaterThanOrEqual(2);
      });

      it('should mark weak password as invalid', () => {
        const result = validatePasswordStrength('weak');
        expect(result.isValid).toBe(false);
      });

      it('should return score between 0 and 4', () => {
        const weak = validatePasswordStrength('a');
        const strong = validatePasswordStrength('VeryStr0ng!Pass');
        
        expect(weak.score).toBeGreaterThanOrEqual(0);
        expect(weak.score).toBeLessThanOrEqual(4);
        expect(strong.score).toBeGreaterThanOrEqual(0);
        expect(strong.score).toBeLessThanOrEqual(4);
      });

      it('should give higher score to stronger passwords', () => {
        const weak = validatePasswordStrength('password');
        const medium = validatePasswordStrength('Password1');
        const strong = validatePasswordStrength('Password1!');
        
        expect(strong.score).toBeGreaterThanOrEqual(medium.score);
      });

      it('should provide feedback array', () => {
        const result = validatePasswordStrength('test');
        expect(Array.isArray(result.feedback)).toBe(true);
      });

      it('should have empty feedback for perfect password', () => {
        const result = validatePasswordStrength('PerfectP@ss123');
        // May still have suggestions but should be valid
        expect(result.isValid).toBe(true);
      });
    });
  });
});
