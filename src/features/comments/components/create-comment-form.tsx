/**
 * =============================================================================
 * 📖 创建评论表单 (Create Comment Form)
 * =============================================================================
 *
 * 【核心知识点 - React Hook Form + Zod 表单】
 * 这是 React 生态中最佳的表单处理方案，展示了：
 *   1. React Hook Form 的核心 API（register、handleSubmit、formState）
 *   2. Zod schema 与 zodResolver 的集成
 *   3. useMutation 与表单提交的配合
 *
 * 【React Hook Form vs Formik vs 受控组件】
 * - 受控组件：每次输入触发 setState → 组件重渲染 → 表单越大越卡
 * - Formik：基于受控组件，大表单性能差
 * - React Hook Form：基于 ref 的非受控表单，输入时不触发重渲染！
 *   → register() 返回 ref + onChange，直接操作 DOM 而非 React state
 *   → 只在提交/验证时才触发重渲染（显示错误信息）
 *
 * 【zodResolver 的作用】
 * resolver: zodResolver(createCommentInputSchema)
 * 将 Zod schema 桥接到 React Hook Form 的验证系统：
 *   1. 用户提交表单
 *   2. React Hook Form 调用 resolver 验证数据
 *   3. Zod 执行验证
 *   4. 验证通过 → onSubmit(data) 被调用
 *   5. 验证失败 → errors 对象更新，组件重渲染显示错误
 * =============================================================================
 */
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
	/**
	 * 【useForm 核心 API】
	 *
	 * register('fieldName')
	 *   → 返回 { ref, onChange, onBlur, name }，将 input 注册到表单系统
	 *   → 使用方式：<input {...register('authorName')} />
	 *   → 这是 React Hook Form 的核心：通过 ref 操作非受控表单元素
	 *
	 * handleSubmit(onSubmit)
	 *   → 返回一个事件处理函数，放在 <form onSubmit={...}> 上
	 *   → 提交时先执行 resolver 验证 → 验证通过调用 onSubmit(data)
	 *   → data 的类型由 useForm<CreateCommentInput> 的泛型决定
	 *
	 * reset()
	 *   → 重置表单到初始值
	 *   → 提交成功后调用，清空输入框
	 *
	 * formState.errors
	 *   → 验证错误的对象，结构：{ fieldName: { message: string } }
	 *   → 例如：errors.authorName?.message → '请输入你的名字'
	 */
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateCommentInput>({
		// zodResolver 将 Zod schema 集成到表单验证中
		resolver: zodResolver(createCommentInputSchema),
		// 默认值：postId 是隐藏字段，用户不需要输入
		defaultValues: { postId },
	});

	/**
	 * 【useMutation 返回值解构】
	 * mutate: createComment → 重命名 mutate 为 createComment，语义更清晰
	 * isPending → 是否正在发送请求（用于禁用按钮、显示 loading）
	 *
	 * mutate vs mutateAsync：
	 *   - mutate()：不返回 Promise，回调通过 options 传入
	 *   - mutateAsync()：返回 Promise，可以 await
	 */
	const { mutate: createComment, isPending } = useCreateComment({ postId });

	/**
	 * 表单提交处理
	 *
	 * 【mutate 的第二个参数：options】
	 * onSuccess 在 useCreateComment 中已经定义了（invalidate + 通知）。
	 * 这里额外传入 onSuccess 来重置表单——它会在 Hook 级别的 onSuccess 之后执行。
	 * reset({ postId }) 清空用户输入，但保留 postId 隐藏字段。
	 */
	const onSubmit = (data: CreateCommentInput) => {
		createComment(data, { onSuccess: () => reset({ postId }) });
	};

	return (
		/**
		 * 【form 标签 + handleSubmit】
		 * handleSubmit 做了这些事：
		 *   1. 阻止默认的表单提交行为（e.preventDefault()）
		 *   2. 收集所有 registered 字段的值
		 *   3. 通过 resolver 验证
		 *   4. 验证通过 → 调用 onSubmit(data)
		 *   5. 验证失败 → 更新 errors，触发重渲染
		 */
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
			{/* 隐藏字段：postId 不需要用户输入 */}
			<input type="hidden" {...register('postId')} />

			<div>
				{/**
				 * {...register('authorName')} 展开后等价于：
				 * ref={register返回的ref}
				 * onChange={register返回的onChange}
				 * onBlur={register返回的onBlur}
				 * name="authorName"
				 */}
				<Input
					{...register('authorName')}
					placeholder="你的名字"
					className={cn(errors.authorName && 'border-destructive')}
					disabled={isPending}
				/>
				{/* 条件渲染错误信息 */}
				{errors.authorName && (
					<p className="mt-1 text-xs text-destructive">
						{errors.authorName.message}
					</p>
				)}
			</div>

			<div>
				{/* textarea 也可以用 register 注册 */}
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
				{/* 根据 pending 状态切换按钮文字 */}
				{isPending ? '发布中...' : '发布评论'}
			</Button>
		</form>
	);
}
