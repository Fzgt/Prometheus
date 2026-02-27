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
