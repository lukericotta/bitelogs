import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { RestaurantModel } from '../models/Restaurant';
import { authenticate, optionalAuth } from '../middleware/auth';
import { upload, processImage, saveImageLocally } from '../middleware/upload';
import { ValidationError, NotFoundError } from '../utils/errors';
import { isRequired, isValidPriceRange, sanitizeString } from '../utils/validators';

const router = Router();
let restaurantModel: RestaurantModel;

export const initRestaurantRoutes = (pool: Pool): Router => {
  restaurantModel = new RestaurantModel(pool);
  return router;
};

// GET /api/restaurants
router.get('/', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, city, cuisine, search } = req.query;
    
    const result = await restaurantModel.findAll({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      city: city as string,
      cuisine: cuisine as string,
      search: search as string,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/restaurants/:id
router.get('/:id', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const restaurant = await restaurantModel.findById(id);
    
    if (!restaurant) {
      throw new NotFoundError('Restaurant');
    }

    res.json({ restaurant });
  } catch (error) {
    next(error);
  }
});

// POST /api/restaurants
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, address, city, state, zipCode, phone, website, cuisine, priceRange } = req.body;
    const errors: Array<{ field: string; message: string }> = [];

    if (!isRequired(name)) errors.push({ field: 'name', message: 'Name is required' });
    if (!isRequired(address)) errors.push({ field: 'address', message: 'Address is required' });
    if (!isRequired(city)) errors.push({ field: 'city', message: 'City is required' });
    if (!isRequired(state)) errors.push({ field: 'state', message: 'State is required' });
    if (!isRequired(zipCode)) errors.push({ field: 'zipCode', message: 'Zip code is required' });
    if (!isRequired(cuisine)) errors.push({ field: 'cuisine', message: 'Cuisine is required' });
    if (!isValidPriceRange(priceRange)) {
      errors.push({ field: 'priceRange', message: 'Price range must be 1-4' });
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    const restaurant = await restaurantModel.create(
      {
        name: sanitizeString(name),
        address: sanitizeString(address),
        city: sanitizeString(city),
        state: sanitizeString(state),
        zipCode: sanitizeString(zipCode),
        phone: phone ? sanitizeString(phone) : undefined,
        website: website ? sanitizeString(website) : undefined,
        cuisine: sanitizeString(cuisine),
        priceRange,
      },
      req.user!.userId
    );

    res.status(201).json({ restaurant });
  } catch (error) {
    next(error);
  }
});

// POST /api/restaurants/:id/image
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

      const restaurant = await restaurantModel.findById(id);
      if (!restaurant) {
        throw new NotFoundError('Restaurant');
      }

      const { buffer, filename } = await processImage(req.file.buffer, req.file.originalname);
      const imageUrl = await saveImageLocally(buffer, filename);
      
      const updated = await restaurantModel.updateImage(id, imageUrl);
      res.json({ restaurant: updated });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
