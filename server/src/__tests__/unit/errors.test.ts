import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from '../../utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with status code and message', () => {
      const error = new AppError(500, 'Something went wrong', 'INTERNAL_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Something went wrong');
      expect(error.code).toBe('INTERNAL_ERROR');
    });

    it('should set the name property', () => {
      const error = new AppError(500, 'Test');
      expect(error.name).toBe('AppError');
    });

    it('should be instance of Error', () => {
      const error = new AppError(400, 'Bad request');
      expect(error).toBeInstanceOf(Error);
    });

    it('should work without code parameter', () => {
      const error = new AppError(500, 'No code');
      expect(error.code).toBeUndefined();
    });
  });

  describe('ValidationError', () => {
    it('should have 422 status code', () => {
      const error = new ValidationError('Validation failed');
      expect(error.statusCode).toBe(422);
    });

    it('should have VALIDATION_ERROR code', () => {
      const error = new ValidationError('Test');
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should set the name property', () => {
      const error = new ValidationError('Test');
      expect(error.name).toBe('ValidationError');
    });

    it('should include field errors when provided', () => {
      const fieldErrors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' },
      ];
      const error = new ValidationError('Validation failed', fieldErrors);
      expect(error.errors).toEqual(fieldErrors);
    });

    it('should have undefined errors when not provided', () => {
      const error = new ValidationError('No errors');
      expect(error.errors).toBeUndefined();
    });
  });

  describe('NotFoundError', () => {
    it('should have 404 status code', () => {
      const error = new NotFoundError('User');
      expect(error.statusCode).toBe(404);
    });

    it('should format message with resource name', () => {
      const error = new NotFoundError('User');
      expect(error.message).toBe('User not found');
    });

    it('should have NOT_FOUND code', () => {
      const error = new NotFoundError('Item');
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should set the name property', () => {
      const error = new NotFoundError('Test');
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('UnauthorizedError', () => {
    it('should have 401 status code', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
    });

    it('should have default message', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized');
    });

    it('should accept custom message', () => {
      const error = new UnauthorizedError('Invalid credentials');
      expect(error.message).toBe('Invalid credentials');
    });

    it('should have UNAUTHORIZED code', () => {
      const error = new UnauthorizedError();
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should set the name property', () => {
      const error = new UnauthorizedError();
      expect(error.name).toBe('UnauthorizedError');
    });
  });

  describe('ForbiddenError', () => {
    it('should have 403 status code', () => {
      const error = new ForbiddenError();
      expect(error.statusCode).toBe(403);
    });

    it('should have default message', () => {
      const error = new ForbiddenError();
      expect(error.message).toBe('Forbidden');
    });

    it('should have FORBIDDEN code', () => {
      const error = new ForbiddenError();
      expect(error.code).toBe('FORBIDDEN');
    });

    it('should accept custom message', () => {
      const error = new ForbiddenError('Access denied');
      expect(error.message).toBe('Access denied');
    });
  });

  describe('ConflictError', () => {
    it('should have 409 status code', () => {
      const error = new ConflictError('Email already exists');
      expect(error.statusCode).toBe(409);
    });

    it('should set the message', () => {
      const error = new ConflictError('Duplicate entry');
      expect(error.message).toBe('Duplicate entry');
    });

    it('should have CONFLICT code', () => {
      const error = new ConflictError('Test');
      expect(error.code).toBe('CONFLICT');
    });
  });

  describe('BadRequestError', () => {
    it('should have 400 status code', () => {
      const error = new BadRequestError('Invalid input');
      expect(error.statusCode).toBe(400);
    });

    it('should set the message', () => {
      const error = new BadRequestError('Bad data');
      expect(error.message).toBe('Bad data');
    });

    it('should have BAD_REQUEST code', () => {
      const error = new BadRequestError('Test');
      expect(error.code).toBe('BAD_REQUEST');
    });
  });

  describe('Error inheritance', () => {
    it('ValidationError should be instance of AppError', () => {
      expect(new ValidationError('test')).toBeInstanceOf(AppError);
    });

    it('NotFoundError should be instance of AppError', () => {
      expect(new NotFoundError('test')).toBeInstanceOf(AppError);
    });

    it('UnauthorizedError should be instance of AppError', () => {
      expect(new UnauthorizedError()).toBeInstanceOf(AppError);
    });

    it('ForbiddenError should be instance of AppError', () => {
      expect(new ForbiddenError()).toBeInstanceOf(AppError);
    });

    it('ConflictError should be instance of AppError', () => {
      expect(new ConflictError('test')).toBeInstanceOf(AppError);
    });

    it('BadRequestError should be instance of AppError', () => {
      expect(new BadRequestError('test')).toBeInstanceOf(AppError);
    });
  });
});
