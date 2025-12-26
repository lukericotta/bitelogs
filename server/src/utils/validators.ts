export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

// Enhanced password validation with complexity requirements
export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
}

export const validatePasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  // Minimum length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters');
  } else {
    score++;
    if (password.length >= 12) score++;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push('Password should contain at least one uppercase letter');
  } else {
    score++;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push('Password should contain at least one lowercase letter');
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    feedback.push('Password should contain at least one number');
  } else {
    score++;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Password should contain at least one special character');
  } else {
    score++;
  }

  // Common password patterns to avoid
  const commonPatterns = [
    /^password/i,
    /^123456/,
    /^qwerty/i,
    /^admin/i,
    /(.)\1{2,}/, // 3+ repeated characters
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      feedback.push('Password contains a common pattern that is easy to guess');
      score = Math.max(0, score - 1);
      break;
    }
  }

  return {
    isValid: password.length >= 8 && score >= 2,
    score: Math.min(4, score),
    feedback,
  };
};

export const isRequired = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

export const isValidRating = (rating: number): boolean => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

export const isValidPriceRange = (range: number): boolean => {
  return Number.isInteger(range) && range >= 1 && range <= 4;
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export interface FieldError {
  field: string;
  message: string;
}

export const validateRegistration = (data: {
  email?: string;
  password?: string;
  displayName?: string;
}): FieldError[] => {
  const errors: FieldError[] = [];

  if (!data.email || !isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }

  if (!data.password || !isValidPassword(data.password)) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }

  if (!data.displayName || !isRequired(data.displayName)) {
    errors.push({ field: 'displayName', message: 'Display name is required' });
  }

  return errors;
};

export const validateReview = (data: {
  menuItemId?: number;
  rating?: number;
  comment?: string;
}): FieldError[] => {
  const errors: FieldError[] = [];

  if (!data.menuItemId || !Number.isInteger(data.menuItemId)) {
    errors.push({ field: 'menuItemId', message: 'Valid menu item ID is required' });
  }

  if (!data.rating || !isValidRating(data.rating)) {
    errors.push({ field: 'rating', message: 'Rating must be between 1 and 5' });
  }

  return errors;
};
