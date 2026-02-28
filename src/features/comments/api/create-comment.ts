/**
 * =============================================================================
 * 📖 创建评论 API (Create Comment API - Mutation Example)
 * =============================================================================
 *
 * 【核心知识点 - useMutation 变更操作】
 * useQuery 用于"读"数据，useMutation 用于"写"数据（增删改）。
 * useMutation 的特点：
 *   - 不会自动执行，需要手动调用 mutate() 或 mutateAsync()
 *   - 不会被 queryKey 缓存
 *   - 可以定义 onSuccess、onError、onMutate（乐观更新）等回调
 *
 * 【知识点 - Zod + React Hook Form 表单验证】
 * 这是 React 生态中最流行的表单验证组合：
 *   - Zod：定义验证 schema（运行时验证 + 类型推断）
 *   - React Hook Form：高性能表单状态管理
 *   - @hookform/resolvers：将 Zod schema 桥接到 React Hook Form
 *
 * 数据流：
 *   Zod schema → zodResolver → React Hook Form → 提交时自动验证
 *   → 验证通过 → onSubmit(data) → mutate(data)
 *   → 验证失败 → errors 对象更新 → 表单显示错误信息
 * =============================================================================
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { type MutationConfig } from '@/lib/react-query';
import { type Comment } from '@/types/api';

/**
 * 【Zod Schema 表单验证】
 * 同一个 schema 同时用于：
 *   1. 运行时验证（zodResolver 在表单提交时验证）
 *   2. TypeScript 类型推断（z.infer 自动生成类型）
 * "一处定义，类型 + 验证同步"
 *
 * z.string().min(1, '请输入你的名字')
 *   → 必须是字符串 + 最少 1 个字符
 *   → 第二个参数是验证失败时的错误消息
 */
export const createCommentInputSchema = z.object({
	postId: z.string().min(1),
	authorName: z.string().min(1, '请输入你的名字').max(50),
	content: z.string().min(1, '请输入评论内容').max(500),
});

/**
 * 【TS 技巧 - z.infer 从 schema 推断类型】
 * 不需要手动定义 interface CreateCommentInput { ... }
 * z.infer 自动从 schema 推断出：
 *   { postId: string; authorName: string; content: string }
 *
 * 好处：schema 修改后，类型自动同步，不会出现不一致。
 */
export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;

/** API 函数：发送创建评论的 POST 请求 */
export const createComment = (data: CreateCommentInput): Promise<Comment> => {
	return api.post('/api/comments', data);
};

type UseCreateCommentOptions = {
	postId: string;
	mutationConfig?: MutationConfig<typeof createComment>;
};

/**
 * 创建评论的 Mutation Hook
 *
 * 【invalidateQueries - 缓存失效机制】
 * 评论创建成功后，需要刷新评论列表。
 * invalidateQueries({ queryKey: ['comments', postId] })
 * → 将匹配的缓存标记为"过时"（stale）
 * → 如果有组件正在使用这个缓存，React Query 自动重新请求
 * → 评论列表自动刷新，无需手动操作
 *
 * 这比手动更新缓存更简单可靠：
 *   ❌ 手动：queryClient.setQueryData(['comments', postId], old => [...old, newComment])
 *   ✅ 推荐：invalidateQueries → 让 React Query 自动重新请求
 *   手动更新适用于"乐观更新"场景（用户体验优先时）
 */
export const useCreateComment = ({
	postId,
	mutationConfig,
}: UseCreateCommentOptions) => {
	const queryClient = useQueryClient();
	const { addNotification } = useNotifications();

	return useMutation({
		// mutationFn：执行变更操作的函数
		mutationFn: createComment,
		// onSuccess：变更成功后的回调
		onSuccess: () => {
			// 使评论列表缓存失效，触发自动重新请求
			queryClient.invalidateQueries({ queryKey: ['comments', postId] });
			// 显示成功通知
			addNotification({
				type: 'success',
				title: '评论发布成功',
			});
		},
		// 展开 mutationConfig 允许调用方覆盖 onSuccess 等回调
		...mutationConfig,
	});
};
