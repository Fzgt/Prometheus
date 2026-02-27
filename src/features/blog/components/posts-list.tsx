import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import { getPostsQueryOptions, usePosts } from '../api/get-posts';

import { PostCard } from './post-card';

type PostsListProps = {
	tag?: string;
};

export function PostsList({ tag }: PostsListProps) {
	const [page, setPage] = useState(1);
	const queryClient = useQueryClient();

	const { data, isLoading, isFetching } = usePosts({
		options: { page, tag },
	});

	// 预取下一页
	const prefetchNextPage = () => {
		if (data && page < data.meta.totalPages) {
			queryClient.prefetchQuery(getPostsQueryOptions({ page: page + 1, tag }));
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center py-16">
				<Spinner size="xl" />
			</div>
		);
	}

	if (!data || data.data.length === 0) {
		return (
			<div className="py-16 text-center text-muted-foreground">
				{tag ? `没有找到标签"${tag}"下的文章。` : '暂无文章。'}
			</div>
		);
	}

	return (
		<div>
			<div
				className="relative"
				style={{ opacity: isFetching ? 0.7 : 1, transition: 'opacity 0.2s' }}
			>
				<div className="grid gap-6 sm:grid-cols-2">
					{data.data.map((post, index) => (
						<PostCard key={post.id} post={post} index={index} />
					))}
				</div>
			</div>

			{data.meta.totalPages > 1 && (
				<div className="mt-8 flex items-center justify-center gap-2">
					<Button
						variant="outline"
						size="icon"
						onClick={() => setPage((p) => p - 1)}
						disabled={page === 1 || isFetching}
					>
						<ChevronLeft className="size-4" />
						<span className="sr-only">上一页</span>
					</Button>

					<span className="px-4 text-sm text-muted-foreground">
						第 {page} / {data.meta.totalPages} 页
					</span>

					<Button
						variant="outline"
						size="icon"
						onClick={() => setPage((p) => p + 1)}
						disabled={page === data.meta.totalPages || isFetching}
						onMouseEnter={prefetchNextPage}
					>
						<ChevronRight className="size-4" />
						<span className="sr-only">下一页</span>
					</Button>
				</div>
			)}
		</div>
	);
}
