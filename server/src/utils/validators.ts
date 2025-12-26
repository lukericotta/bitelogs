export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password complexity requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePasswordComplexity = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Simple password check (backwards compatible)
 * Use validatePasswordComplexity for detailed errors
 */
export const isValidPassword = (password: string): boolean => {
  return validatePasswordComplexity(password).isValid;
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

  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else {
    const passwordValidation = validatePasswordComplexity(data.password);
    if (!passwordValidation.isValid) {
      errors.push({ 
        field: 'password', 
        message: passwordValidation.errors.join('. ') 
      });
    }
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
