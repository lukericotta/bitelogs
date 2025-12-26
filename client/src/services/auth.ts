import { api } from './api';
// FIX: Removed unused User import - using AuthResponse and ProfileResponse instead
import { AuthResponse } from '@bitelogs/shared';

interface ProfileResponse {
  user: AuthResponse['user'];
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', { email, password });
  },

  async register(email: string, password: string, displayName: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/register', { email, password, displayName });
  },

  async getProfile(): Promise<ProfileResponse> {
    return api.get<ProfileResponse>('/auth/me');
  },
};
