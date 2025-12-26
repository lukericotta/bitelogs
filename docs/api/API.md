# BiteLogs API Reference

## Base URL

```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

### Success Response

```json
{
  "data": { ... },
  "message": "Success"
}
```

### Error Response

```json
{
  "error": "ErrorType",
  "message": "Human readable error message"
}
```

## Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Authentication | 5 attempts | 15 minutes |
| Password Reset | 3 requests | 1 hour |

---

## Health Endpoints

### GET /health

Full health check with database status.

**Authentication:** None

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

### GET /live

Kubernetes liveness probe.

**Response:**
```json
{
  "status": "ok"
}
```

### GET /ready

Kubernetes readiness probe.

**Response:**
```json
{
  "status": "ready"
}
```

---

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**Authentication:** None

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password1!",
  "displayName": "John Doe"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "displayName": "John Doe",
    "avatarUrl": null,
    "isAdmin": false
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `400` - Validation error (invalid email, weak password, etc.)
- `409` - Email already registered

---

### POST /auth/login

Authenticate and receive a token.

**Authentication:** None

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password1!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "displayName": "John Doe",
    "avatarUrl": null,
    "isAdmin": false
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `401` - Invalid credentials
- `429` - Too many login attempts

---

### GET /auth/me

Get current user profile.

**Authentication:** Required

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "displayName": "John Doe",
    "avatarUrl": null,
    "isAdmin": false
  }
}
```

**Errors:**
- `401` - Not authenticated

---

## Restaurant Endpoints

### GET /restaurants

List all restaurants with optional filtering.

**Authentication:** None

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| city | string | Filter by city |
| cuisine | string | Filter by cuisine type |
| priceRange | number | Filter by price range (1-4) |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |

**Response (200):**
```json
{
  "restaurants": [
    {
      "id": 1,
      "name": "Pasta Palace",
      "description": "Authentic Italian cuisine",
      "cuisine": "Italian",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "priceRange": 2,
      "imageUrl": "/uploads/restaurant-1.jpg"
    }
  ],
  "total": 50,
  "page": 1,
  "totalPages": 3
}
```

---

### GET /restaurants/:id

Get restaurant details with menu items.

**Authentication:** None

**Response (200):**
```json
{
  "id": 1,
  "name": "Pasta Palace",
  "description": "Authentic Italian cuisine",
  "cuisine": "Italian",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "priceRange": 2,
  "imageUrl": "/uploads/restaurant-1.jpg",
  "menuItems": [
    {
      "id": 1,
      "name": "Spaghetti Carbonara",
      "price": 18.99,
      "avgRating": 4.5,
      "reviewCount": 23
    }
  ]
}
```

**Errors:**
- `404` - Restaurant not found

---

### POST /restaurants

