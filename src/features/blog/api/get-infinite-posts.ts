/**
 * =============================================================================
 * 📖 无限滚动文章加载 API (Infinite Posts API)
 * =============================================================================
 *
 * 【知识点 - TanStack Query 的 infiniteQuery】
 * useInfiniteQuery 是 React Query 为"加载更多/无限滚动"场景设计的 Hook。
 * 与 useQuery 的区别：
 *   - useQuery：一个 queryKey 对应一份数据
 *   - useInfiniteQuery：一个 queryKey 对应多页数据（data.pages 数组）
 *
 * 核心配置：
 *   - initialPageParam：首页参数（通常是 1 或 0）
 *   - getNextPageParam：根据上一页数据计算下一页参数
 *     → 返回 undefined 表示没有下一页
 *     → 用于 hasNextPage 判断
 *   - queryFn({ pageParam })：接收当前页参数
 *
 * 【infiniteQueryOptions vs queryOptions】
 * v5 新增的 infiniteQueryOptions 函数，与 queryOptions 功能相似：
 *   - 集中定义 queryKey + queryFn + 分页逻辑
 *   - 类型安全（pageParam 类型自动推断）
 *   - 可被 useInfiniteQuery 和 prefetchInfiniteQuery 复用
 *
 * 【queryKey 命名策略】
 * ['posts', 'infinite', { tag }]
 * → 加了 'infinite' 前缀，与普通分页查询 ['posts', { page, tag }] 区分
 * → 这很重要！如果共用 key，分页查询和无限查询的缓存会互相覆盖
 * =============================================================================
 */
import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { type PostsResponse } from '@/types/api';

import { type GetPostsOptions } from './get-posts';

// 复用同一个 API 函数，只是 query 配置不同
const getPostsPage = (options: GetPostsOptions = {}): Promise<PostsResponse> =>
	api.get('/api/posts', { params: options });

/**
 * 无限查询的 queryOptions 工厂
 *
 * 【getNextPageParam 详解】
 * lastPage 是最后一页的响应数据（PostsResponse）
 * lastPage.meta.page：当前页码
 * lastPage.meta.totalPages：总页数
 *
 * 如果当前页 < 总页数 → 返回下一页页码（page + 1）
 * 如果已经是最后一页 → 返回 undefined
 * → React Query 看到 undefined 就知道 hasNextPage = false
 */
export const getInfinitePostsQueryOptions = (tag?: string) =>
	infiniteQueryOptions({
		queryKey: ['posts', 'infinite', { tag }],
		queryFn: ({ pageParam }) =>
			getPostsPage({ page: pageParam as number, tag }),
		// 初始页码
		initialPageParam: 1,
		// 计算下一页参数（返回 undefined 表示没有更多数据）
		getNextPageParam: (lastPage) => {
			const { page, totalPages } = lastPage.meta;
			return page < totalPages ? page + 1 : undefined;
		},
	});

/**
 * 无限加载 Hook
 *
 * 返回值包含：
 *   - data.pages：所有已加载页面的数组 [Page1, Page2, ...]
 *   - fetchNextPage()：加载下一页
 *   - hasNextPage：是否还有下一页
 *   - isFetchingNextPage：是否正在加载下一页
 */
export const useInfinitePosts = (tag?: string) =>
	useInfiniteQuery(getInfinitePostsQueryOptions(tag));
