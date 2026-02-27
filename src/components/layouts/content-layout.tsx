import * as React from 'react';

import { cn } from '@/utils/cn';

type ContentLayoutProps = {
	children: React.ReactNode;
	className?: string;
};

export function ContentLayout({ children, className }: ContentLayoutProps) {
	return (
		<div className={cn('container max-w-4xl py-8 md:py-12', className)}>
			{children}
		</div>
	);
}
