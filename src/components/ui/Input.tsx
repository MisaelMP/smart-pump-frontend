import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import type { InputProps } from '@/types';

const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{ label, error, helperText, leftIcon, rightIcon, className, id, ...props },
		ref
	) => {
		const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
		const hasError = Boolean(error);

		const inputClasses = clsx(
			'block w-full px-3 py-2 border rounded-md shadow-sm',
			'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0',
			'transition-colors duration-200',
			// Normal state
			hasError
				? 'border-red-300 focus:border-red-500 focus:ring-red-500'
				: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
			// Disabled state
			props.disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
			// Icon padding
			leftIcon && 'pl-10',
			rightIcon && 'pr-10',
			className
		);

		return (
			<div className='w-full'>
				{label && (
					<label
						htmlFor={inputId}
						className={clsx(
							'block text-sm font-medium mb-1',
							hasError ? 'text-red-700' : 'text-gray-700'
						)}
					>
						{label}
					</label>
				)}

				<div className='relative'>
					{leftIcon && (
						<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
							<span
								className={clsx(
									'text-sm',
									hasError ? 'text-red-400' : 'text-gray-400'
								)}
							>
								{leftIcon}
							</span>
						</div>
					)}

					<input
						ref={ref}
						id={inputId}
						className={inputClasses}
						aria-invalid={hasError}
						aria-describedby={
							error
								? `${inputId}-error`
								: helperText
									? `${inputId}-helper`
									: undefined
						}
						{...props}
					/>

					{rightIcon && (
						<div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
							<span
								className={clsx(
									'text-sm',
									hasError ? 'text-red-400' : 'text-gray-400'
								)}
							>
								{rightIcon}
							</span>
						</div>
					)}
				</div>

				{error && (
					<p
						id={`${inputId}-error`}
						className='mt-1 text-sm text-red-600'
						role='alert'
					>
						{error}
					</p>
				)}

				{helperText && !error && (
					<p id={`${inputId}-helper`} className='mt-1 text-sm text-gray-500'>
						{helperText}
					</p>
				)}
			</div>
		);
	}
);

Input.displayName = 'Input';

export default Input;
