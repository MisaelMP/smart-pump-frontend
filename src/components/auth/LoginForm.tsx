import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthActions } from '@/stores/authStore';
import { LoginFormSchema, type LoginFormData, ROUTES } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Logo from '@/components/ui/Logo';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginFormSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    clearErrors();

    try {
      await login(data);

      toast.success('Welcome back!', {
        description: 'You have been successfully logged in.',
      });

      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';

      // Handle specific error types
      if (errorMessage.toLowerCase().includes('credential')) {
        setError('email', { message: 'Invalid email or password' });
        setError('password', { message: 'Invalid email or password' });
      } else if (errorMessage.toLowerCase().includes('inactive')) {
        setError('root', {
          message: 'Your account has been deactivated. Please contact support.',
        });
      } else {
        setError('root', { message: errorMessage });
      }

      toast.error('Login Failed', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        {/* Header */}
        <div className='text-center'>
          <div className='mx-auto mb-6 justify-center flex'>
            <Logo size='lg' />
          </div>
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>
            Welcome to SMART Pump
          </h2>
          <p className='text-gray-600'>Sign in to access your account</p>
        </div>{' '}
        {/* Login Form */}
        <div className='bg-white py-8 px-6 shadow-lg rounded-lg'>
          <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
            {/* Global Error */}
            {errors.root && (
              <div className='bg-red-50 border border-red-200 rounded-md p-4'>
                <div className='flex'>
                  <AlertCircle className='h-5 w-5 text-red-400 mr-2 mt-0.5' />
                  <div className='text-sm text-red-700'>
                    {errors.root.message}
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <Input
              label='Email Address'
              type='email'
              autoComplete='email'
              placeholder='Enter your email'
              leftIcon={<Mail className='h-4 w-4' />}
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Password Field */}
            <Input
              label='Password'
              type={showPassword ? 'text' : 'password'}
              autoComplete='current-password'
              placeholder='Enter your password'
              leftIcon={<Lock className='h-4 w-4' />}
              rightIcon={
                <button
                  type='button'
                  onClick={togglePasswordVisibility}
                  className='text-gray-400 hover:text-gray-600 focus:outline-none'
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Submit Button */}
            <Button
              type='submit'
              size='lg'
              isLoading={isSubmitting}
              disabled={!isValid || isSubmitting}
              className='w-full'
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Help Links */}
          <div className='mt-6 text-center'>
            <Link
              to='/forgot-password'
              className='text-sm text-blue-600 hover:text-blue-500 transition-colors'
            >
              Forgot your password?
            </Link>
          </div>
        </div>
        {/* Demo Credentials */}
        {import.meta.env.DEV && (
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4'>
            <h3 className='text-sm font-medium text-blue-800 mb-2'>
              Demo Credentials
            </h3>
            <div className='text-xs text-blue-700 space-y-1'>
              <div>📧 henderson.briggs@geeknet.net</div>
              <div>🔑 23derd*334</div>
              <div className='pt-1 text-blue-600'>
                (More test accounts available in the console)
              </div>
            </div>
          </div>
        )}
        {/* Footer */}
        <div className='text-center text-sm text-gray-500'>
          <p>
            By signing in, you agree to our{' '}
            <Link to='/terms' className='text-blue-600 hover:text-blue-500'>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to='/privacy' className='text-blue-600 hover:text-blue-500'>
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
