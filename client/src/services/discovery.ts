import { api } from './api';
import { TopRatedItem, RecentReview, PhotoItem } from '@bitelogs/shared';

interface TopRatedResponse {
  items: TopRatedItem[];
}

interface RecentResponse {
  reviews: RecentReview[];
}

interface PhotosResponse {
  photos: PhotoItem[];
}

export const discoveryService = {
  async getTopRated(limit?: number): Promise<TopRatedItem[]> {
    const query = limit ? `?limit=${limit}` : '';
    const response = await api.get<TopRatedResponse>(`/discover/top-rated${query}`);
    return response.items;
  },

  async getRecent(limit?: number): Promise<RecentReview[]> {
    const query = limit ? `?limit=${limit}` : '';
    const response = await api.get<RecentResponse>(`/discover/recent${query}`);
    return response.reviews;
  },

  async getPhotos(limit?: number): Promise<PhotoItem[]> {
    const query = limit ? `?limit=${limit}` : '';
    const response = await api.get<PhotosResponse>(`/discover/photos${query}`);
    return response.photos;
  },
};
