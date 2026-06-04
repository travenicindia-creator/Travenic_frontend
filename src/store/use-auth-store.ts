import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, authService } from '@/services/auth.service';
import axios from 'axios';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<{ message: string }>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(email, password);
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', response.token);
          }

          set({ 
            user: response.user, 
            token: response.token,
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || error.message || 'Login failed';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          throw error;
        }
      },

      loginWithGoogle: async (idToken: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, { idToken });
          const { user, token } = res.data;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
          }

          set({ 
            user, 
            token,
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Google login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      signup: async (email: string, password: string, name?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.signup(email, password, name);
          set({ isLoading: false });
          return response as any;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || error.message || 'Signup failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          await authService.verifyEmail(token);
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || error.message || 'Verification failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      resendVerification: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await authService.resendVerification(email);
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || error.message || 'Failed to resend verification email', 
            isLoading: false 
          });
          throw error;
        }
      },

      checkAuth: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const { user } = await authService.getCurrentUser();
          set({ 
            user, 
            token,
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
          set({ 
            user: null, 
            token: null,
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout failed:', error);
        }
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }

        set({ user: null, token: null, isAuthenticated: false, error: null });
        // Setting isAuthenticated to false after a slight delay or directly
        set({ isAuthenticated: false });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'travenic-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
