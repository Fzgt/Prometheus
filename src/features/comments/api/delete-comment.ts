import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { type MutationConfig } from '@/lib/react-query';

export const deleteComment = (
	commentId: string,
): Promise<{ success: boolean }> => {
	return api.delete(`/api/comments/${commentId}`);
};

type UseDeleteCommentOptions = {
	postId: string;
	mutationConfig?: MutationConfig<typeof deleteComment>;
};

export const useDeleteComment = ({
	postId,
	mutationConfig,
}: UseDeleteCommentOptions) => {
	const queryClient = useQueryClient();
	const { addNotification } = useNotifications();

	return useMutation({
		mutationFn: deleteComment,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['comments', postId] });
			addNotification({
				type: 'success',
				title: '评论已删除',
			});
		},
		...mutationConfig,
	});
};
