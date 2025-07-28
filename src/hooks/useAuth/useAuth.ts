/* eslint-disable no-console */
import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import type {
  LoginFormData,
  PasswordChangeData,
  User,
  AuthResponse,
} from '@/types';

// Query keys for auth-related queries
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  validate: () => [...authKeys.all, 'validate'] as const,
};

// Login mutation
export const useLogin = () => {
  const { setAuthState } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginFormData): Promise<AuthResponse> => {
      return await apiService.login(credentials);
    },
    onSuccess: (authResponse: AuthResponse) => {
      // Set the auth token for subsequent requests
      if (authResponse.accessToken) {
        apiService.setAuthToken(authResponse.accessToken);
      }
      
      // Update Zustand with auth state
      setAuthState({
        user: authResponse.user,
        isAuthenticated: true,
        csrfToken: authResponse.csrfToken,
      });
    },
    onError: error => {
      // Development logging only
      if (import.meta.env.DEV) {
        console.error('Login failed:', error);
      }
      setAuthState({
        user: null,
        isAuthenticated: false,
        csrfToken: null,
      });
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      try {
        await apiService.logout();
      } catch (error) {
        // Development logging only
        if (import.meta.env.DEV) {
          console.warn('Logout API call failed:', error);
        }
      }
    },
    onSettled: () => {
      // Clear all cached data
      queryClient.clear();

      // Clear auth state
      clearAuth();

      // Clear API tokens
      apiService.clearAuthToken();
    },
  });
};

// Password change mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: PasswordChangeData): Promise<void> => {
      return await apiService.changePassword(data);
    },
    onError: error => {
      // Development logging only
      if (import.meta.env.DEV) {
        console.error('Password change failed:', error);
      }
    },
  });
};

// Current user query
export const useCurrentUser = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async (): Promise<User> => {
      return await apiService.getCurrentUser();
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: Error) => {
      // Don't retry on auth errors
      const httpError = error as { response?: { status?: number } };
      if (
        httpError.response?.status === 401 ||
        httpError.response?.status === 403
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Token validation query
export const useValidateToken = () => {
  const { isAuthenticated, clearAuth } = useAuthStore();

  const query = useQuery({
    queryKey: authKeys.validate(),
    queryFn: async (): Promise<User> => {
      return await apiService.validateToken();
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry token validation
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });

  // Handle token validation errors
  React.useEffect(() => {
    if (query.error && isAuthenticated) {
      // Clear auth state when token validation fails
      // This handles cases like environment switches or invalid tokens
      const httpError = query.error as { response?: { status?: number } };
      if (
        httpError.response?.status === 401 ||
        httpError.response?.status === 403
      ) {
        clearAuth();
        apiService.clearAuthToken();

        if (import.meta.env.DEV) {
          console.warn(
            'Token validation failed, clearing auth state:',
            query.error
          );
        }
      }
    }
  }, [query.error, isAuthenticated, clearAuth]);

  return query;
};

// Refresh token mutation
export const useRefreshToken = () => {
  const queryClient = useQueryClient();
  const { setAuthState } = useAuthStore();

  return useMutation({
    mutationFn: async (): Promise<User> => {
      await apiService.refreshToken();
      // Get updated user info after token refresh
      return await apiService.getCurrentUser();
    },
    onSuccess: (user: User) => {
      // Update user data in cache
      queryClient.setQueryData(authKeys.user(), user);

      // Update auth state
      setAuthState({
        user,
        isAuthenticated: true,
      });
    },
    onError: error => {
      // Development logging only
      if (import.meta.env.DEV) {
        console.error('Token refresh failed:', error);
      }

      // Clear all data and logout user
      queryClient.clear();
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
    },
  });
};
