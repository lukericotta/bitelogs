import bcrypt from 'bcryptjs';
import { createPool } from '../db';
import { logger } from '../utils/logger';

const SALT_ROUNDS = 12;

// Demo password that meets complexity requirements:
// - 8+ characters
// - Uppercase (D)
// - Lowercase (emo)
// - Number (123)
// - Special character (!@#)
const DEMO_PASSWORD = 'Demo123!@#';

export const runSeed = async (): Promise<void> => {
  const pool = createPool();
  const client = await pool.connect();

  try {
    logger.info('Seeding database...');

    // Create demo users
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);
    
    const usersResult = await client.query<{ id: number }>(
      `INSERT INTO users (email, password_hash, display_name, is_admin)
       VALUES 
         ($1, $2, $3, $4),
         ($5, $6, $7, $8),
         ($9, $10, $11, $12)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [
        'demo@example.com', passwordHash, 'Demo User', false,
        'admin@example.com', passwordHash, 'Admin User', true,
        'foodie@example.com', passwordHash, 'Food Lover', false,
      ]
    );

    if (usersResult.rows.length === 0) {
      console.log('Users already exist, skipping seed');
      return;
    }

    const userIds = usersResult.rows.map((r) => r.id);

    // Create restaurants
    const restaurantsResult = await client.query<{ id: number }>(
      `INSERT INTO restaurants (name, address, city, state, zip_code, cuisine, price_range, created_by_id)
       VALUES 
         ($1, $2, $3, $4, $5, $6, $7, $8),
         ($9, $10, $11, $12, $13, $14, $15, $16),
         ($17, $18, $19, $20, $21, $22, $23, $24)
       RETURNING id`,
      [
        'The Golden Fork', '123 Main St', 'San Francisco', 'CA', '94102', 'American', 3, userIds[0],
        'Sakura Sushi', '456 Oak Ave', 'San Francisco', 'CA', '94103', 'Japanese', 2, userIds[0],
        'Pasta Paradise', '789 Elm Blvd', 'San Francisco', 'CA', '94104', 'Italian', 3, userIds[1],
      ]
    );

    const restaurantIds = restaurantsResult.rows.map((r) => r.id);

    // Create menu items
    const menuItems = [
      { restaurantId: restaurantIds[0], name: 'Classic Burger', description: 'Angus beef with all the fixings', price: 15.99, category: 'Mains' },
      { restaurantId: restaurantIds[0], name: 'Truffle Fries', description: 'Hand-cut with truffle oil', price: 8.99, category: 'Sides' },
      { restaurantId: restaurantIds[1], name: 'Dragon Roll', description: 'Eel, avocado, cucumber', price: 18.99, category: 'Rolls' },
      { restaurantId: restaurantIds[1], name: 'Salmon Nigiri', description: 'Fresh Atlantic salmon', price: 6.99, category: 'Nigiri' },
      { restaurantId: restaurantIds[2], name: 'Spaghetti Carbonara', description: 'Classic Roman style', price: 16.99, category: 'Pasta' },
      { restaurantId: restaurantIds[2], name: 'Margherita Pizza', description: 'Fresh mozzarella and basil', price: 14.99, category: 'Pizza' },
    ];

    const itemIds: number[] = [];
    for (const item of menuItems) {
      const result = await client.query<{ id: number }>(
        `INSERT INTO menu_items (restaurant_id, name, description, price, category, created_by_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [item.restaurantId, item.name, item.description, item.price, item.category, userIds[0]]
      );
      itemIds.push(result.rows[0].id);
    }

    // FIX: Create reviews using individual INSERT statements with correct parameters
    const reviewsData = [
      { itemIndex: 0, userId: userIds[0], rating: 5, comment: 'Best burger in the city!' },
      { itemIndex: 0, userId: userIds[2], rating: 4, comment: 'Really good, would come back' },
      { itemIndex: 1, userId: userIds[1], rating: 5, comment: 'Truffle heaven!' },
      { itemIndex: 2, userId: userIds[0], rating: 5, comment: 'Incredible rolls, so fresh!' },
      { itemIndex: 2, userId: userIds[1], rating: 4, comment: 'Very tasty' },
      { itemIndex: 3, userId: userIds[2], rating: 5, comment: 'Melts in your mouth' },
      { itemIndex: 4, userId: userIds[0], rating: 5, comment: 'Authentic Italian taste' },
      { itemIndex: 4, userId: userIds[2], rating: 4, comment: 'Great pasta!' },
      { itemIndex: 5, userId: userIds[1], rating: 4, comment: 'Perfect crust' },
    ];

    for (const review of reviewsData) {
      await client.query(
        `INSERT INTO reviews (menu_item_id, user_id, rating, comment)
         VALUES ($1, $2, $3, $4)`,
        [itemIds[review.itemIndex], review.userId, review.rating, review.comment]
      );
    }

    // Update rating stats for all menu items
    for (const itemId of itemIds) {
      await client.query(
        `UPDATE menu_items
         SET avg_rating = COALESCE((SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE menu_item_id = $1), 0),
             review_count = (SELECT COUNT(*) FROM reviews WHERE menu_item_id = $1)
         WHERE id = $1`,
        [itemId]
      );
    }

    logger.info('Seed completed successfully');
    logger.info(`Demo credentials: demo@example.com / ${DEMO_PASSWORD}`);
  } finally {
    client.release();
    await pool.end();
  }
};

// Run if executed directly
if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Seed failed:', err);
      process.exit(1);
    });
}
