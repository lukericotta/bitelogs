# BiteLogs Database Schema

## Overview

BiteLogs uses PostgreSQL as its primary database. The schema is designed to support dish-level reviews with restaurant context.

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │ restaurants │       │ menu_items  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ email       │       │ name        │       │ restaurant_id│──┐
│ password_   │       │ description │       │ name        │  │
│   hash      │       │ cuisine     │       │ description │  │
│ display_    │       │ address     │       │ price       │  │
│   name      │       │ city        │       │ category    │  │
│ avatar_url  │       │ state       │       │ image_url   │  │
│ is_admin    │       │ zip_code    │       │ avg_rating  │  │
│ created_at  │       │ price_range │       │ review_count│  │
│ updated_at  │       │ image_url   │       │ created_at  │  │
└─────────────┘       │ created_at  │       │ updated_at  │  │
      │               │ updated_at  │       └─────────────┘  │
      │               └─────────────┘              │         │
      │                     ▲                      │         │
      │                     │                      │         │
      │                     └──────────────────────┘         │
      │                                                      │
      │               ┌─────────────┐                        │
      │               │   reviews   │                        │
      │               ├─────────────┤                        │
      └──────────────▶│ id (PK)     │                        │
                      │ user_id(FK) │◀───────────────────────┘
                      │ menu_item_id│
                      │   (FK)      │
                      │ rating      │
                      │ comment     │
                      │ image_url   │
                      │ created_at  │
                      │ updated_at  │
                      └─────────────┘
```

## Tables

### users

Stores user account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| display_name | VARCHAR(100) | NOT NULL | Public display name |
| avatar_url | VARCHAR(500) | NULL | Profile image URL |
| is_admin | BOOLEAN | DEFAULT FALSE | Admin privileges |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `users_email_idx` on `email` (unique)

### restaurants

Stores restaurant information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Restaurant name |
| description | TEXT | NULL | Restaurant description |
| cuisine | VARCHAR(100) | NULL | Cuisine type |
| address | VARCHAR(255) | NOT NULL | Street address |
| city | VARCHAR(100) | NOT NULL | City |
| state | VARCHAR(50) | NOT NULL | State/Province |
| zip_code | VARCHAR(20) | NOT NULL | Postal code |
| price_range | INTEGER | CHECK 1-4 | Price level ($-$$$$) |
| image_url | VARCHAR(500) | NULL | Restaurant image URL |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `restaurants_city_idx` on `city`
- `restaurants_cuisine_idx` on `cuisine`

### menu_items

Stores individual dish information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| restaurant_id | INTEGER | FOREIGN KEY, NOT NULL | Reference to restaurant |
| name | VARCHAR(255) | NOT NULL | Dish name |
| description | TEXT | NULL | Dish description |
| price | DECIMAL(10,2) | NULL | Price in dollars |
| category | VARCHAR(100) | NULL | Category (appetizer, etc.) |
| image_url | VARCHAR(500) | NULL | Dish image URL |
| avg_rating | DECIMAL(3,2) | DEFAULT 0 | Calculated average rating |
| review_count | INTEGER | DEFAULT 0 | Number of reviews |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `menu_items_restaurant_id_idx` on `restaurant_id`
- `menu_items_avg_rating_idx` on `avg_rating` (for top-rated queries)

**Foreign Keys:**
- `restaurant_id` → `restaurants(id)` ON DELETE CASCADE

### reviews

Stores user reviews for menu items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| user_id | INTEGER | FOREIGN KEY, NOT NULL | Reference to user |
| menu_item_id | INTEGER | FOREIGN KEY, NOT NULL | Reference to menu item |
| rating | INTEGER | CHECK 1-5, NOT NULL | Rating (1-5 stars) |
| comment | TEXT | NULL | Review text |
| image_url | VARCHAR(500) | NULL | Review image URL |
| created_at | TIMESTAMP | DEFAULT NOW() | Review creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `reviews_user_id_idx` on `user_id`
- `reviews_menu_item_id_idx` on `menu_item_id`
- `reviews_created_at_idx` on `created_at` (for recent reviews)

**Foreign Keys:**
- `user_id` → `users(id)` ON DELETE CASCADE
- `menu_item_id` → `menu_items(id)` ON DELETE CASCADE

**Unique Constraints:**
- `reviews_user_menu_item_unique` on `(user_id, menu_item_id)` - one review per user per item

## Triggers

### update_menu_item_stats

Automatically updates `avg_rating` and `review_count` on menu items when reviews are added, updated, or deleted.

```sql
CREATE OR REPLACE FUNCTION update_menu_item_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE menu_items
  SET 
    avg_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE menu_item_id = COALESCE(NEW.menu_item_id, OLD.menu_item_id)
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE menu_item_id = COALESCE(NEW.menu_item_id, OLD.menu_item_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.menu_item_id, OLD.menu_item_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_menu_item_stats();
```

## Sample Queries

### Get Top Rated Dishes

```sql
SELECT 
  mi.id,
  mi.name,
  mi.avg_rating,
  mi.review_count,
  mi.image_url,
  r.name as restaurant_name,
  r.city
FROM menu_items mi
JOIN restaurants r ON mi.restaurant_id = r.id
WHERE mi.review_count >= 1
ORDER BY mi.avg_rating DESC, mi.review_count DESC
LIMIT 10;
```

### Get Recent Reviews with Photos

```sql
SELECT 
  rv.id,
  rv.rating,
  rv.comment,
  rv.image_url,
  rv.created_at,
  u.display_name,
  mi.name as dish_name,
  r.name as restaurant_name
FROM reviews rv
JOIN users u ON rv.user_id = u.id
JOIN menu_items mi ON rv.menu_item_id = mi.id
JOIN restaurants r ON mi.restaurant_id = r.id
WHERE rv.image_url IS NOT NULL
ORDER BY rv.created_at DESC
LIMIT 20;
```

### Get User's Reviews

```sql
SELECT 
  rv.id,
  rv.rating,
  rv.comment,
  rv.image_url,
  rv.created_at,
  mi.name as dish_name,
  r.name as restaurant_name
FROM reviews rv
JOIN menu_items mi ON rv.menu_item_id = mi.id
JOIN restaurants r ON mi.restaurant_id = r.id
WHERE rv.user_id = $1
ORDER BY rv.created_at DESC;
```

## Migration History

| Version | Description |
|---------|-------------|
| 001 | Create users table |
| 002 | Create restaurants table |
| 003 | Create menu_items table |
| 004 | Create reviews table |
| 005 | Add review stats trigger |
| 006 | Add indexes for performance |
