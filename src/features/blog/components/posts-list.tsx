/**
 * =============================================================================
 * 📖 文章列表组件 - 传统分页版 (Posts List with Pagination)
 * =============================================================================
 *
 * 【知识点 - React Query 的 prefetchQuery 数据预取】
 * 这个组件展示了一个高级用户体验优化：
 * 当用户鼠标悬停在"下一页"按钮上时（onMouseEnter），
 * 就开始预取下一页的数据。等用户真正点击时，数据可能已经在缓存中了。
 *
 * prefetchQuery vs fetchQuery：
 *   - prefetchQuery：后台获取数据放入缓存，不返回数据，不抛出错误
 *   - fetchQuery：获取数据并返回，可能抛出错误
 *
 * 【isFetching vs isLoading 的区别】
 * - isLoading：首次加载时为 true（缓存中没有任何数据）
 * - isFetching：任何请求进行时为 true（包括后台重新验证）
 * 这里用 isLoading 控制初始骨架屏，isFetching 控制列表透明度变化。
 *
 * 【React 状态管理 - useState + useQuery 的配合】
 * page 状态由 useState 管理（客户端状态）。
 * 当 page 变化时，usePosts 的 queryKey 变化 → 自动请求新数据。
 * 这就是 React Query 的核心理念："数据随 key 变化自动更新"。
 * =============================================================================
 */
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
	// useQueryClient 获取 QueryClient 实例，用于 prefetchQuery
	const queryClient = useQueryClient();

	const { data, isLoading, isFetching } = usePosts({
		options: { page, tag },
	});

	/**
	 * 【预取优化 - 鼠标悬停时预加载下一页】
	 * queryClient.prefetchQuery(queryOptions) 的行为：
	 *   1. 检查缓存中是否已有数据
	 *   2. 如果有且未过期 → 什么都不做
	 *   3. 如果没有或已过期 → 后台发送请求，结果放入缓存
	 *
	 * 用户感知：点击"下一页"后瞬间显示数据（因为已经在缓存中）
	 */
	const prefetchNextPage = () => {
		if (data && page < data.meta.totalPages) {
			queryClient.prefetchQuery(getPostsQueryOptions({ page: page + 1, tag }));
		}
	};

	// 首次加载：全屏 loading
	if (isLoading) {
		return (
			<div className="flex justify-center py-16">
				<Spinner size="xl" />
			</div>
		);
	}

	// 空状态
	if (!data || data.data.length === 0) {
		return (
			<div className="py-16 text-center text-muted-foreground">
				{tag ? `没有找到标签"${tag}"下的文章。` : '暂无文章。'}
			</div>
		);
	}

	return (
		<div>
			{/**
			 * 【用 opacity 实现"正在加载"的视觉反馈】
			 * 而不是替换为 Spinner，让用户仍然能看到旧数据。
			 * 这比完全替换为 loading 动画的体验更好——减少布局跳动。
			 */}
			<div
				className="relative"
				style={{ opacity: isFetching ? 0.7 : 1, transition: 'opacity 0.2s' }}
			>
				{/* 响应式网格：移动端 1 列，sm (640px+) 2 列 */}
				<div className="grid gap-6 sm:grid-cols-2">
					{data.data.map((post, index) => (
						<PostCard key={post.id} post={post} index={index} />
					))}
				</div>
			</div>

			{/* 分页控制 */}
			{data.meta.totalPages > 1 && (
				<div className="mt-8 flex items-center justify-center gap-2">
					<Button
						variant="outline"
						size="icon"
						onClick={() => setPage((p) => p - 1)}
						disabled={page === 1 || isFetching}
					>
						<ChevronLeft className="size-4" />
						{/* sr-only：屏幕阅读器专用文本 */}
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
						// 鼠标悬停时预取下一页数据
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
