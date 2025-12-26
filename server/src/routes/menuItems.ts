import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { MenuItemModel } from '../models/MenuItem';
import { ReviewModel } from '../models/Review';
import { authenticate, optionalAuth } from '../middleware/auth';
import { upload, processImage, saveImageLocally } from '../middleware/upload';
import { ValidationError, NotFoundError } from '../utils/errors';
import { isRequired, sanitizeString } from '../utils/validators';

const router = Router();
let menuItemModel: MenuItemModel;
let reviewModel: ReviewModel;

export const initMenuItemRoutes = (pool: Pool): Router => {
  menuItemModel = new MenuItemModel(pool);
  reviewModel = new ReviewModel(pool);
  return router;
};

// GET /api/menu-items/:id
router.get('/:id', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const menuItem = await menuItemModel.findById(id);
    
    if (!menuItem) {
      throw new NotFoundError('Menu item');
    }

    res.json({ menuItem });
  } catch (error) {
    next(error);
  }
});

// GET /api/menu-items/:id/reviews
router.get('/:id/reviews', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { page, limit } = req.query;
    
    const menuItem = await menuItemModel.findById(id);
    if (!menuItem) {
      throw new NotFoundError('Menu item');
    }

    const result = await reviewModel.findByMenuItem(id, {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/restaurants/:restaurantId/menu-items
router.get('/restaurant/:restaurantId', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId, 10);
    const { page, limit, category } = req.query;
    
    const result = await menuItemModel.findByRestaurant(restaurantId, {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      category: category as string,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/menu-items
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { restaurantId, name, description, price, category } = req.body;
    const errors: Array<{ field: string; message: string }> = [];

    if (!restaurantId) errors.push({ field: 'restaurantId', message: 'Restaurant ID is required' });
    if (!isRequired(name)) errors.push({ field: 'name', message: 'Name is required' });
    if (price === undefined || price < 0) errors.push({ field: 'price', message: 'Valid price is required' });
    if (!isRequired(category)) errors.push({ field: 'category', message: 'Category is required' });

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    const menuItem = await menuItemModel.create(
      {
        restaurantId,
        name: sanitizeString(name),
        description: description ? sanitizeString(description) : undefined,
        price,
        category: sanitizeString(category),
      },
      req.user!.userId
    );

    res.status(201).json({ menuItem });
  } catch (error) {
    next(error);
  }
});

// POST /api/menu-items/:id/image
router.post(
  '/:id/image',
  authenticate,
  upload.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);

      if (!req.file) {
        throw new ValidationError('Image file is required');
      }

      const menuItem = await menuItemModel.findById(id);
      if (!menuItem) {
        throw new NotFoundError('Menu item');
      }

      const { buffer, filename } = await processImage(req.file.buffer, req.file.originalname);
      const imageUrl = await saveImageLocally(buffer, filename);
      
      const updated = await menuItemModel.updateImage(id, imageUrl);
      res.json({ menuItem: updated });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
