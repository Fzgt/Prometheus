import Fuse from 'fuse.js';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { paths } from '@/config/paths';
import { type Post } from '@/types/api';
import { formatDate } from '@/utils/format';

import { usePosts } from '../api/get-posts';

import { TagChip } from './tag-chip';

function useAllPosts() {
	// 获取足够多的文章供搜索（实际项目中应有专门的搜索 API）
	return usePosts({
		options: { page: 1 },
		queryConfig: { staleTime: Infinity },
	});
}

type SearchBoxProps = {
	open: boolean;
	onClose: () => void;
};

export function SearchBox({ open, onClose }: SearchBoxProps) {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<Post[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	const { data } = useAllPosts();

	// useMemo 稳定引用：data?.data 是 TanStack Query 的稳定引用，
	// 但 ?? [] 每次渲染都生成新数组，必须用 useMemo 避免无限循环。
	const posts = useMemo(() => data?.data ?? [], [data]);

	// fuse 实例跟随 posts 引用变化才重建，避免每次渲染都 new Fuse()
	const fuse = useMemo(
		() =>
			new Fuse(posts, {
				keys: [
					{ name: 'title', weight: 2 },
					{ name: 'excerpt', weight: 1 },
					{ name: 'tags', weight: 1.5 },
				],
				threshold: 0.4,
				includeScore: true,
			}),
		[posts],
	);

	useEffect(() => {
		if (open) {
			setTimeout(() => inputRef.current?.focus(), 100);
			setQuery('');
			setResults([]);
		}
	}, [open]);

	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			return;
		}
		const fuseResults = fuse.search(query);
		setResults(fuseResults.slice(0, 5).map((r) => r.item));
	}, [query, fuse]);

	const handleSelect = (slug: string) => {
		navigate(paths.post.getHref(slug));
		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle className="sr-only">搜索文章</DialogTitle>
				</DialogHeader>

				<div className="relative">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						ref={inputRef}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="搜索文章标题、摘要或标签..."
						className="px-9"
					/>
					{query && (
						<button
							onClick={() => setQuery('')}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							<X className="size-4" />
						</button>
					)}
				</div>

				{results.length > 0 && (
					<ul className="space-y-1">
						{results.map((post) => (
							<li key={post.id}>
								<button
									onClick={() => handleSelect(post.slug)}
									className="w-full rounded-lg p-3 text-left transition-colors hover:bg-accent"
								>
									<div className="mb-1 flex flex-wrap gap-1">
										{post.tags.map((tag) => (
											<TagChip key={tag} tag={tag} />
										))}
									</div>
									<p className="font-medium text-foreground">{post.title}</p>
									<p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
										{post.excerpt}
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										{formatDate(post.publishedAt)}
									</p>
								</button>
							</li>
						))}
					</ul>
				)}

				{query && results.length === 0 && (
					<p className="py-4 text-center text-sm text-muted-foreground">
						{`没有找到"${query}"相关的文章`}
					</p>
				)}

				{!query && (
					<p className="py-2 text-center text-xs text-muted-foreground">
						按 <kbd className="rounded bg-muted px-1 py-0.5 font-mono">Esc</kbd>{' '}
						关闭
					</p>
				)}
			</DialogContent>
		</Dialog>
	);
}

export function SearchTrigger({ className }: { className?: string }) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.key === '/' &&
				!['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
			) {
				e.preventDefault();
				setOpen(true);
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, []);

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setOpen(true)}
				className={className}
			>
				<Search className="size-3.5" />
				<span className="hidden sm:inline">搜索</span>
				<kbd className="hidden rounded bg-muted px-1 py-0.5 font-mono text-xs sm:inline">
					/
				</kbd>
			</Button>
			<SearchBox open={open} onClose={() => setOpen(false)} />
		</>
	);
}
