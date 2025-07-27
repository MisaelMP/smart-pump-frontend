import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import LoginForm from './LoginForm';
import { useLogin } from '@/hooks/useAuth/useAuth';

// Mock dependencies
vi.mock('@/hooks/useAuth/useAuth');
vi.mock('sonner');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Test wrapper with all required providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

// Helper to render component with all providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

describe('LoginForm Component', () => {
  const mockMutateAsync = vi.fn();
  const mockLogin = {
    mutateAsync: mockMutateAsync,
    isPending: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLogin as any).mockReturnValue(mockLogin);
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders all form elements correctly', () => {
      renderWithProviders(<LoginForm />);

      // Check for form title and subtitle
      expect(screen.getByText('Welcome to SMART Pump')).toBeInTheDocument();
      expect(
        screen.getByText('Sign in to access your account')
      ).toBeInTheDocument();

      // Check for form fields
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

      // Check for submit button
      expect(
        screen.getByRole('button', { name: /sign in/i })
      ).toBeInTheDocument();

      // Check for forgot password link
      expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
    });

    it('displays email and password input fields with proper attributes', () => {
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
      // Note: React Hook Form inputs are not marked as required in the DOM

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('name', 'password');
      // Note: React Hook Form inputs are not marked as required in the DOM
    });

    it('shows password toggle functionality', () => {
      renderWithProviders(<LoginForm />);

      const passwordInput = screen.getByLabelText(/password/i);
      // The toggle button exists but doesn't have proper accessibility labels
      const toggleButtons = screen.getAllByRole('button');
      const toggleButton = toggleButtons.find(
        button =>
          button.getAttribute('tabindex') === '-1' &&
          button.querySelector('svg')
      );

      expect(toggleButton).toBeInTheDocument();

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click toggle to show password
      fireEvent.click(toggleButton!);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click toggle to hide password again
      fireEvent.click(toggleButton!);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for invalid email', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Enter invalid email
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address')
        ).toBeInTheDocument();
      });
    });

    it('shows validation errors for short password', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Enter valid email but short password
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, '123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 8 characters')
        ).toBeInTheDocument();
      });
    });

    it('enables submit button only when form is valid', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Initially button should be disabled
      expect(submitButton).toBeDisabled();

      // Enter valid credentials
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'validpassword123');

      await waitFor(() => {
        expect(submitButton).toBeEnabled();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls login mutation with correct credentials', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({ success: true });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Fill form with valid data
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'validpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'validpassword123',
        });
      });
    });

    it('shows loading state during login', async () => {
      (useLogin as any).mockReturnValue({
        ...mockLogin,
        isPending: true, // Use isPending instead of isLoading
      });

      renderWithProviders(<LoginForm />);

      const submitButton = screen.getByRole('button', { name: /signing in/i });
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Signing In...')).toBeInTheDocument();
    });

    it('handles login success', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({ success: true });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'validpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Welcome back!', {
          description: 'You have been successfully logged in.',
        });
      });
    });

    it('handles login failure with error message', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid credentials';
      mockMutateAsync.mockRejectedValue(new Error(errorMessage));

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'validpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Login Failed', {
          description: errorMessage,
        });
      });
    });

    it('clears previous errors on successful submission', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({ success: true });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // First submit invalid form to show errors
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address')
        ).toBeInTheDocument();
      });

      // Fix the email and submit
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'validpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText('Please enter a valid email address')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Development Features', () => {
    it('logs test credentials in development mode', () => {
      // Mock development environment
      Object.defineProperty(import.meta, 'env', {
        value: { DEV: true },
        writable: true,
      });

      renderWithProviders(<LoginForm />);

      // Check that console.log was called with test credentials info
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('SMART Pump - Test Accounts Available'),
        expect.any(String)
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and ARIA attributes', () => {
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      // Note: The form doesn't have role="form" in the current implementation

      // Check that inputs have proper labels
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();

      // Check ARIA attributes when there are no errors
      expect(emailInput).toHaveAttribute('aria-invalid', 'false');
      expect(passwordInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('provides proper error announcements', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(
          'Please enter a valid email address'
        );
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('allows form submission via Enter key', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({ success: true });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'validpassword123');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'validpassword123',
        });
      });
    });

    it('allows tabbing through form elements', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const forgotPasswordLink = screen.getByText('Forgot your password?');

      // Fill form to enable the submit button
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'validpassword123');

      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Reset focus and tab through elements
      emailInput.focus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();

      await user.tab();
      expect(forgotPasswordLink).toHaveFocus();
    });
  });
});
