import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formatRelativeDate } from '@/utils/format';

import { useDeleteComment } from '../api/delete-comment';
import { useComments } from '../api/get-comments';

import { CreateCommentForm } from './create-comment-form';

type CommentsListProps = {
  postId: string;
};

export function CommentsList({ postId }: CommentsListProps) {
  const { data, isLoading } = useComments({ postId });
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment({
    postId,
  });

  const comments = data?.data ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">
        评论 {comments.length > 0 && `(${comments.length})`}
      </h2>

      <CreateCommentForm postId={postId} />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : comments.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          暂无评论，成为第一个留言的人吧！
        </p>
      ) : (
        <ul className="space-y-4">
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.li
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                      <User className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {comment.authorName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteComment(comment.id)}
                    disabled={isDeleting}
                    title="删除评论"
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sr-only">删除评论</span>
                  </Button>
                </div>
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {comment.content}
                </p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
