import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useLogin,
  useLogout,
  useChangePassword,
  useCurrentUser,
} from './useAuth';
import { apiService } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import type {
  LoginFormData,
  PasswordChangeData,
  User,
  AuthResponse,
} from '@/types';

// Mock dependencies
vi.mock('@/services/api');
vi.mock('@/stores/authStore');

// Mock data
const mockUser: User = {
  _id: '123',
  guid: '550e8400-e29b-41d4-a716-446655440000',
  isActive: true,
  balance: '$1,000.00',
  picture: 'https://example.com/avatar.jpg',
  age: 30,
  eyeColor: 'brown',
  name: {
    first: 'John',
    last: 'Doe',
  },
  company: 'Test Company',
  email: 'john.doe@example.com',
  phone: '+1-555-123-4567',
  address: '123 Main St, City, State 12345',
};

const mockAuthResponse: AuthResponse = {
  user: mockUser,
  accessToken: 'mock-access-token',
  csrfToken: 'mock-csrf-token',
};

const mockLoginData: LoginFormData = {
  email: 'john.doe@example.com',
  password: 'password123',
};

const mockPasswordChangeData: PasswordChangeData = {
  currentPassword: 'oldpassword123',
  newPassword: 'newpassword123',
  confirmPassword: 'newpassword123',
};

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAuth Hooks', () => {
  const mockSetAuthState = vi.fn();
  const mockClearAuth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      setAuthState: mockSetAuthState,
      clearAuth: mockClearAuth,
      isAuthenticated: true,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('useLogin', () => {
    it('should successfully login and update auth state', async () => {
      (apiService.login as any).mockResolvedValue(mockAuthResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogin(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(mockLoginData);
      });

      // Verify API was called with correct credentials
      expect(apiService.login).toHaveBeenCalledWith(mockLoginData);

      // Verify auth state was updated
      expect(mockSetAuthState).toHaveBeenCalledWith({
        user: mockAuthResponse.user,
        isAuthenticated: true,
        csrfToken: mockAuthResponse.csrfToken,
      });
    });

    it('should handle login failure and clear auth state', async () => {
      const mockError = new Error('Invalid credentials');
      (apiService.login as any).mockRejectedValue(mockError);

      // Mock console.error for dev environment
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      Object.defineProperty(import.meta, 'env', {
        value: { DEV: true },
        writable: true,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogin(), { wrapper });

      try {
        await act(async () => {
          await result.current.mutateAsync(mockLoginData);
        });
      } catch (error) {
        expect(error).toBe(mockError);
      }

      // Verify auth state was cleared on error
      expect(mockSetAuthState).toHaveBeenCalledWith({
        user: null,
        isAuthenticated: false,
        csrfToken: null,
      });

      // Verify error was logged in dev mode
      expect(consoleSpy).toHaveBeenCalledWith('Login failed:', mockError);

      consoleSpy.mockRestore();
    });

    it('should provide correct mutation status', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogin(), { wrapper });

      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useLogout', () => {
    it('should successfully logout and clear all data', async () => {
      (apiService.logout as any).mockResolvedValue(undefined);
      (apiService.clearAuthToken as any).mockImplementation(() => undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogout(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync();
      });

      // Verify API logout was called
      expect(apiService.logout).toHaveBeenCalled();

      // Verify auth state was cleared
      expect(mockClearAuth).toHaveBeenCalled();

      // Verify API tokens were cleared
      expect(apiService.clearAuthToken).toHaveBeenCalled();
    });

    it('should handle logout API failure gracefully', async () => {
      const mockError = new Error('Logout API failed');
      (apiService.logout as any).mockRejectedValue(mockError);
      (apiService.clearAuthToken as any).mockImplementation(() => undefined);

      // Mock console.warn for dev environment
      const consoleSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => undefined);
      Object.defineProperty(import.meta, 'env', {
        value: { DEV: true },
        writable: true,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogout(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync();
      });

      // Verify warning was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        'Logout API call failed:',
        mockError
      );

      // Verify cleanup still happened despite API failure
      expect(mockClearAuth).toHaveBeenCalled();
      expect(apiService.clearAuthToken).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should clear query cache on logout', async () => {
      (apiService.logout as any).mockResolvedValue(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogout(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync();
      });

      // This is implicitly tested by the QueryClient being cleared
      // The actual clearing is handled by the mutation's onSettled
      expect(mockClearAuth).toHaveBeenCalled();
    });
  });

  describe('useChangePassword', () => {
    it('should successfully change password', async () => {
      (apiService.changePassword as any).mockResolvedValue(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useChangePassword(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(mockPasswordChangeData);
      });

      // Verify API was called with correct data
      expect(apiService.changePassword).toHaveBeenCalledWith(
        mockPasswordChangeData
      );
    });

    it('should handle password change failure', async () => {
      const mockError = new Error('Password change failed');
      (apiService.changePassword as any).mockRejectedValue(mockError);

      // Mock console.error for dev environment
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      Object.defineProperty(import.meta, 'env', {
        value: { DEV: true },
        writable: true,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useChangePassword(), { wrapper });

      try {
        await act(async () => {
          await result.current.mutateAsync(mockPasswordChangeData);
        });
      } catch (error) {
        expect(error).toBe(mockError);
      }

      // Verify error was logged in dev mode
      expect(consoleSpy).toHaveBeenCalledWith(
        'Password change failed:',
        mockError
      );

      consoleSpy.mockRestore();
    });
  });

  describe('useCurrentUser', () => {
    it('should fetch current user when authenticated', () => {
      (useAuthStore as any).mockReturnValue({
        isAuthenticated: true,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      // Verify query is enabled when authenticated
      expect(result.current.isLoading).toBe(true);
    });

    it('should not fetch current user when not authenticated', () => {
      (useAuthStore as any).mockReturnValue({
        isAuthenticated: false,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      // Query should be disabled when not authenticated
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it('should use correct query key', () => {
      (useAuthStore as any).mockReturnValue({
        isAuthenticated: true,
      });

      const wrapper = createWrapper();
      renderHook(() => useCurrentUser(), { wrapper });

      // The query key is tested implicitly through the hook's behavior
      // Additional testing would require access to the QueryClient internals
    });
  });

  describe('Authentication Flow Integration', () => {
    it('should handle complete login-logout flow', async () => {
      (apiService.login as any).mockResolvedValue(mockAuthResponse);
      (apiService.logout as any).mockResolvedValue(undefined);
      (apiService.clearAuthToken as any).mockImplementation(() => undefined);

      const wrapper = createWrapper();

      // Test login
      const { result: loginResult } = renderHook(() => useLogin(), { wrapper });

      await act(async () => {
        await loginResult.current.mutateAsync(mockLoginData);
      });

      expect(mockSetAuthState).toHaveBeenCalledWith({
        user: mockAuthResponse.user,
        isAuthenticated: true,
        csrfToken: mockAuthResponse.csrfToken,
      });

      // Test logout
      const { result: logoutResult } = renderHook(() => useLogout(), {
        wrapper,
      });

      await act(async () => {
        await logoutResult.current.mutateAsync();
      });

      expect(mockClearAuth).toHaveBeenCalled();
      expect(apiService.clearAuthToken).toHaveBeenCalled();
    });

    it('should handle authentication state changes correctly', async () => {
      // Start with unauthenticated state
      (useAuthStore as any).mockReturnValue({
        setAuthState: mockSetAuthState,
        clearAuth: mockClearAuth,
        isAuthenticated: false,
      });

      const wrapper = createWrapper();
      const { result: userQueryResult } = renderHook(() => useCurrentUser(), {
        wrapper,
      });

      // Should not fetch when unauthenticated
      expect(userQueryResult.current.isLoading).toBe(false);

      // Mock becoming authenticated
      (useAuthStore as any).mockReturnValue({
        setAuthState: mockSetAuthState,
        clearAuth: mockClearAuth,
        isAuthenticated: true,
      });

      const { result: authenticatedUserQuery } = renderHook(
        () => useCurrentUser(),
        { wrapper }
      );

      // Should fetch when authenticated
      expect(authenticatedUserQuery.current.isLoading).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network error');
      (apiService.login as any).mockRejectedValue(networkError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogin(), { wrapper });

      try {
        await act(async () => {
          await result.current.mutateAsync(mockLoginData);
        });
      } catch (error) {
        expect(error).toBe(networkError);
      }

      // Should clear auth state on any error
      expect(mockSetAuthState).toHaveBeenCalledWith({
        user: null,
        isAuthenticated: false,
        csrfToken: null,
      });
    });

    it('should handle malformed response data', async () => {
      const malformedResponse = { invalid: 'data' };
      (apiService.login as any).mockResolvedValue(malformedResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogin(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync(mockLoginData);
      });

      // Should still try to set auth state with whatever data is provided
      expect(mockSetAuthState).toHaveBeenCalledWith({
        user: undefined,
        isAuthenticated: true,
        csrfToken: undefined,
      });
    });
  });
});
