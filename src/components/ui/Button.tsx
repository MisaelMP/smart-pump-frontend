import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import type { ButtonProps } from '@/types';

const Button: React.FC<ButtonProps> = ({
	children,
	variant = 'primary',
	size = 'md',
	isLoading = false,
	leftIcon,
	rightIcon,
	disabled,
	className,
	...props
}) => {
	const baseClasses = clsx(
		'inline-flex items-center justify-center font-medium transition-all duration-200',
		'focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
		'rounded-lg border'
	);

	const variantClasses = {
		primary: clsx(
			'bg-blue-600 border-blue-600 text-white',
			'hover:bg-blue-700 hover:border-blue-700',
			'focus:ring-blue-500',
			'disabled:hover:bg-blue-600'
		),
		secondary: clsx(
			'bg-gray-100 border-gray-300 text-gray-700',
			'hover:bg-gray-200 hover:border-gray-400',
			'focus:ring-gray-500',
			'disabled:hover:bg-gray-100'
		),
		danger: clsx(
			'bg-red-600 border-red-600 text-white',
			'hover:bg-red-700 hover:border-red-700',
			'focus:ring-red-500',
			'disabled:hover:bg-red-600'
		),
		ghost: clsx(
			'bg-transparent border-transparent text-gray-700',
			'hover:bg-gray-100',
			'focus:ring-gray-500',
			'disabled:hover:bg-transparent'
		),
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base',
	};

	const isDisabled = disabled || isLoading;

	return (
		<button
			className={clsx(
				baseClasses,
				variantClasses[variant],
				sizeClasses[size],
				className
			)}
			disabled={isDisabled}
			{...props}
		>
			{isLoading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
			{!isLoading && leftIcon && <span className='mr-2'>{leftIcon}</span>}
			{children}
			{!isLoading && rightIcon && <span className='ml-2'>{rightIcon}</span>}
		</button>
	);
};

export default Button;
