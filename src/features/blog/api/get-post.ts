/**
 * =============================================================================
 * 📖 获取单篇文章 API (Get Single Post API)
 * =============================================================================
 *
 * 同样遵循"三件套"模式：API 函数 → queryOptions → Hook
 *
 * 【知识点 - enabled 选项】
 * enabled: !!slug → 只有 slug 为真值时才执行查询。
 * !!slug 双重否定将 slug 转为 boolean：
 *   - ''、undefined、null → false（不请求）
 *   - 'react-hooks' → true（发送请求）
 *
 * 为什么需要 enabled？
 * → 在 PostDetailPage 中，useParams() 可能在某个渲染周期返回 undefined
 * → 如果不加 enabled，React Query 会发送 /api/posts/undefined 的请求
 * → enabled: false 时，query 状态停留在 idle，不会发送请求
 * =============================================================================
 */
import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { type QueryConfig } from '@/lib/react-query';
import { type Post } from '@/types/api';

/**
 * API 函数：获取单篇文章
 * 返回类型是 Post（不是 PostsResponse），因为是详情接口
 */
export const getPost = (slug: string): Promise<Post> => {
	return api.get(`/api/posts/${slug}`);
};

export const getPostQueryOptions = (slug: string) => {
	return queryOptions({
		// queryKey 以 'posts' 开头，与列表查询共享命名空间
		// 这意味着 invalidateQueries({ queryKey: ['posts'] }) 会同时使列表和详情缓存失效
		queryKey: ['posts', slug],
		queryFn: () => getPost(slug),
		// 控制查询是否执行：slug 为空字符串或 undefined 时不请求
		enabled: !!slug,
	});
};

type UsePostOptions = {
	slug: string;
	queryConfig?: QueryConfig<typeof getPostQueryOptions>;
};

export const usePost = ({ slug, queryConfig }: UsePostOptions) => {
	return useQuery({
		...getPostQueryOptions(slug),
		...queryConfig,
	});
};
