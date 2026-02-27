import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { type MutationConfig } from '@/lib/react-query';
import { type Comment } from '@/types/api';

export const createCommentInputSchema = z.object({
  postId: z.string().min(1),
  authorName: z.string().min(1, '请输入你的名字').max(50),
  content: z.string().min(1, '请输入评论内容').max(500),
});

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;

export const createComment = (data: CreateCommentInput): Promise<Comment> => {
  return api.post('/api/comments', data);
};

type UseCreateCommentOptions = {
  postId: string;
  mutationConfig?: MutationConfig<typeof createComment>;
};

export const useCreateComment = ({
  postId,
  mutationConfig,
}: UseCreateCommentOptions) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      addNotification({
        type: 'success',
        title: '评论发布成功',
      });
    },
    ...mutationConfig,
  });
};
