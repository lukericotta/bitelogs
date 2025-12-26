import { api } from './api';
import { Review, CreateReviewRequest, PaginatedResponse } from '@bitelogs/shared';

interface ReviewResponse {
  review: Review;
}

export const reviewService = {
  async create(data: CreateReviewRequest): Promise<ReviewResponse> {
    return api.post<ReviewResponse>('/reviews', data);
  },

  async uploadImage(id: number, file: File): Promise<ReviewResponse> {
    return api.uploadFile<ReviewResponse>(`/reviews/${id}/image`, file);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/reviews/${id}`);
  },

  async getByUser(
    userId: number,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Review>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return api.get<PaginatedResponse<Review>>(
      `/reviews/user/${userId}${query ? `?${query}` : ''}`
    );
  },
};
