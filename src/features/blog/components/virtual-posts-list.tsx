import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { type Post } from '@/types/api';

import { useInfinitePosts } from '../api/get-infinite-posts';

import { PostCard } from './post-card';

type VirtualPostsListProps = {
	tag?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// 核心原理：
//   useWindowVirtualizer 监听 window scroll，计算哪些 item 在视口内。
//   DOM 里只存在「可见区域 ± overscan」的节点，其余的被回收。
//   用一个高度等于 totalSize 的占位 div 维持滚动条长度。
//   每个 item 用 position:absolute + translateY 定位到正确位置。
//   measureElement ref 让 virtualizer 知道每个 item 的真实高度（动态测量）。
// ─────────────────────────────────────────────────────────────────────────────

export function VirtualPostsList({ tag }: VirtualPostsListProps) {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		useInfinitePosts(tag);

	// 把所有页的数据拍平成一个数组
	const allPosts: Post[] = data?.pages.flatMap((page) => page.data) ?? [];

	// 最后一个 item 是"加载中"占位，只在 hasNextPage 时加
	const itemCount = allPosts.length + (hasNextPage ? 1 : 0);

	const virtualizer = useWindowVirtualizer({
		count: itemCount,
		// 每个 item 的预估高度（px）。
		// 实际高度由 measureElement 动态测量后修正，这里只是初始占位。
		estimateSize: () => 300,
		// 视口外额外渲染的 item 数量，避免快速滚动时闪白
		overscan: 4,
	});

	const virtualItems = virtualizer.getVirtualItems();

	// ── 无限滚动触发 ──────────────────────────────────────────────────────────
	// 当最后一个虚拟 item 进入渲染列表时，说明用户即将到达底部，触发下一页加载。
	// 这里用 useEffect + virtualItems 依赖来监听，而不是 IntersectionObserver，
	// 因为 virtualizer 本身已经知道哪些 item 需要渲染。
	const lastVirtualItem = virtualItems[virtualItems.length - 1];

	const hasFetchedRef = useRef(false);

	useEffect(() => {
		if (!lastVirtualItem) return;

		const isLastItemVisible = lastVirtualItem.index >= allPosts.length - 1;

		if (isLastItemVisible && hasNextPage && !isFetchingNextPage) {
			if (!hasFetchedRef.current) {
				hasFetchedRef.current = true;
				fetchNextPage().finally(() => {
					hasFetchedRef.current = false;
				});
			}
		}
	}, [
		lastVirtualItem,
		allPosts.length,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	]);

	// ── 首次加载 ──────────────────────────────────────────────────────────────
	if (isLoading) {
		return (
			<div className="flex justify-center py-16">
				<Spinner size="xl" />
			</div>
		);
	}

	if (allPosts.length === 0) {
		return (
			<div className="py-16 text-center text-muted-foreground">
				{tag ? `没有找到标签"${tag}"下的文章。` : '暂无文章。'}
			</div>
		);
	}

	// ── 渲染 ──────────────────────────────────────────────────────────────────
	// totalSize：virtualizer 算出的所有 item 累计高度，用于占位撑开滚动条。
	// 每个 virtualItem.start 是该 item 距列表顶部的像素偏移。
	const totalSize = virtualizer.getTotalSize();

	return (
		<div style={{ height: `${totalSize}px`, position: 'relative' }}>
			{virtualItems.map((virtualItem) => {
				const isLoaderRow = virtualItem.index > allPosts.length - 1;
				const post = allPosts[virtualItem.index];

				return (
					<div
						key={virtualItem.key}
						// measureElement：每次 item 挂载/更新后，virtualizer 重新测量真实高度
						ref={virtualizer.measureElement}
						data-index={virtualItem.index}
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							// 用 translate 而非 top，避免触发 layout，性能更好
							transform: `translateY(${virtualItem.start}px)`,
							paddingBottom: '24px', // 卡片间距
						}}
					>
						{isLoaderRow ? (
							<div className="flex justify-center py-8">
								<Spinner size="lg" />
							</div>
						) : (
							<PostCard post={post} index={virtualItem.index} />
						)}
					</div>
				);
			})}
		</div>
	);
}
