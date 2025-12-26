import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { TopRatedItem, RecentReview, PhotoItem } from '@bitelogs/shared';

const router = Router();
let pool: Pool;

export const initDiscoveryRoutes = (dbPool: Pool): Router => {
  pool = dbPool;
  return router;
};

// GET /api/discover/top-rated
router.get('/top-rated', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    
    const result = await pool.query<{
      id: number;
      name: string;
      avg_rating: string;
      review_count: string;
      image_url: string | null;
      restaurant_id: number;
      restaurant_name: string;
      restaurant_cuisine: string;
    }>(
      `SELECT 
        mi.id, mi.name, mi.avg_rating, mi.review_count, mi.image_url,
        r.id as restaurant_id, r.name as restaurant_name, r.cuisine as restaurant_cuisine
       FROM menu_items mi
       JOIN restaurants r ON mi.restaurant_id = r.id
       WHERE mi.review_count >= 1
       ORDER BY mi.avg_rating DESC, mi.review_count DESC
       LIMIT $1`,
      [limit]
    );

    const items: TopRatedItem[] = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      avgRating: parseFloat(row.avg_rating),
      reviewCount: parseInt(row.review_count, 10),
      imageUrl: row.image_url || undefined,
      restaurant: {
        id: row.restaurant_id,
        name: row.restaurant_name,
        cuisine: row.restaurant_cuisine,
      },
    }));

    res.json({ items });
  } catch (error) {
    next(error);
  }
});

// GET /api/discover/recent
router.get('/recent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    
    const result = await pool.query<{
      id: number;
      rating: number;
      comment: string | null;
      created_at: Date;
      user_id: number;
      user_display_name: string;
      user_avatar_url: string | null;
      menu_item_id: number;
      menu_item_name: string;
      restaurant_id: number;
      restaurant_name: string;
    }>(
      `SELECT 
        rev.id, rev.rating, rev.comment, rev.created_at,
        u.id as user_id, u.display_name as user_display_name, u.avatar_url as user_avatar_url,
        mi.id as menu_item_id, mi.name as menu_item_name,
        r.id as restaurant_id, r.name as restaurant_name
       FROM reviews rev
       JOIN users u ON rev.user_id = u.id
       JOIN menu_items mi ON rev.menu_item_id = mi.id
       JOIN restaurants r ON mi.restaurant_id = r.id
       ORDER BY rev.created_at DESC
       LIMIT $1`,
      [limit]
    );

    const reviews: RecentReview[] = result.rows.map((row) => ({
      id: row.id,
      rating: row.rating,
      comment: row.comment || undefined,
      createdAt: row.created_at.toISOString(),
      user: {
        id: row.user_id,
        displayName: row.user_display_name,
        avatarUrl: row.user_avatar_url || undefined,
      },
      menuItem: {
        id: row.menu_item_id,
        name: row.menu_item_name,
        restaurant: {
          id: row.restaurant_id,
          name: row.restaurant_name,
        },
      },
    }));

    res.json({ reviews });
  } catch (error) {
    next(error);
  }
});

// GET /api/discover/photos
router.get('/photos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 12;
    
    const result = await pool.query<{
      id: number;
      image_url: string;
      menu_item_id: number;
      menu_item_name: string;
      restaurant_id: number;
      restaurant_name: string;
    }>(
      `SELECT 
        rev.id, rev.image_url,
        mi.id as menu_item_id, mi.name as menu_item_name,
        r.id as restaurant_id, r.name as restaurant_name
       FROM reviews rev
       JOIN menu_items mi ON rev.menu_item_id = mi.id
       JOIN restaurants r ON mi.restaurant_id = r.id
       WHERE rev.image_url IS NOT NULL
       ORDER BY rev.created_at DESC
       LIMIT $1`,
      [limit]
    );

    const photos: PhotoItem[] = result.rows.map((row) => ({
      id: row.id,
      imageUrl: row.image_url,
      menuItem: {
        id: row.menu_item_id,
        name: row.menu_item_name,
        restaurant: {
          id: row.restaurant_id,
          name: row.restaurant_name,
        },
      },
    }));

    res.json({ photos });
  } catch (error) {
    next(error);
  }
});

export default router;
