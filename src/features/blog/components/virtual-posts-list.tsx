/**
 * =============================================================================
 * 📖 虚拟滚动文章列表 (Virtual Posts List)
 * =============================================================================
 *
 * 【核心知识点 - 虚拟滚动（Virtual Scrolling / Windowing）】
 * 问题：如果有 1000 篇文章，一次性渲染 1000 个 DOM 节点会导致：
 *   - 首次渲染很慢（DOM 节点越多，浏览器渲染越慢）
 *   - 滚动卡顿（大量 DOM 需要重绘重排）
 *   - 内存占用大
 *
 * 虚拟滚动的解决方案：
 *   - 只渲染视口内（+ 少量 overscan）的节点
 *   - 用一个大的空 div 撑开滚动条（让滚动条看起来是完整列表的长度）
 *   - 每个 item 用 position: absolute + translateY 定位到正确位置
 *   - 滚动时动态计算哪些 item 需要显示
 *
 * 结果：无论有多少数据，DOM 中始终只有 10~20 个节点。
 *
 * 【TanStack Virtual - useWindowVirtualizer】
 * useWindowVirtualizer 监听 window 的 scroll 事件（而非某个容器）。
 * 适合页面级的长列表。
 * 如果列表在一个固定高度的容器内，用 useVirtualizer。
 *
 * 【与无限加载（Infinite Query）的结合】
 * 这个组件同时使用了两个 TanStack 库：
 *   - TanStack Query（useInfiniteQuery）：按页加载数据
 *   - TanStack Virtual（useWindowVirtualizer）：虚拟渲染已加载的数据
 *
 * 数据流：
 *   用户滚动到底部 → lastVirtualItem 进入渲染列表
 *   → useEffect 检测到 → fetchNextPage() → 加载新一页
 *   → data.pages 更新 → allPosts 更新 → virtualizer 重新计算
 * =============================================================================
 */
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

	/**
	 * 【flatMap - 多页数据拍平】
	 * data.pages 的结构是 [{ data: Post[], meta }, { data: Post[], meta }, ...]
	 * flatMap(page => page.data) 把所有页的文章提取并拍平成一维数组。
	 *
	 * 【?? [] - 空值合并运算符】
	 * 在 data 未加载完成时提供空数组兜底。
	 */
	const allPosts: Post[] = data?.pages.flatMap((page) => page.data) ?? [];

	// 如果还有下一页，在列表末尾多加一个"加载中"占位
	const itemCount = allPosts.length + (hasNextPage ? 1 : 0);

	/**
	 * 【useWindowVirtualizer 配置】
	 * count：总 item 数量
	 * estimateSize：每个 item 的预估高度（px）
	 *   → 用于初始计算 totalSize，之后会被 measureElement 的真实测量值替代
	 *   → 设置得越接近真实高度，滚动条越稳定
	 * overscan：视口外额外渲染的 item 数量
	 *   → 避免快速滚动时出现白闪
	 *   → 值越大越平滑，但 DOM 节点越多
	 */
	const virtualizer = useWindowVirtualizer({
		count: itemCount,
		estimateSize: () => 300,
		overscan: 4,
	});

	// 获取当前需要渲染的虚拟 item 列表
	const virtualItems = virtualizer.getVirtualItems();

	// ── 无限滚动触发 ──────────────────────────────────────────────────────────
	// 当最后一个虚拟 item 进入渲染列表时，说明用户即将到达底部，触发下一页加载。
	// 这里用 useEffect + virtualItems 依赖来监听，而不是 IntersectionObserver，
	// 因为 virtualizer 本身已经知道哪些 item 需要渲染。
	const lastVirtualItem = virtualItems[virtualItems.length - 1];

	/**
	 * 【useRef 防止重复请求】
	 * hasFetchedRef 是一个"锁"，防止 fetchNextPage 被多次调用。
	 * 因为 useEffect 可能在 isFetchingNextPage 变为 true 之前多次触发，
	 * 如果不加锁，会发出多个重复请求。
	 * 用 ref 而非 state，因为不需要触发重渲染。
	 */
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
		/**
		 * 【外层容器】
		 * height = totalSize → 撑开滚动条到完整列表的高度
		 * position: relative → 子元素用 absolute 定位的参照物
		 */
		<div style={{ height: `${totalSize}px`, position: 'relative' }}>
			{virtualItems.map((virtualItem) => {
				const isLoaderRow = virtualItem.index > allPosts.length - 1;
				const post = allPosts[virtualItem.index];

				return (
					<div
						key={virtualItem.key}
						/**
						 * 【measureElement - 动态高度测量】
						 * ref={virtualizer.measureElement} 让 virtualizer 测量每个 item 的真实高度。
						 * 这比 estimateSize 更精确，特别是当 item 高度不一致时。
						 * data-index 属性是 TanStack Virtual 要求的，用于关联 item。
						 */
						ref={virtualizer.measureElement}
						data-index={virtualItem.index}
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							/**
							 * 【性能关键 - translateY vs top】
							 * 用 transform: translateY() 而非直接设置 top：
							 *   - transform 不触发布局重排（reflow），只触发合成（composite）
							 *   - 浏览器可以用 GPU 加速 transform
							 *   - 这是虚拟滚动的性能关键
							 */
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
