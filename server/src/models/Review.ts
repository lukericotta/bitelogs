import { Pool } from 'pg';
import { Review, ReviewWithUser, CreateReviewRequest, PaginatedResponse } from '@bitelogs/shared';

// FIX: Added index signature to satisfy Record<string, unknown> constraint
export interface ReviewRow {
  id: number;
  menu_item_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
  // For joins
  user_display_name?: string;
  user_avatar_url?: string | null;
  [key: string]: unknown; // Index signature for type compatibility
}

export class ReviewModel {
  constructor(private pool: Pool) {}

  private rowToReview(row: ReviewRow): Review {
    return {
      id: row.id,
      menuItemId: row.menu_item_id,
      userId: row.user_id,
      rating: row.rating,
      comment: row.comment || undefined,
      imageUrl: row.image_url || undefined,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  private rowToReviewWithUser(row: ReviewRow): ReviewWithUser {
    return {
      ...this.rowToReview(row),
      user: {
        id: row.user_id,
        displayName: row.user_display_name || '',
        avatarUrl: row.user_avatar_url || undefined,
      },
    };
  }

  async findById(id: number): Promise<ReviewWithUser | null> {
    const result = await this.pool.query<ReviewRow>(
      `SELECT r.*, u.display_name as user_display_name, u.avatar_url as user_avatar_url
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );
    return result.rows[0] ? this.rowToReviewWithUser(result.rows[0]) : null;
  }

  async findByMenuItem(
    menuItemId: number,
    options: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<ReviewWithUser>> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const countResult = await this.pool.query(
      'SELECT COUNT(*) FROM reviews WHERE menu_item_id = $1',
      [menuItemId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await this.pool.query<ReviewRow>(
      `SELECT r.*, u.display_name as user_display_name, u.avatar_url as user_avatar_url
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.menu_item_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [menuItemId, limit, offset]
    );

    return {
      data: result.rows.map((row) => this.rowToReviewWithUser(row)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByUser(
    userId: number,
    options: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<Review>> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const countResult = await this.pool.query(
      'SELECT COUNT(*) FROM reviews WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await this.pool.query<ReviewRow>(
      `SELECT * FROM reviews WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return {
      data: result.rows.map((row) => this.rowToReview(row)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(data: CreateReviewRequest, userId: number): Promise<Review> {
    const result = await this.pool.query<ReviewRow>(
      `INSERT INTO reviews (menu_item_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.menuItemId, userId, data.rating, data.comment || null]
    );
    return this.rowToReview(result.rows[0]);
  }

  async updateImage(id: number, imageUrl: string): Promise<Review | null> {
    const result = await this.pool.query<ReviewRow>(
      `UPDATE reviews SET image_url = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [imageUrl, id]
    );
    return result.rows[0] ? this.rowToReview(result.rows[0]) : null;
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM reviews WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }
}
