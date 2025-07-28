import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import {
  ApiResponse,
  HttpError,
  RequestConfig,
  LoginFormData,
  AuthResponse,
  User,
  ProfileUpdateData,
  PasswordChangeData,
  BalanceInfo,
  AccountSummary,
  API_ENDPOINTS,
} from '@/types';

// Extend the AxiosRequestConfig to include our custom _retry property
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class ApiService {
  private client: AxiosInstance;
  private csrfToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      config => {
        // Add CSRF token to state-changing requests
        if (
          this.csrfToken &&
          ['post', 'put', 'delete', 'patch'].includes(
            config.method?.toLowerCase() || ''
          )
        ) {
          config.headers['X-CSRF-Token'] = this.csrfToken;
        }

        // Add timestamp for cache busting
        if (config.method?.toLowerCase() === 'get') {
          config.params = { ...config.params, _t: Date.now() };
        }

        return config;
      },
      error => {
        return Promise.reject(this.createHttpError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // Update CSRF token if provided
        if (
          response.data.data &&
          typeof response.data.data === 'object' &&
          'csrfToken' in response.data.data
        ) {
          this.csrfToken = (
            response.data.data as { csrfToken: string }
          ).csrfToken;
        }

        return response;
      },
      async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // Handle 401 errors with token refresh
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            window.location.href = '/login';
            return Promise.reject(
              this.createHttpError(refreshError as AxiosError<ApiResponse>)
            );
          }
        }

        return Promise.reject(this.createHttpError(error));
      }
    );
  }

  private createHttpError(error: AxiosError<ApiResponse>): HttpError {
    const httpError = new Error(
      error.response?.data?.message || error.message || 'An error occurred'
    ) as HttpError;

    httpError.status = error.response?.status;
    httpError.response = error.response?.data;

    return httpError;
  }

  // CSRF Token Management
  async getCsrfToken(): Promise<string> {
    try {
      const response = await this.client.get<
        ApiResponse<{ csrfToken: string }>
      >(API_ENDPOINTS.AUTH.CSRF_TOKEN);

      if (response.data.success && response.data.data?.csrfToken) {
        this.csrfToken = response.data.data.csrfToken;
        return this.csrfToken;
      }

      throw new Error('Failed to get CSRF token');
    } catch (error) {
      throw this.createHttpError(error as AxiosError<ApiResponse>);
    }
  }

  // Authentication Methods
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    try {
      // Get CSRF token first
      await this.getCsrfToken();

      const response = await this.client.post<ApiResponse<AuthResponse>>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Login failed');
      }

      // Update CSRF token
      if (
        response.data.data &&
        typeof response.data.data === 'object' &&
        'csrfToken' in response.data.data
      ) {
        this.csrfToken = (
          response.data.data as { csrfToken: string }
        ).csrfToken;
      }

      return response.data.data;
    } catch (error) {
      throw this.createHttpError(error as AxiosError<ApiResponse>);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post<ApiResponse>(API_ENDPOINTS.AUTH.LOGOUT);
      this.csrfToken = null;
    } catch (error) {
      // Don't throw on logout error, just clear local state
      this.csrfToken = null;
      // eslint-disable-next-line no-console
      console.warn('Logout request failed:', error);
    }
  }

  async refreshToken(): Promise<void> {
    try {
      const response = await this.client.post<
        ApiResponse<{ accessToken: string; user: User }>
      >(API_ENDPOINTS.AUTH.REFRESH);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Token refresh failed');
      }

      // Set the new access token for subsequent requests
      if (response.data.data.accessToken) {
        this.setAuthToken(response.data.data.accessToken);
      }
    } catch (error) {
      throw this.createHttpError(error as AxiosError<ApiResponse>);
    }
  }

  async validateToken(): Promise<User> {
    try {
      const response = await this.client.get<ApiResponse<{ user: User }>>(
        API_ENDPOINTS.AUTH.VALIDATE
      );

      if (!response.data.success || !response.data.data?.user) {
        throw new Error('Token validation failed');
      }

      return response.data.data.user;
    } catch (error) {
      throw this.createHttpError(error as AxiosError<ApiResponse>);
    }
  }

  async changePassword(data: PasswordChangeData): Promise<void> {
    try {
      if (!this.csrfToken) {
        await this.getCsrfToken();
      }

      const response = await this.client.post<ApiResponse>(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        data
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Password change failed');
      }
    } catch (error) {
      throw this.createHttpError(error as AxiosError<ApiResponse>);
    }
  }

  // User Profile Methods
  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.client.get<ApiResponse<{ user: User }>>(
        API_ENDPOINTS.USER.PROFILE
      );

      if (!response.data.success || !response.data.data?.user) {
        throw new Error('Failed to get user profile');
      }

      return response.data.data.user;
    } catch (error) {
      throw this.createHttpError(error as AxiosError<ApiResponse>);
    }
  }

  async updateProfile(data: ProfileUpdateData): Promise<User> {
    try {
      if (!this.csrfToken) {
        await this.getCsrfToken();
      }

      const response = await this.client.put<ApiResponse<{ user: User }>>(
        API_ENDPOINTS.USER.UPDATE,
        data
      );

      if (!response.data.success || !response.data.data?.user) {
        throw new Error(response.data.message || 'Profile update failed');
      }

      return response.data.data.user;
    } catch (error) {
      throw this.createHttpError(error as AxiosError<ApiResponse>);
    }
  }

  async getUserBalance(): Promise<BalanceInfo> {
    try {
      const response = await this.client.get<ApiResponse<BalanceInfo>>(
        API_ENDPOINTS.USER.BALANCE
      );

      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to get balance');
      }

      return response.data.data;
    } catch (error) {
      throw this.createHttpError(error as AxiosError<ApiResponse>);
    }
  }

  async getAccountSummary(): Promise<AccountSummary> {
    try {
      const response = await this.client.get<
        ApiResponse<{ summary: AccountSummary }>
      >(API_ENDPOINTS.USER.SUMMARY);

      if (!response.data.success || !response.data.data?.summary) {
        throw new Error('Failed to get account summary');
      }

      return response.data.data.summary;
    } catch (error) {
      throw this.createHttpError(error as AxiosError<ApiResponse>);
    }
  }

  async deleteAccount(password: string): Promise<void> {
    try {
      if (!this.csrfToken) {
        await this.getCsrfToken();
      }

      const response = await this.client.delete<ApiResponse>(
        API_ENDPOINTS.USER.DELETE,
        { data: { password } }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Account deletion failed');
      }

      this.csrfToken = null;
    } catch (error) {
      throw this.createHttpError(error as AxiosError<ApiResponse>);
    }
  }

  // System Methods
  async getHealth(): Promise<ApiResponse> {
    try {
      const response = await this.client.get<ApiResponse>(
        API_ENDPOINTS.SYSTEM.HEALTH
      );

      return response.data;
    } catch (error) {
      throw this.createHttpError(error as AxiosError<ApiResponse>);
    }
  }

  // Generic request method for custom endpoints
  async request<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.request<ApiResponse<T>>({
        method,
        url,
        data,
        ...config,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Request failed');
      }

      return response.data.data as T;
    } catch (error) {
      throw this.createHttpError(error as AxiosError<ApiResponse>);
    }
  }

  // Utility methods
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
    this.csrfToken = null;
  }

  getBaseURL(): string {
    return this.client.defaults.baseURL || '';
  }

  updateTimeout(timeout: number): void {
    this.client.defaults.timeout = timeout;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
