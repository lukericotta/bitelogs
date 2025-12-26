import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JwtPayload {
  userId: number;
  email: string;
  isAdmin: boolean;
}

export const generateToken = (payload: JwtPayload): string => {
  // FIX: Added type assertion to resolve TypeScript error
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && typeof decoded === 'object' && 'userId' in decoded) {
      return decoded as JwtPayload;
    }
    return null;
  } catch {
    return null;
  }
};
