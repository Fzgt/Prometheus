import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { type QueryConfig } from '@/lib/react-query';
import { type PostsResponse } from '@/types/api';

export type GetPostsOptions = {
  page?: number;
  tag?: string;
};

export const getPosts = (
  options: GetPostsOptions = {},
): Promise<PostsResponse> => {
  return api.get('/api/posts', { params: options });
};

export const getPostsQueryOptions = (options: GetPostsOptions = {}) => {
  return queryOptions({
    queryKey: ['posts', options],
    queryFn: () => getPosts(options),
  });
};

type UsePostsOptions = {
  options?: GetPostsOptions;
  queryConfig?: QueryConfig<typeof getPostsQueryOptions>;
};

export const usePosts = ({
  options = {},
  queryConfig,
}: UsePostsOptions = {}) => {
  return useQuery({
    ...getPostsQueryOptions(options),
    ...queryConfig,
  });
};
