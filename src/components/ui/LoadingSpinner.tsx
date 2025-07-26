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
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12',
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
					'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
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
	<div className='min-h-screen flex items-center justify-center bg-gray-50'>
		<LoadingSpinner size='lg' message={message} />
	</div>
);

export default LoadingSpinner;
