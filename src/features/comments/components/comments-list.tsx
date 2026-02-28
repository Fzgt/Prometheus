/**
 * =============================================================================
 * 📖 评论列表组件 (Comments List)
 * =============================================================================
 *
 * 显示文章下方的评论列表，支持加载、删除和动画。
 *
 * 【知识点 - 完整的 CRUD UI 模式】
 * 这个组件展示了一个典型的数据列表组件的构成：
 * 1. 查询 Hook（useComments）→ 获取评论列表
 * 2. 变更 Hook（useDeleteComment）→ 删除评论
 * 3. 表单组件（CreateCommentForm）→ 创建评论
 * 4. 三种状态渲染：loading / empty / data
 * 5. 动画（AnimatePresence）→ 列表项的进入和退出动画
 *
 * 【知识点 - Framer Motion AnimatePresence】
 * AnimatePresence 让组件在从 DOM 中移除时播放退出动画。
 *
 * 普通的条件渲染（{show && <div>}）：
 * → show 变 false 时，React 立即卸载 DOM → 没有退出动画
 *
 * AnimatePresence 包裹：
 * → show 变 false 时，先播放 exit 动画 → 动画完成后才卸载 DOM
 *
 * 要求：
 * 1. 子元素必须有唯一的 key prop（AnimatePresence 通过 key 追踪元素）
 * 2. 子元素必须是 motion.xxx 组件（或 forwardRef 组件）
 * 3. 子元素需要定义 exit prop（退出动画目标状态）
 *
 * 【知识点 - useMutation 的解构重命名】
 * const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment(...)
 *
 * ES6 解构重命名语法：{ 原名: 新名 }
 * mutate → deleteComment：让函数名更语义化
 * isPending → isDeleting：让状态名更具体
 *
 * 【知识点 - 条件渲染的三元嵌套】
 * {isLoading ? <Spinner> : comments.length === 0 ? <Empty> : <List>}
 *
 * 这是三种状态的简洁写法，等价于：
 * if (isLoading) return <Spinner>;
 * if (comments.length === 0) return <Empty>;
 * return <List>;
 *
 * 嵌套三元在 2 层以内是可接受的，超过 2 层建议拆分。
 * =============================================================================
 */
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
	// ── 获取评论数据 ──────────────────────────────────────
	const { data, isLoading } = useComments({ postId });

	// ── 删除评论的 mutation ──────────────────────────────
	/**
	 * mutate: deleteComment → 调用 deleteComment(commentId) 发起删除请求
	 * isPending: isDeleting → 是否正在删除中（用于禁用按钮）
	 *
	 * useDeleteComment 内部已配置 onSuccess 回调，
	 * 会自动 invalidateQueries 刷新评论列表。
	 */
	const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment({
		postId,
	});

	/** 空值合并：data 加载完成前使用空数组 */
	const comments = data?.data ?? [];

	return (
		<div className="space-y-6">
			{/* 标题 + 评论数 */}
			<h2 className="text-xl font-bold">
				评论 {comments.length > 0 && `(${comments.length})`}
			</h2>

			{/* 评论创建表单（始终显示在列表上方） */}
			<CreateCommentForm postId={postId} />

			{/* 三种状态：加载中 / 无评论 / 评论列表 */}
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
					{/**
					 * 【AnimatePresence 包裹列表】
					 * 当某条评论被删除时（从 comments 数组中消失），
					 * AnimatePresence 会先播放 exit 动画再卸载 DOM。
					 *
					 * 注意 key={comment.id} 是必需的：
					 * AnimatePresence 通过 key 来识别"哪个元素被移除了"。
					 */}
					<AnimatePresence>
						{comments.map((comment) => (
							<motion.li
								key={comment.id}
								/**
								 * 【进入动画】
								 * initial → 组件首次渲染时的初始状态
								 * animate → 动画目标状态
								 * 效果：从下方 10px 淡入
								 */
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								/**
								 * 【退出动画】
								 * exit → 组件被移除时的动画目标状态
								 * 效果：淡出 + 高度收缩为 0（列表项平滑消失）
								 *
								 * height: 0 会让下方元素自然上移，
								 * 避免删除后其他评论"跳一下"的突兀感。
								 */
								exit={{ opacity: 0, height: 0 }}
								className="rounded-lg border border-border bg-card p-4"
							>
								{/* 评论头部：头像 + 作者名 + 时间 + 删除按钮 */}
								<div className="mb-2 flex items-center justify-between">
									<div className="flex items-center gap-2">
										{/* 头像占位圆 */}
										<div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
											<User className="size-4 text-primary" />
										</div>
										<div>
											<p className="text-sm font-medium">
												{comment.authorName}
											</p>
											<p className="text-xs text-muted-foreground">
												{/* formatRelativeDate → "2 小时前"、"昨天" */}
												{formatRelativeDate(comment.createdAt)}
											</p>
										</div>
									</div>
									{/**
									 * 【删除按钮】
									 * variant="ghost" size="icon" → 无边框的图标按钮
									 * hover:text-destructive → 悬停时变红色（危险操作暗示）
									 * disabled={isDeleting} → 删除中禁用，防止重复点击
									 *
									 * sr-only → 屏幕阅读器文本
									 * title → 鼠标悬停提示（sighted 用户）
									 */}
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
								{/**
								 * whitespace-pre-wrap → 保留换行和空格
								 * 用户输入的评论可能包含换行，这个属性确保换行被正确显示
								 */}
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
