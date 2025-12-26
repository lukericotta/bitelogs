import { api } from './api';
import { Restaurant, CreateRestaurantRequest, PaginatedResponse } from '@bitelogs/shared';

interface RestaurantResponse {
  restaurant: Restaurant;
}

export const restaurantService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    city?: string;
    cuisine?: string;
    search?: string;
  }): Promise<PaginatedResponse<Restaurant>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.city) searchParams.set('city', params.city);
    if (params?.cuisine) searchParams.set('cuisine', params.cuisine);
    if (params?.search) searchParams.set('search', params.search);
    
    const query = searchParams.toString();
    return api.get<PaginatedResponse<Restaurant>>(`/restaurants${query ? `?${query}` : ''}`);
  },

  async getById(id: number): Promise<RestaurantResponse> {
    return api.get<RestaurantResponse>(`/restaurants/${id}`);
  },

  async create(data: CreateRestaurantRequest): Promise<RestaurantResponse> {
    return api.post<RestaurantResponse>('/restaurants', data);
  },

  async uploadImage(id: number, file: File): Promise<RestaurantResponse> {
    return api.uploadFile<RestaurantResponse>(`/restaurants/${id}/image`, file);
  },
};
