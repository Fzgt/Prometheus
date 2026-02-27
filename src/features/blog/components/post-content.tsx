import { useEffect, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeAutolink from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { type Highlighter } from 'shiki';

import { Spinner } from '@/components/ui/spinner';
import { getHighlighter } from '@/lib/markdown';
import { cn } from '@/utils/cn';

type PostContentProps = {
	content: string;
	className?: string;
};

export function PostContent({ content, className }: PostContentProps) {
	const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
	const [isDark, setIsDark] = useState(
		document.documentElement.classList.contains('dark'),
	);

	useEffect(() => {
		getHighlighter().then(setHighlighter);
	}, []);

	useEffect(() => {
		const observer = new MutationObserver(() => {
			setIsDark(document.documentElement.classList.contains('dark'));
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		});
		return () => observer.disconnect();
	}, []);

	const components: Components = {
		code({ className: codeClassName, children, ...props }) {
			const match = /language-(\w+)/.exec(codeClassName || '');
			const language = match ? match[1] : '';
			const codeString = String(children).replace(/\n$/, '');
			const isInline = !match;

			if (isInline) {
				return (
					<code
						className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
						{...props}
					>
						{children}
					</code>
				);
			}

			if (!highlighter) {
				return (
					<div className="relative my-4 rounded-lg bg-muted p-4">
						<div className="absolute right-3 top-3">
							<Spinner size="sm" />
						</div>
						<pre className="overflow-x-auto font-mono text-sm">
							<code>{codeString}</code>
						</pre>
					</div>
				);
			}

			const html = highlighter.codeToHtml(codeString, {
				lang: language || 'text',
				theme: isDark ? 'github-dark' : 'github-light',
			});

			return (
				<div
					className="my-4 overflow-hidden rounded-lg border border-border [&>pre]:overflow-x-auto [&>pre]:!bg-transparent [&>pre]:p-4"
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			);
		},
		// 自定义图片：懒加载 + 圆角
		img({ src, alt }) {
			return (
				<img
					src={src}
					alt={alt}
					loading="lazy"
					className="my-4 rounded-lg border border-border"
				/>
			);
		},
		// 自定义链接：外部链接新标签页打开
		a({ href, children, ...props }) {
			const isExternal = href?.startsWith('http');
			return (
				<a
					href={href}
					{...props}
					{...(isExternal
						? { target: '_blank', rel: 'noopener noreferrer' }
						: {})}
					className="text-primary underline-offset-4 hover:underline"
				>
					{children}
				</a>
			);
		},
	};

	return (
		<div
			className={cn(
				'prose prose-neutral max-w-none dark:prose-invert',
				'prose-headings:scroll-mt-20 prose-headings:font-bold',
				'prose-h2:text-2xl prose-h3:text-xl',
				'prose-pre:p-0 prose-pre:bg-transparent',
				'prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground',
				'prose-table:text-sm',
				className,
			)}
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[
					rehypeSlug,
					[
						rehypeAutolink,
						{
							behavior: 'wrap',
							properties: {
								className: ['anchor'],
								ariaHidden: true,
								tabIndex: -1,
							},
						},
					],
				]}
				components={components}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
