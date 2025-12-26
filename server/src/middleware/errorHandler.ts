import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { config } from '../config';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error in development
  if (config.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
    return;
  }

  // Multer errors
  if (err.name === 'MulterError') {
    res.status(400).json({
      error: 'UPLOAD_ERROR',
      message: err.message,
    });
    return;
  }

  // Default error
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: config.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
  });
};
