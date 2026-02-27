import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { type QueryConfig } from '@/lib/react-query';
import { type Post } from '@/types/api';

export const getPost = (slug: string): Promise<Post> => {
	return api.get(`/api/posts/${slug}`);
};

export const getPostQueryOptions = (slug: string) => {
	return queryOptions({
		queryKey: ['posts', slug],
		queryFn: () => getPost(slug),
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
