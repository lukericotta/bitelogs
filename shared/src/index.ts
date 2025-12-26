// User types
export interface User {
  id: number;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

// Restaurant types
export interface Restaurant {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  website?: string;
  cuisine: string;
  priceRange: 1 | 2 | 3 | 4;
  imageUrl?: string;
  createdById: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRestaurantRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  website?: string;
  cuisine: string;
  priceRange: 1 | 2 | 3 | 4;
}

// MenuItem types
export interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  avgRating: number;
  reviewCount: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemWithRestaurant extends MenuItem {
  restaurant: Pick<Restaurant, 'id' | 'name' | 'cuisine'>;
}

export interface CreateMenuItemRequest {
  restaurantId: number;
  name: string;
  description?: string;
  price: number;
  category: string;
}

// Review types
export interface Review {
  id: number;
  menuItemId: number;
  userId: number;
  rating: number;
  comment?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewWithUser extends Review {
  user: Pick<User, 'id' | 'displayName' | 'avatarUrl'>;
}

export interface CreateReviewRequest {
  menuItemId: number;
  rating: number;
  comment?: string;
}

// Discovery types
export interface TopRatedItem {
  id: number;
  name: string;
  avgRating: number;
  reviewCount: number;
  imageUrl?: string;
  restaurant: Pick<Restaurant, 'id' | 'name' | 'cuisine'>;
}

export interface RecentReview {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  user: Pick<User, 'id' | 'displayName' | 'avatarUrl'>;
  menuItem: {
    id: number;
    name: string;
    restaurant: Pick<Restaurant, 'id' | 'name'>;
  };
}

export interface PhotoItem {
  id: number;
  imageUrl: string;
  menuItem: {
    id: number;
    name: string;
    restaurant: Pick<Restaurant, 'id' | 'name'>;
  };
}

// Health types
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  database: 'connected' | 'disconnected';
  version: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
