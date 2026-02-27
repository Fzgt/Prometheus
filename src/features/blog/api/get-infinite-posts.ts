import { infiniteQueryOptions, useInfiniteQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { type PostsResponse } from '@/types/api';

import { type GetPostsOptions } from './get-posts';

// 复用同一个 API 函数，只是 query 配置不同
const getPostsPage = (options: GetPostsOptions = {}): Promise<PostsResponse> =>
	api.get('/api/posts', { params: options });

export const getInfinitePostsQueryOptions = (tag?: string) =>
	infiniteQueryOptions({
		queryKey: ['posts', 'infinite', { tag }],
		queryFn: ({ pageParam }) =>
			getPostsPage({ page: pageParam as number, tag }),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			const { page, totalPages } = lastPage.meta;
			return page < totalPages ? page + 1 : undefined;
		},
	});

export const useInfinitePosts = (tag?: string) =>
	useInfiniteQuery(getInfinitePostsQueryOptions(tag));
