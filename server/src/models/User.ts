import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { User } from '@bitelogs/shared';

// FIX: Added index signature to satisfy Record<string, unknown> constraint
export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  display_name: string;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
  [key: string]: unknown; // Index signature for type compatibility
}

const SALT_ROUNDS = 12;

export class UserModel {
  constructor(private pool: Pool) {}

  private rowToUser(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      avatarUrl: row.avatar_url || undefined,
      isAdmin: row.is_admin,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] ? this.rowToUser(result.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] ? this.rowToUser(result.rows[0]) : null;
  }

  async create(
    email: string,
    password: string,
    displayName: string
  ): Promise<User> {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await this.pool.query<UserRow>(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [email, passwordHash, displayName]
    );
    return this.rowToUser(result.rows[0]);
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (!result.rows[0]) return null;

    const isValid = await bcrypt.compare(password, result.rows[0].password_hash);
    return isValid ? this.rowToUser(result.rows[0]) : null;
  }

  async updateAvatar(id: number, avatarUrl: string): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      `UPDATE users SET avatar_url = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [avatarUrl, id]
    );
    return result.rows[0] ? this.rowToUser(result.rows[0]) : null;
  }
}
