/**
 * =============================================================================
 * 📖 删除评论 API (Delete Comment Mutation)
 * =============================================================================
 *
 * 【知识点 - Mutation 的返回值类型】
 * deleteComment 返回 Promise<{ success: boolean }>，
 * 这是后端删除接口的常见返回格式。
 *
 * 你也可能见到其他格式：
 *   - 204 No Content（无响应体）
 *   - { id: string }（返回被删除的资源 ID）
 *   - { deleted: true, id: string }
 *
 * 【与 createComment 的对比】
 * 两个 mutation 的结构几乎一致，唯一区别：
 *   - createComment：参数是对象（CreateCommentInput）
 *   - deleteComment：参数是字符串（commentId）
 *
 * MutationConfig<typeof deleteComment> 会自动推断参数类型为 string。
 * =============================================================================
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { type MutationConfig } from '@/lib/react-query';

/** API 函数：发送删除评论的 DELETE 请求 */
export const deleteComment = (
	commentId: string,
): Promise<{ success: boolean }> => {
	return api.delete(`/api/comments/${commentId}`);
};

type UseDeleteCommentOptions = {
	postId: string; // 需要 postId 来精准 invalidate 评论列表缓存
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
			// 删除成功后刷新该文章的评论列表
			queryClient.invalidateQueries({ queryKey: ['comments', postId] });
			addNotification({
				type: 'success',
				title: '评论已删除',
			});
		},
		...mutationConfig,
	});
};
