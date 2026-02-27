import { useEffect, useState } from 'react';

import { extractHeadings } from '@/lib/markdown';
import { cn } from '@/utils/cn';

type TocItem = {
	id: string;
	text: string;
	level: number;
};

type PostTocProps = {
	content: string;
	className?: string;
};

export function PostToc({ content, className }: PostTocProps) {
	const [activeId, setActiveId] = useState<string>('');
	const headings: TocItem[] = extractHeadings(content);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				});
			},
			{
				rootMargin: '-80px 0px -70% 0px',
				threshold: 0,
			},
		);

		headings.forEach(({ id }) => {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		});

		return () => observer.disconnect();
	}, [headings]);

	if (headings.length === 0) return null;

	return (
		<nav className={cn('text-sm', className)} aria-label="文章目录">
			<p className="mb-3 font-semibold text-foreground">目录</p>
			<ul className="space-y-1.5">
				{headings.map((heading) => (
					<li
						key={heading.id}
						style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
					>
						<a
							href={`#${heading.id}`}
							className={cn(
								'block truncate py-0.5 text-muted-foreground transition-colors hover:text-foreground',
								activeId === heading.id && 'font-medium text-primary',
							)}
							onClick={(e) => {
								e.preventDefault();
								const el = document.getElementById(heading.id);
								if (el) {
									const offset = 80;
									const top =
										el.getBoundingClientRect().top + window.scrollY - offset;
									window.scrollTo({ top, behavior: 'smooth' });
								}
							}}
						>
							{heading.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
