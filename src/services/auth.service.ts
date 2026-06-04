import apiClient from './api/apiClient';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: 'FREE' | 'PRO';
  activeTripCount: number;
  extraItinerarySlots: number;
  aiGenerationsCount: number;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  signup: async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', { 
      email, 
      password, 
      name: name || email.split('@')[0] 
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Backend might not have a /logout endpoint if it's purely JWT
    // but we can call it if it exists or just clear local state
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignore if logout endpoint doesn't exist
    }
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  },
};
