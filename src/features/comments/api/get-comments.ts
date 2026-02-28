/**
 * =============================================================================
 * 📖 获取评论列表 API (Get Comments API)
 * =============================================================================
 *
 * 标准的"三件套"模式。注意与 get-posts.ts 的结构对比——
 * 几乎是复制粘贴的模板，只是 API 路径、queryKey 和类型不同。
 *
 * 【模式化的好处】
 * 当你需要新增一个 API 接口时：
 *   1. 复制一个已有的 API 文件
 *   2. 修改 API 路径、queryKey、类型
 *   3. 完成！
 * 这种"模板化"大幅降低了新功能的开发成本。
 * =============================================================================
 */
import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { type QueryConfig } from '@/lib/react-query';
import { type CommentsResponse } from '@/types/api';

export const getComments = (postId: string): Promise<CommentsResponse> => {
	return api.get('/api/comments', { params: { postId } });
};

export const getCommentsQueryOptions = (postId: string) => {
	return queryOptions({
		// queryKey 结构：['comments', postId]
		// 每篇文章的评论独立缓存
		queryKey: ['comments', postId],
		queryFn: () => getComments(postId),
		// 只有 postId 有值时才发请求
		enabled: !!postId,
	});
};

type UseCommentsOptions = {
	postId: string;
	queryConfig?: QueryConfig<typeof getCommentsQueryOptions>;
};

export const useComments = ({ postId, queryConfig }: UseCommentsOptions) => {
	return useQuery({
		...getCommentsQueryOptions(postId),
		...queryConfig,
	});
};
