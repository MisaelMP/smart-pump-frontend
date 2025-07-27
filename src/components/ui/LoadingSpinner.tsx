import React from 'react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'Loading...',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center p-8',
        className
      )}
    >
      <div
        className={clsx(
          'animate-spin rounded-full border-3 border-gray-300 border-t-blue-600',
          sizeClasses[size]
        )}
        role='status'
        aria-label='Loading'
      />
      {message && <p className='mt-3 text-sm text-gray-600'>{message}</p>}
    </div>
  );
};

// Full screen loading component
export const FullScreenLoader: React.FC<{ message?: string }> = ({
  message = 'Loading...',
}) => (
  <div className='fixed inset-0 flex items-center justify-center bg-gray-50 z-50'>
    <LoadingSpinner size='lg' message={message} />
  </div>
);

export default LoadingSpinner;
