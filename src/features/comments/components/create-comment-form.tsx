import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

import {
	createCommentInputSchema,
	type CreateCommentInput,
	useCreateComment,
} from '../api/create-comment';

type CreateCommentFormProps = {
	postId: string;
};

export function CreateCommentForm({ postId }: CreateCommentFormProps) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateCommentInput>({
		resolver: zodResolver(createCommentInputSchema),
		defaultValues: { postId },
	});

	const { mutate: createComment, isPending } = useCreateComment({ postId });

	const onSubmit = (data: CreateCommentInput) => {
		createComment(data, { onSuccess: () => reset({ postId }) });
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
			<input type="hidden" {...register('postId')} />

			<div>
				<Input
					{...register('authorName')}
					placeholder="你的名字"
					className={cn(errors.authorName && 'border-destructive')}
					disabled={isPending}
				/>
				{errors.authorName && (
					<p className="mt-1 text-xs text-destructive">
						{errors.authorName.message}
					</p>
				)}
			</div>

			<div>
				<textarea
					{...register('content')}
					placeholder="写下你的想法..."
					rows={4}
					disabled={isPending}
					className={cn(
						'flex min-h-[80px] w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
						errors.content && 'border-destructive',
					)}
				/>
				{errors.content && (
					<p className="mt-1 text-xs text-destructive">
						{errors.content.message}
					</p>
				)}
			</div>

			<Button type="submit" size="sm" disabled={isPending}>
				<Send className="size-4" />
				{isPending ? '发布中...' : '发布评论'}
			</Button>
		</form>
	);
}
