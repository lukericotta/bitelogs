import { Pool } from 'pg';
import { MenuItem, MenuItemWithRestaurant, CreateMenuItemRequest, PaginatedResponse } from '@bitelogs/shared';

// FIX: Added index signature to satisfy Record<string, unknown> constraint
export interface MenuItemRow {
  id: number;
  restaurant_id: number;
  name: string;
  description: string | null;
  price: string;
  category: string;
  image_url: string | null;
  avg_rating: string;
  review_count: string;
  created_by_id: number;
  created_at: Date;
  updated_at: Date;
  // For joins
  restaurant_name?: string;
  restaurant_cuisine?: string;
  [key: string]: unknown; // Index signature for type compatibility
}

export class MenuItemModel {
  constructor(private pool: Pool) {}

  private rowToMenuItem(row: MenuItemRow): MenuItem {
    return {
      id: row.id,
      restaurantId: row.restaurant_id,
      name: row.name,
      description: row.description || undefined,
      price: parseFloat(row.price),
      category: row.category,
      imageUrl: row.image_url || undefined,
      avgRating: parseFloat(row.avg_rating) || 0,
      reviewCount: parseInt(row.review_count, 10) || 0,
      createdById: row.created_by_id,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  private rowToMenuItemWithRestaurant(row: MenuItemRow): MenuItemWithRestaurant {
    return {
      ...this.rowToMenuItem(row),
      restaurant: {
        id: row.restaurant_id,
        name: row.restaurant_name || '',
        cuisine: row.restaurant_cuisine || '',
      },
    };
  }

  async findById(id: number): Promise<MenuItemWithRestaurant | null> {
    const result = await this.pool.query<MenuItemRow>(
      `SELECT mi.*, r.name as restaurant_name, r.cuisine as restaurant_cuisine
       FROM menu_items mi
       JOIN restaurants r ON mi.restaurant_id = r.id
       WHERE mi.id = $1`,
      [id]
    );
    return result.rows[0] ? this.rowToMenuItemWithRestaurant(result.rows[0]) : null;
  }

  async findByRestaurant(
    restaurantId: number,
    options: { page?: number; limit?: number; category?: string } = {}
  ): Promise<PaginatedResponse<MenuItem>> {
    const { page = 1, limit = 20, category } = options;
    const offset = (page - 1) * limit;
    const conditions = ['restaurant_id = $1'];
    const params: (number | string)[] = [restaurantId];

    if (category) {
      conditions.push(`category = $${params.length + 1}`);
      params.push(category);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await this.pool.query(
      `SELECT COUNT(*) FROM menu_items ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await this.pool.query<MenuItemRow>(
      `SELECT * FROM menu_items ${whereClause}
       ORDER BY category, name
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    return {
      data: result.rows.map((row) => this.rowToMenuItem(row)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(data: CreateMenuItemRequest, createdById: number): Promise<MenuItem> {
    const result = await this.pool.query<MenuItemRow>(
      `INSERT INTO menu_items (restaurant_id, name, description, price, category, created_by_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.restaurantId, data.name, data.description || null, data.price, data.category, createdById]
    );
    return this.rowToMenuItem(result.rows[0]);
  }

  async updateImage(id: number, imageUrl: string): Promise<MenuItem | null> {
    const result = await this.pool.query<MenuItemRow>(
      `UPDATE menu_items SET image_url = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [imageUrl, id]
    );
    return result.rows[0] ? this.rowToMenuItem(result.rows[0]) : null;
  }

  async updateRatingStats(id: number): Promise<void> {
    await this.pool.query(
      `UPDATE menu_items
       SET avg_rating = COALESCE((SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE menu_item_id = $1), 0),
           review_count = (SELECT COUNT(*) FROM reviews WHERE menu_item_id = $1),
           updated_at = NOW()
       WHERE id = $1`,
      [id]
    );
  }
}
