import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiService } from '@/services/api';
import type {
	AuthState,
	User,
	LoginFormData,
	PasswordChangeData,
} from '@/types';

interface AuthActions {
	// Authentication actions
	login: (credentials: LoginFormData) => Promise<void>;
	logout: () => Promise<void>;
	refreshToken: () => Promise<void>;
	validateToken: () => Promise<boolean>;

	// User actions
	updateUser: (user: User) => void;
	clearError: () => void;

	// Loading states
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;

	// Password management
	changePassword: (data: PasswordChangeData) => Promise<void>;

	// Session management
	checkAuthStatus: () => Promise<boolean>;
	startSessionCheck: () => void;
	stopSessionCheck: () => void;
	sessionCheckInterval: NodeJS.Timeout | null;
}

type AuthStore = AuthState & AuthActions;

const INITIAL_STATE: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,
	csrfToken: null,
};

export const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			...INITIAL_STATE,

			// Authentication actions
			login: async (credentials: LoginFormData) => {
				set({ isLoading: true, error: null });

				try {
					const authResponse = await apiService.login(credentials);

					set({
						user: authResponse.user,
						isAuthenticated: true,
						isLoading: false,
						error: null,
						csrfToken: authResponse.csrfToken,
					});

					// Start session monitoring
					get().startSessionCheck();
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : 'Login failed';
					set({
						isLoading: false,
						error: errorMessage,
						isAuthenticated: false,
						user: null,
					});
					throw error;
				}
			},

			logout: async () => {
				set({ isLoading: true });

				try {
					await apiService.logout();
				} catch (error) {
					console.warn('Logout API call failed:', error);
				} finally {
					// Clear state regardless of API call success
					set({
						...INITIAL_STATE,
					});

					// Stop session monitoring
					get().stopSessionCheck();

					// Clear API tokens
					apiService.clearAuthToken();
				}
			},

			refreshToken: async () => {
				try {
					await apiService.refreshToken();

					// Get updated user info after token refresh
					const user = await apiService.getCurrentUser();

					set({
						user,
						isAuthenticated: true,
						error: null,
					});
				} catch (error) {
					console.error('Token refresh failed:', error);

					// If refresh fails, logout user
					await get().logout();
					throw error;
				}
			},

			validateToken: async (): Promise<boolean> => {
				try {
					const user = await apiService.validateToken();

					set({
						user,
						isAuthenticated: true,
						error: null,
					});

					return true;
				} catch (error) {
					console.warn('Token validation failed:', error);

					set({
						isAuthenticated: false,
						user: null,
						error: null,
					});

					return false;
				}
			},

			// User actions
			updateUser: (user: User) => {
				set({ user });
			},

			clearError: () => {
				set({ error: null });
			},

			// Loading states
			setLoading: (loading: boolean) => {
				set({ isLoading: loading });
			},

			setError: (error: string | null) => {
				set({ error });
			},

			// Password management
			changePassword: async (data: PasswordChangeData) => {
				set({ isLoading: true, error: null });

				try {
					await apiService.changePassword(data);
					set({ isLoading: false });
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : 'Password change failed';
					set({
						isLoading: false,
						error: errorMessage,
					});
					throw error;
				}
			},

			// Session management
			checkAuthStatus: async (): Promise<boolean> => {
				const { isAuthenticated } = get();

				if (!isAuthenticated) {
					return false;
				}

				try {
					return await get().validateToken();
				} catch (error) {
					return false;
				}
			},

			// Session monitoring
			sessionCheckInterval: null as NodeJS.Timeout | null,

			startSessionCheck: () => {
				const { sessionCheckInterval } = get();

				// Clear existing interval
				if (sessionCheckInterval) {
					clearInterval(sessionCheckInterval);
				}

				// Check session every 5 minutes
				const interval = setInterval(async () => {
					const isValid = await get().checkAuthStatus();

					if (!isValid) {
						console.warn('Session expired, logging out user');
						await get().logout();
					}
				}, 5 * 60 * 1000); // 5 minutes

				set({ sessionCheckInterval: interval });
			},

			stopSessionCheck: () => {
				const { sessionCheckInterval } = get();

				if (sessionCheckInterval) {
					clearInterval(sessionCheckInterval);
					set({ sessionCheckInterval: null });
				}
			},
		}),
		{
			name: 'smart-pump-auth',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				// Only persist essential auth state
				user: state.user,
				isAuthenticated: state.isAuthenticated,
				csrfToken: state.csrfToken,
				// Don't persist loading states or errors
			}),
			onRehydrateStorage: () => (state) => {
				// Validate session on app startup
				if (state?.isAuthenticated) {
					state.validateToken().catch(() => {
						// If validation fails, clear auth state
						state.logout();
					});
				}
			},
		}
	)
);

// Selector hooks for specific parts of auth state
export const useAuth = () => {
	const { user, isAuthenticated, isLoading, error } = useAuthStore();
	return { user, isAuthenticated, isLoading, error };
};

export const useAuthActions = () => {
	const {
		login,
		logout,
		refreshToken,
		validateToken,
		changePassword,
		clearError,
		updateUser,
	} = useAuthStore();

	return {
		login,
		logout,
		refreshToken,
		validateToken,
		changePassword,
		clearError,
		updateUser,
	};
};

export const useAuthLoading = () => {
	const { isLoading, setLoading } = useAuthStore();
	return { isLoading, setLoading };
};

export const useAuthError = () => {
	const { error, setError, clearError } = useAuthStore();
	return { error, setError, clearError };
};

// Hook for checking if user has specific permissions
export const usePermissions = () => {
	const { user, isAuthenticated } = useAuth();

	const hasPermission = (permission: string): boolean => {
		if (!isAuthenticated || !user) return false;

		// For this simple app, all authenticated active users have all permissions
		return user.isActive;
	};

	const isActive = (): boolean => {
		return isAuthenticated && user?.isActive === true;
	};

	return {
		hasPermission,
		isActive,
		canEditProfile: isActive(),
		canViewBalance: isActive(),
		canChangePassword: isActive(),
	};
};

export default useAuthStore;
