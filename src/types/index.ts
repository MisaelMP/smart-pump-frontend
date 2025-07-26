import { z } from 'zod';

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  details?: unknown;
}

// User Types
export const UserSchema = z.object({
  _id: z.string(),
  guid: z.string().uuid(),
  isActive: z.boolean(),
  balance: z.string(),
  picture: z.string().url(),
  age: z.number(),
  eyeColor: z.string(),
  name: z.object({
    first: z.string(),
    last: z.string(),
  }),
  company: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
});

export type User = z.infer<typeof UserSchema>;

// Auth Types
export const LoginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;

export interface AuthResponse {
  user: User;
  accessToken: string;
  csrfToken: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  csrfToken: string | null;
}

// Profile Update Types
export const ProfileUpdateSchema = z.object({
  name: z
    .object({
      first: z
        .string()
        .min(1, 'First name is required')
        .max(50, 'First name too long'),
      last: z
        .string()
        .min(1, 'Last name is required')
        .max(50, 'Last name too long'),
    })
    .optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  phone: z
    .string()
    .regex(
      /^\+\d{1,4}\s?\(\d{3}\)\s?\d{3}-\d{4}$/,
      'Phone must be in format: +1 (555) 123-4567'
    )
    .optional(),
  address: z
    .string()
    .min(10, 'Address too short')
    .max(200, 'Address too long')
    .optional(),
  company: z
    .string()
    .min(1, 'Company name required')
    .max(100, 'Company name too long')
    .optional(),
});

export type ProfileUpdateData = z.infer<typeof ProfileUpdateSchema>;

// Password Change Types
export const PasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain uppercase, lowercase, number and special character'
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type PasswordChangeData = z.infer<typeof PasswordChangeSchema>;

// Balance Types
export interface BalanceInfo {
  balance: string;
  numericBalance: number;
  currency: string;
  lastUpdated: string;
}

// Account Summary Types
export interface AccountSummary {
  accountId: string;
  displayName: string;
  email: string;
  balance: string;
  company: string;
  accountStatus: string;
  profileCompleteness: number;
  lastActivity: string;
  securityLevel: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  operation?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  details?: any;
}

// Form States
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Navigation Types
export interface NavigationItem {
  path: string;
  label: string;
  icon?: string;
  requiresAuth: boolean;
}

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// HTTP Client Types
export interface RequestConfig {
  withCredentials?: boolean;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface HttpError extends Error {
  status?: number | undefined;
  response?: ApiResponse | undefined;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'smart-pump-theme',
  REMEMBER_EMAIL: 'smart-pump-remember-email',
  LAST_ACTIVITY: 'smart-pump-last-activity',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  BALANCE: '/balance',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VALIDATE: '/auth/validate',
    CSRF_TOKEN: '/auth/csrf-token',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  USER: {
    PROFILE: '/user/profile',
    BALANCE: '/user/balance',
    SUMMARY: '/user/summary',
    UPDATE: '/user/profile',
    DELETE: '/user/account',
  },
  SYSTEM: {
    HEALTH: '/health',
    DOCS: '/docs',
  },
} as const;

// Component Props Types
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | undefined;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
}

// Profile Completeness
export interface ProfileMetrics {
  completeness: number;
  missingFields: string[];
  suggestions: string[];
}

// Security Types
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  loginSessions: LoginSession[];
}

export interface LoginSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

// Responsive Design Types
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveValue<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

// Animation Types
export type AnimationType = 'fade' | 'slide' | 'scale' | 'bounce';

export interface AnimationConfig {
  type: AnimationType;
  duration?: number;
  delay?: number;
  easing?: string;
}

// Export all schemas for validation
export const ValidationSchemas = {
  LoginForm: LoginFormSchema,
  ProfileUpdate: ProfileUpdateSchema,
  PasswordChange: PasswordChangeSchema,
  User: UserSchema,
} as const;
