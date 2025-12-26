import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { UserModel } from '../models/User';
import { generateToken } from '../utils/jwt';
import { validateRegistration, sanitizeString } from '../utils/validators';
import { ValidationError, ConflictError, UnauthorizedError } from '../utils/errors';
import { authenticate } from '../middleware/auth';

const router = Router();
let userModel: UserModel;

export const initAuthRoutes = (pool: Pool): Router => {
  userModel = new UserModel(pool);
  return router;
};

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, displayName } = req.body;

    const errors = validateRegistration({ email, password, displayName });
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const user = await userModel.create(
      sanitizeString(email),
      password,
      sanitizeString(displayName)
    );

    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await userModel.verifyPassword(email, password);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    res.json({ user, token });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userModel.findById(req.user!.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
