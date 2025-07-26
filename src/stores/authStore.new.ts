import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthState, User } from '@/types';

// Pure client state interface
interface AuthClientState {
  user: User | null;
  isAuthenticated: boolean;
  csrfToken: string | null;
}

interface AuthActions {
  // Client state mutations only
  setAuthState: (state: Partial<AuthClientState>) => void;
  clearAuth: () => void;
  updateUser: (user: User) => void;
}

type AuthStore = AuthClientState & AuthActions;

const INITIAL_STATE: AuthClientState = {
  user: null,
  isAuthenticated: false,
  csrfToken: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      ...INITIAL_STATE,

      // Client state actions only
      setAuthState: (newState: Partial<AuthClientState>) => {
        set(state => ({ ...state, ...newState }));
      },

      clearAuth: () => {
        set(INITIAL_STATE);
      },

      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'smart-pump-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        // Only persist essential auth state
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        csrfToken: state.csrfToken,
      }),
    }
  )
);

// Selector hooks for specific parts of auth state
export const useAuth = () => {
  const { user, isAuthenticated, csrfToken } = useAuthStore();
  return { user, isAuthenticated, csrfToken };
};

export const useAuthActions = () => {
  const { setAuthState, clearAuth, updateUser } = useAuthStore();
  return { setAuthState, clearAuth, updateUser };
};

// Hook for checking if user has specific permissions
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || !user) return false;
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
