import {
  isValidEmail,
  isValidPassword,
  isRequired,
  isValidRating,
  isValidPriceRange,
  sanitizeString,
  validateRegistration,
  validateReview,
} from '../../utils/validators';

describe('Validators', () => {
  describe('isValidEmail', () => {
    it('should return true for simple valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should return true for email with dots', () => {
      expect(isValidEmail('user.name@domain.co')).toBe(true);
    });

    it('should return true for email with plus sign', () => {
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isValidEmail('')).toBe(false);
    });

    it('should return false for string without @', () => {
      expect(isValidEmail('invalid')).toBe(false);
    });

    it('should return false for email without TLD', () => {
      expect(isValidEmail('missing@domain')).toBe(false);
    });

    it('should return false for email without local part', () => {
      expect(isValidEmail('@nodomain.com')).toBe(false);
    });

    it('should return false for email with spaces', () => {
      expect(isValidEmail('spaces in@email.com')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for exactly 8 characters', () => {
      expect(isValidPassword('12345678')).toBe(true);
    });

    it('should return true for longer passwords', () => {
      expect(isValidPassword('longerpassword123')).toBe(true);
    });

    it('should return false for empty password', () => {
      expect(isValidPassword('')).toBe(false);
    });

    it('should return false for 7 character password', () => {
      expect(isValidPassword('1234567')).toBe(false);
    });

    it('should return false for short password', () => {
      expect(isValidPassword('short')).toBe(false);
    });
  });

  describe('isRequired', () => {
    it('should return true for non-empty string', () => {
      expect(isRequired('value')).toBe(true);
    });

    it('should return true for number', () => {
      expect(isRequired(123)).toBe(true);
    });

    it('should return true for zero', () => {
      expect(isRequired(0)).toBe(true);
    });

    it('should return true for false boolean', () => {
      expect(isRequired(false)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isRequired(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isRequired(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isRequired('')).toBe(false);
    });

    it('should return false for whitespace only', () => {
      expect(isRequired('   ')).toBe(false);
    });
  });

  describe('isValidRating', () => {
    it('should return true for rating 1', () => {
      expect(isValidRating(1)).toBe(true);
    });

    it('should return true for rating 3', () => {
      expect(isValidRating(3)).toBe(true);
    });

    it('should return true for rating 5', () => {
      expect(isValidRating(5)).toBe(true);
    });

    it('should return false for rating 0', () => {
      expect(isValidRating(0)).toBe(false);
    });

    it('should return false for rating 6', () => {
      expect(isValidRating(6)).toBe(false);
    });

    it('should return false for negative rating', () => {
      expect(isValidRating(-1)).toBe(false);
    });

    it('should return false for decimal rating', () => {
      expect(isValidRating(3.5)).toBe(false);
    });
  });

  describe('isValidPriceRange', () => {
    it('should return true for range 1', () => {
      expect(isValidPriceRange(1)).toBe(true);
    });

    it('should return true for range 2', () => {
      expect(isValidPriceRange(2)).toBe(true);
    });

    it('should return true for range 4', () => {
      expect(isValidPriceRange(4)).toBe(true);
    });

    it('should return false for range 0', () => {
      expect(isValidPriceRange(0)).toBe(false);
    });

    it('should return false for range 5', () => {
      expect(isValidPriceRange(5)).toBe(false);
    });

    it('should return false for decimal range', () => {
      expect(isValidPriceRange(2.5)).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should remove angle brackets', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('validateRegistration', () => {
    it('should return empty array for valid data', () => {
      const errors = validateRegistration({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      });
      expect(errors).toHaveLength(0);
    });

    it('should return errors for missing email', () => {
      const errors = validateRegistration({
        password: 'password123',
        displayName: 'Test User',
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('email');
    });

    it('should return errors for invalid email format', () => {
      const errors = validateRegistration({
        email: 'invalid-email',
        password: 'password123',
        displayName: 'Test User',
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('email');
    });

    it('should return errors for short password', () => {
      const errors = validateRegistration({
        email: 'test@example.com',
        password: 'short',
        displayName: 'Test User',
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('password');
    });

    it('should return errors for missing displayName', () => {
      const errors = validateRegistration({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('displayName');
    });

    it('should return multiple errors for empty data', () => {
      const errors = validateRegistration({});
      expect(errors.length).toBe(3);
    });
  });

  describe('validateReview', () => {
    it('should return empty array for valid data', () => {
      const errors = validateReview({
        menuItemId: 1,
        rating: 5,
      });
      expect(errors).toHaveLength(0);
    });

    it('should accept optional comment', () => {
      const errors = validateReview({
        menuItemId: 1,
        rating: 5,
        comment: 'Great food!',
      });
      expect(errors).toHaveLength(0);
    });

    it('should return error for rating too high', () => {
      const errors = validateReview({
        menuItemId: 1,
        rating: 10,
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('rating');
    });

    it('should return error for rating too low', () => {
      const errors = validateReview({
        menuItemId: 1,
        rating: 0,
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('rating');
    });

    it('should return error for missing menuItemId', () => {
      const errors = validateReview({
        rating: 5,
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('menuItemId');
    });

    it('should return multiple errors for empty data', () => {
      const errors = validateReview({});
      expect(errors.length).toBe(2);
    });
  });
});
