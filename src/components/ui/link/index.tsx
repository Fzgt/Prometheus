import * as React from 'react';
import { Link as RouterLink, type LinkProps } from 'react-router';

import { cn } from '@/utils/cn';

type CustomLinkProps = LinkProps & {
	className?: string;
};

export const Link = React.forwardRef<HTMLAnchorElement, CustomLinkProps>(
	({ className, ...props }, ref) => {
		return (
			<RouterLink
				ref={ref}
				className={cn(
					'text-primary underline-offset-4 transition-colors hover:underline',
					className,
				)}
				{...props}
			/>
		);
	},
);
Link.displayName = 'Link';
