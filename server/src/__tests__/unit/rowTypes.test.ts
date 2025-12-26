/**
 * These tests verify that the Row types with index signatures compile correctly
 * and work as expected with TypeScript's type system.
 */
import { UserRow } from '../../models/User';
import { RestaurantRow } from '../../models/Restaurant';
import { MenuItemRow } from '../../models/MenuItem';
import { ReviewRow } from '../../models/Review';

describe('Row Type Index Signatures', () => {
  describe('UserRow', () => {
    it('should accept known properties', () => {
      const row: UserRow = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hash',
        display_name: 'Test User',
        avatar_url: null,
        is_admin: false,
        created_at: new Date(),
        updated_at: new Date(),
      };
      expect(row.id).toBe(1);
      expect(row.email).toBe('test@example.com');
    });

    it('should allow index access for unknown properties', () => {
      const row: UserRow = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hash',
        display_name: 'Test User',
        avatar_url: null,
        is_admin: false,
        created_at: new Date(),
        updated_at: new Date(),
      };
      // Index signature allows this pattern used by pg query results
      const key = 'email';
      expect(row[key]).toBe('test@example.com');
    });
  });

  describe('RestaurantRow', () => {
    it('should accept known properties', () => {
      const row: RestaurantRow = {
        id: 1,
        name: 'Test Restaurant',
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94102',
        phone: null,
        website: null,
        cuisine: 'Italian',
        price_range: 2,
        image_url: null,
        created_by_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };
      expect(row.id).toBe(1);
      expect(row.name).toBe('Test Restaurant');
    });
  });

  describe('MenuItemRow', () => {
    it('should accept known properties', () => {
      const row: MenuItemRow = {
        id: 1,
        restaurant_id: 1,
        name: 'Test Item',
        description: null,
        price: '12.99',
        category: 'Mains',
        image_url: null,
        avg_rating: '4.5',
        review_count: '10',
        created_by_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };
      expect(row.id).toBe(1);
      expect(row.name).toBe('Test Item');
    });

    it('should accept optional join fields', () => {
      const row: MenuItemRow = {
        id: 1,
        restaurant_id: 1,
        name: 'Test Item',
        description: null,
        price: '12.99',
        category: 'Mains',
        image_url: null,
        avg_rating: '4.5',
        review_count: '10',
        created_by_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        restaurant_name: 'Test Restaurant',
        restaurant_cuisine: 'Italian',
      };
      expect(row.restaurant_name).toBe('Test Restaurant');
    });
  });

  describe('ReviewRow', () => {
    it('should accept known properties', () => {
      const row: ReviewRow = {
        id: 1,
        menu_item_id: 1,
        user_id: 1,
        rating: 5,
        comment: 'Great food!',
        image_url: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      expect(row.id).toBe(1);
      expect(row.rating).toBe(5);
    });

    it('should accept optional join fields', () => {
      const row: ReviewRow = {
        id: 1,
        menu_item_id: 1,
        user_id: 1,
        rating: 5,
        comment: null,
        image_url: null,
        created_at: new Date(),
        updated_at: new Date(),
        user_display_name: 'Test User',
        user_avatar_url: null,
      };
      expect(row.user_display_name).toBe('Test User');
    });
  });
});
