/**
 * =============================================================================
 * 📖 获取标签列表 API (Get Tags API)
 * =============================================================================
 *
 * 同样遵循"三件套"模式。
 *
 * 【知识点 - staleTime 的精细控制】
 * 这里给 tags 查询设置了 5 分钟的 staleTime，而全局默认是 1 分钟。
 * 原因：标签数据变化频率很低（只有发布新文章才会变），
 * 5 分钟内重复访问不需要重新请求。
 *
 * staleTime 的层级（优先级从高到低）：
 *   1. useQuery({ staleTime: ... })  → 单次调用级别
 *   2. queryOptions({ staleTime: ... }) → queryOptions 级别
 *   3. queryClient.setQueryDefaults → queryKey 前缀级别
 *   4. new QueryClient({ defaultOptions }) → 全局级别
 * =============================================================================
 */
import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { type QueryConfig } from '@/lib/react-query';
import { type TagsResponse } from '@/types/api';

export const getTags = (): Promise<TagsResponse> => {
	return api.get('/api/tags');
};

export const getTagsQueryOptions = () => {
	return queryOptions({
		queryKey: ['tags'],
		queryFn: getTags,
		// 标签数据变化频率低，5 分钟内视为"新鲜"
		staleTime: 1000 * 60 * 5,
	});
};

type UseTagsOptions = {
	queryConfig?: QueryConfig<typeof getTagsQueryOptions>;
};

export const useTags = ({ queryConfig }: UseTagsOptions = {}) => {
	return useQuery({
		...getTagsQueryOptions(),
		...queryConfig,
	});
};
