import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { type QueryConfig } from '@/lib/react-query';
import { type CommentsResponse } from '@/types/api';

export const getComments = (postId: string): Promise<CommentsResponse> => {
	return api.get('/api/comments', { params: { postId } });
};

export const getCommentsQueryOptions = (postId: string) => {
	return queryOptions({
		queryKey: ['comments', postId],
		queryFn: () => getComments(postId),
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
