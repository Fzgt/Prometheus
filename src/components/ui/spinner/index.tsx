import { cn } from '@/utils/cn';

const sizes = {
	sm: 'h-4 w-4 border-2',
	md: 'h-6 w-6 border-2',
	lg: 'h-8 w-8 border-3',
	xl: 'h-12 w-12 border-4',
};

type SpinnerProps = {
	size?: keyof typeof sizes;
	className?: string;
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
	return (
		<div
			role="status"
			aria-label="加载中"
			className={cn(
				'animate-spin rounded-full border-border border-t-primary',
				sizes[size],
				className,
			)}
		/>
	);
}
