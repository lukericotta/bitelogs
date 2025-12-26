import { api } from './api';
import { MenuItem, MenuItemWithRestaurant, CreateMenuItemRequest, PaginatedResponse, ReviewWithUser } from '@bitelogs/shared';

interface MenuItemResponse {
  menuItem: MenuItemWithRestaurant;
}

export const menuItemService = {
  async getById(id: number): Promise<MenuItemResponse> {
    return api.get<MenuItemResponse>(`/menu-items/${id}`);
  },

  async getByRestaurant(
    restaurantId: number,
    params?: { page?: number; limit?: number; category?: string }
  ): Promise<PaginatedResponse<MenuItem>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.category) searchParams.set('category', params.category);
    
    const query = searchParams.toString();
    return api.get<PaginatedResponse<MenuItem>>(
      `/menu-items/restaurant/${restaurantId}${query ? `?${query}` : ''}`
    );
  },

  async getReviews(
    id: number,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<ReviewWithUser>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return api.get<PaginatedResponse<ReviewWithUser>>(
      `/menu-items/${id}/reviews${query ? `?${query}` : ''}`
    );
  },

  async create(data: CreateMenuItemRequest): Promise<MenuItemResponse> {
    return api.post<MenuItemResponse>('/menu-items', data);
  },

  async uploadImage(id: number, file: File): Promise<MenuItemResponse> {
    return api.uploadFile<MenuItemResponse>(`/menu-items/${id}/image`, file);
  },
};
