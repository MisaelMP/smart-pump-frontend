import { clsx } from 'clsx';
import logoImage from '@/assets/logo.png';

interface LogoProps {
	size?: 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
}

const sizeClasses = {
	sm: 'h-8 w-8',
	md: 'h-12 w-12',
	lg: 'h-20 w-20',
	xl: 'h-24 w-24',
} as const;

const Logo: React.FC<LogoProps> = ({ size = 'lg', className = '' }) => {
	return (
		<div className={clsx(sizeClasses[size], className)}>
			<img
				src={logoImage}
				alt='Smart Pump Logo'
				className='w-full h-full object-cover'
			/>
		</div>
	);
};

export default Logo;