Create a new restaurant.

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Pasta Palace",
  "description": "Authentic Italian cuisine",
  "cuisine": "Italian",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "priceRange": 2
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "Pasta Palace",
  ...
}
```

**Errors:**
- `400` - Validation error
- `401` - Not authenticated
- `403` - Not an admin

---

### PUT /restaurants/:id

Update a restaurant.

**Authentication:** Required (Admin only)

**Request Body:** (partial update allowed)
```json
{
  "name": "Updated Name",
  "description": "New description"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Updated Name",
  ...
}
```

---

### DELETE /restaurants/:id

Delete a restaurant.

**Authentication:** Required (Admin only)

**Response (204):** No content

---

## Menu Item Endpoints

### GET /menu-items

List menu items with optional filtering.

**Authentication:** None

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| restaurantId | number | Filter by restaurant |
| category | string | Filter by category |
| minRating | number | Minimum average rating |
| page | number | Page number |
| limit | number | Items per page |

**Response (200):**
```json
{
  "menuItems": [
    {
      "id": 1,
      "name": "Spaghetti Carbonara",
      "description": "Classic Roman pasta",
      "price": 18.99,
      "category": "Pasta",
      "imageUrl": "/uploads/item-1.jpg",
      "avgRating": 4.5,
      "reviewCount": 23,
      "restaurant": {
        "id": 1,
        "name": "Pasta Palace"
      }
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
```

---

### GET /menu-items/:id

Get menu item details with reviews.

**Authentication:** None

**Response (200):**
```json
{
  "id": 1,
  "name": "Spaghetti Carbonara",
  "description": "Classic Roman pasta with guanciale",
  "price": 18.99,
  "category": "Pasta",
  "imageUrl": "/uploads/item-1.jpg",
  "avgRating": 4.5,
  "reviewCount": 23,
  "restaurant": {
    "id": 1,
    "name": "Pasta Palace",
    "city": "New York"
  },
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Amazing pasta!",
      "imageUrl": "/uploads/review-1.jpg",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "user": {
        "id": 1,
        "displayName": "John Doe"
      }
    }
  ]
}
```

---

### POST /menu-items

Create a new menu item.

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "restaurantId": 1,
  "name": "Spaghetti Carbonara",
  "description": "Classic Roman pasta",
  "price": 18.99,
  "category": "Pasta"
}
```

**Response (201):** Created menu item

---

### PUT /menu-items/:id

Update a menu item.

**Authentication:** Required (Admin only)

---

### DELETE /menu-items/:id

Delete a menu item.

**Authentication:** Required (Admin only)

---

## Review Endpoints

### GET /reviews

List reviews with optional filtering.

**Authentication:** None

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | number | Filter by user |
| menuItemId | number | Filter by menu item |
| minRating | number | Minimum rating |
| page | number | Page number |
| limit | number | Items per page |

---

### POST /reviews

Create a new review.

**Authentication:** Required

**Request Body:**
```json
{
  "menuItemId": 1,
  "rating": 5,
  "comment": "Amazing pasta! Highly recommend."
}
```

**Response (201):**
```json
{
  "id": 1,
  "menuItemId": 1,
  "userId": 1,
  "rating": 5,
  "comment": "Amazing pasta! Highly recommend.",
  "imageUrl": null,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Errors:**
- `400` - Validation error (rating must be 1-5)
- `401` - Not authenticated
- `409` - Already reviewed this item

---

### POST /reviews/:id/image

Upload an image for a review.

**Authentication:** Required (Owner only)

**Request:** `multipart/form-data` with `image` field

**Response (200):**
```json
{
  "imageUrl": "/uploads/review-1.jpg"
}
```

---

### PUT /reviews/:id

Update a review.

**Authentication:** Required (Owner only)

---

### DELETE /reviews/:id

Delete a review.

**Authentication:** Required (Owner only)

---

## Discovery Endpoints

### GET /discover/top-rated

Get top-rated menu items.

**Authentication:** None

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 10 | Number of items |
| city | string | - | Filter by city |

**Response (200):**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Spaghetti Carbonara",
      "avgRating": 4.9,
      "reviewCount": 50,
      "imageUrl": "/uploads/item-1.jpg",
      "restaurant": {
        "id": 1,
        "name": "Pasta Palace",
        "city": "New York"
      }
    }
  ]
}
```

---

### GET /discover/recent-reviews

Get recent reviews.

**Authentication:** None

**Query Parameters:**
| Parameter | Type | Default |
|-----------|------|---------|
| limit | number | 10 |

**Response (200):**
```json
{
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Amazing!",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "user": {
        "displayName": "John Doe"
      },
      "menuItem": {
        "id": 1,
        "name": "Spaghetti Carbonara",
        "restaurant": {
          "name": "Pasta Palace"
        }
      }
    }
  ]
}
```

---

### GET /discover/recent-photos

Get recent review photos.

**Authentication:** None

**Query Parameters:**
| Parameter | Type | Default |
|-----------|------|---------|
| limit | number | 20 |

**Response (200):**
```json
{
  "photos": [
    {
      "id": 1,
      "imageUrl": "/uploads/review-1.jpg",
      "menuItem": {
        "id": 1,
        "name": "Spaghetti Carbonara"
      }
    }
  ]
}
```

---

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Authentication required or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
