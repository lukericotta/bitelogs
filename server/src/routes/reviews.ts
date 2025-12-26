import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { ReviewModel } from '../models/Review';
import { MenuItemModel } from '../models/MenuItem';
import { authenticate, reviewLimiter } from '../middleware';
import { upload, processImage, saveImageLocally } from '../middleware/upload';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { validateReview } from '../utils/validators';

const router = Router();
let reviewModel: ReviewModel;
let menuItemModel: MenuItemModel;

export const initReviewRoutes = (pool: Pool): Router => {
  reviewModel = new ReviewModel(pool);
  menuItemModel = new MenuItemModel(pool);
  return router;
};

// POST /api/reviews - with review rate limiting
router.post('/', authenticate, reviewLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { menuItemId, rating, comment } = req.body;

    const errors = validateReview({ menuItemId, rating, comment });
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    // Verify menu item exists
    const menuItem = await menuItemModel.findById(menuItemId);
    if (!menuItem) {
      throw new NotFoundError('Menu item');
    }

    const review = await reviewModel.create(
      { menuItemId, rating, comment },
      req.user!.userId
    );

    // Update menu item stats
    await menuItemModel.updateRatingStats(menuItemId);

    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
});

// POST /api/reviews/:id/image
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

      const review = await reviewModel.findById(id);
      if (!review) {
        throw new NotFoundError('Review');
      }

      if (review.userId !== req.user!.userId) {
        throw new ForbiddenError('Cannot modify this review');
      }

      const { buffer, filename } = await processImage(req.file.buffer, req.file.originalname);
      const imageUrl = await saveImageLocally(buffer, filename);
      
      const updated = await reviewModel.updateImage(id, imageUrl);
      res.json({ review: updated });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/reviews/:id
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const review = await reviewModel.findById(id);
    
    if (!review) {
      throw new NotFoundError('Review');
    }

    if (review.userId !== req.user!.userId && !req.user!.isAdmin) {
      throw new ForbiddenError('Cannot delete this review');
    }

    const menuItemId = review.menuItemId;
    await reviewModel.delete(id, review.userId);
    
    // Update menu item stats
    await menuItemModel.updateRatingStats(menuItemId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GET /api/reviews/user/:userId
router.get('/user/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { page, limit } = req.query;
    
    const result = await reviewModel.findByUser(userId, {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
