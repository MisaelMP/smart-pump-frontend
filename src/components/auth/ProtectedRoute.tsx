import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/stores/authStore';
import { ROUTES } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireActive?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireActive = true,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication status is being determined
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check if user account is active (if required)
  if (requireActive && !user.isActive) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-8 h-8 text-red-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h2 className='text-xl font-bold text-gray-900 mb-2'>
            Account Inactive
          </h2>
          <p className='text-gray-600 mb-6'>
            Your account has been deactivated. Please contact support for
            assistance.
          </p>
          <div className='space-y-3'>
            <a
              href='mailto:support@smartpump.com'
              className='block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors'
            >
              Contact Support
            </a>
            <button
              onClick={() => (window.location.href = ROUTES.LOGIN)}
              className='block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors'
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
