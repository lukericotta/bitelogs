import { Pool } from 'pg';
import { Restaurant, CreateRestaurantRequest, PaginatedResponse } from '@bitelogs/shared';

// FIX: Added index signature to satisfy Record<string, unknown> constraint
export interface RestaurantRow {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string | null;
  website: string | null;
  cuisine: string;
  price_range: number;
  image_url: string | null;
  created_by_id: number;
  created_at: Date;
  updated_at: Date;
  [key: string]: unknown; // Index signature for type compatibility
}

export class RestaurantModel {
  constructor(private pool: Pool) {}

  private rowToRestaurant(row: RestaurantRow): Restaurant {
    return {
      id: row.id,
      name: row.name,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      phone: row.phone || undefined,
      website: row.website || undefined,
      cuisine: row.cuisine,
      priceRange: row.price_range as 1 | 2 | 3 | 4,
      imageUrl: row.image_url || undefined,
      createdById: row.created_by_id,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  async findById(id: number): Promise<Restaurant | null> {
    const result = await this.pool.query<RestaurantRow>(
      'SELECT * FROM restaurants WHERE id = $1',
      [id]
    );
    return result.rows[0] ? this.rowToRestaurant(result.rows[0]) : null;
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    city?: string;
    cuisine?: string;
    search?: string;
  } = {}): Promise<PaginatedResponse<Restaurant>> {
    const { page = 1, limit = 20, city, cuisine, search } = options;
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let paramCount = 0;

    if (city) {
      conditions.push(`city ILIKE $${++paramCount}`);
      params.push(`%${city}%`);
    }
    if (cuisine) {
      conditions.push(`cuisine ILIKE $${++paramCount}`);
      params.push(`%${cuisine}%`);
    }
    if (search) {
      conditions.push(`name ILIKE $${++paramCount}`);
      params.push(`%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.pool.query(
      `SELECT COUNT(*) FROM restaurants ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await this.pool.query<RestaurantRow>(
      `SELECT * FROM restaurants ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${++paramCount} OFFSET $${++paramCount}`,
      [...params, limit, offset]
    );

    return {
      data: result.rows.map((row) => this.rowToRestaurant(row)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: CreateRestaurantRequest, createdById: number): Promise<Restaurant> {
    const result = await this.pool.query<RestaurantRow>(
      `INSERT INTO restaurants (name, address, city, state, zip_code, phone, website, cuisine, price_range, created_by_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.name,
        data.address,
        data.city,
        data.state,
        data.zipCode,
        data.phone || null,
        data.website || null,
        data.cuisine,
        data.priceRange,
        createdById,
      ]
    );
    return this.rowToRestaurant(result.rows[0]);
  }

  async updateImage(id: number, imageUrl: string): Promise<Restaurant | null> {
    const result = await this.pool.query<RestaurantRow>(
      `UPDATE restaurants SET image_url = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [imageUrl, id]
    );
    return result.rows[0] ? this.rowToRestaurant(result.rows[0]) : null;
  }
}
