/**
 * =============================================================================
 * 📖 文章详情页 (Post Detail Page)
 * =============================================================================
 *
 * 【知识点 - 完整的页面组件结构】
 * 这个组件展示了一个典型的数据驱动页面的完整模式：
 *   1. 路由参数获取（useParams）
 *   2. 数据请求（usePost Hook）
 *   3. 三种状态处理（loading → error → success）
 *   4. SEO 标签设置（Head 组件）
 *   5. 布局组件组合（ReadingProgress + 内容 + TOC + 评论）
 *
 * 【React Router - useParams 的类型安全】
 * useParams<{ slug: string }>() 指定了参数类型。
 * 但注意：useParams 的返回值中所有参数都是 string | undefined，
 * 即使你指定了 { slug: string }，slug 仍可能是 undefined。
 * 这是因为 TypeScript 不知道当前路由是否包含 :slug 参数。
 * 所以下面用 slug! （非空断言）告诉 TS "我确定 slug 存在"。
 *
 * 【页面布局 - 文章 + TOC 侧边栏】
 * 桌面端（xl 以上）：主内容 + 右侧 TOC
 * 移动端：只有主内容，TOC 隐藏（hidden xl:block）
 * TOC 使用 sticky top-20 固定在右侧，随页面滚动保持可见。
 * =============================================================================
 */
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { useParams, Link } from 'react-router';

import { Head } from '@/components/seo/head';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { usePost } from '@/features/blog/api/get-post';
import { PostContent } from '@/features/blog/components/post-content';
import { PostToc } from '@/features/blog/components/post-toc';
import { ReadingProgress } from '@/features/blog/components/reading-progress';
import { TagChip } from '@/features/blog/components/tag-chip';
import { CommentsList } from '@/features/comments/components/comments-list';
import { formatDate, formatReadingTime } from '@/utils/format';

export function PostDetailPage() {
	/**
	 * 【useParams - 从 URL 获取动态参数】
	 * 路由定义：path: 'posts/:slug'
	 * URL 示例：/posts/react-hooks-deep-dive
	 * → slug = 'react-hooks-deep-dive'
	 *
	 * slug! 非空断言：我们确定这个页面只在 /posts/:slug 路由下渲染，
	 * 所以 slug 一定存在。如果不确定，应该用 slug ?? '' 做空值处理。
	 */
	const { slug } = useParams<{ slug: string }>();
	const { data: post, isLoading, isError } = usePost({ slug: slug! });

	// ── 状态 1：加载中 ─────────────────────────────────────
	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Spinner size="xl" />
			</div>
		);
	}

	// ── 状态 2：加载失败或文章不存在 ────────────────────────
	if (isError || !post) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
				<p className="text-xl font-medium text-foreground">文章不存在</p>
				<p className="text-muted-foreground">该文章可能已被删除或链接有误</p>
				<Button asChild variant="outline">
					<Link to={paths.home.getHref()}>返回首页</Link>
				</Button>
			</div>
		);
	}

	// ── 状态 3：数据加载成功，渲染完整页面 ──────────────────
	return (
		<>
			{/* SEO 标签：文章标题、描述、封面图 */}
			<Head
				title={post.title}
				description={post.excerpt}
				image={post.coverImage}
				type="article"
			/>
			{/* 阅读进度条（页面最顶部的细线） */}
			<ReadingProgress />

			<div className="container max-w-6xl py-8">
				{/* 返回按钮 - asChild 让 Button 样式应用到 Link 上 */}
				<Button variant="ghost" size="sm" asChild className="mb-6">
					<Link to={paths.home.getHref()}>
						<ArrowLeft className="size-4" />
						所有文章
					</Link>
				</Button>

				{/* flex 布局：主内容 + 右侧 TOC */}
				<div className="flex gap-8">
					{/* 主内容区 - min-w-0 防止 flex 子元素溢出 */}
					<motion.article
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
						className="min-w-0 flex-1"
					>
						{/* 封面图 */}
						{post.coverImage && (
							<div className="mb-8 overflow-hidden rounded-xl">
								<img
									src={post.coverImage}
									alt={post.title}
									className="w-full object-cover"
									style={{ maxHeight: '400px' }}
								/>
							</div>
						)}

						{/* 可点击的标签（clickable 模式跳转到标签页） */}
						<div className="mb-4 flex flex-wrap gap-2">
							{post.tags.map((tag) => (
								<TagChip key={tag} tag={tag} clickable />
							))}
						</div>

						{/* 文章标题 */}
						<h1 className="mb-4 text-4xl font-bold leading-tight text-foreground">
							{post.title}
						</h1>

						{/* 元信息栏 */}
						<div className="mb-8 flex flex-wrap items-center gap-4 border-b border-border pb-8 text-sm text-muted-foreground">
							<span className="flex items-center gap-1.5">
								<User className="size-4" />
								{post.author.name}
							</span>
							<span className="flex items-center gap-1.5">
								<Calendar className="size-4" />
								{formatDate(post.publishedAt)}
							</span>
							<span className="flex items-center gap-1.5">
								<Clock className="size-4" />
								{formatReadingTime(post.readingTime)}
							</span>
						</div>

						{/* Markdown 渲染的文章内容 */}
						<PostContent content={post.content} />

						<div className="my-12 border-t border-border" />

						{/* 评论区 */}
						<CommentsList postId={post.id} />
					</motion.article>

					{/**
					 * 右侧 TOC（目录）
					 *
					 * hidden xl:block → 只在超宽屏（1280px+）显示
					 * sticky top-20 → 固定在视口内，随页面滚动保持可见
					 * w-64 shrink-0 → 固定宽度且不被 flex 压缩
					 */}
					<aside className="hidden w-64 shrink-0 xl:block">
						<div className="sticky top-20">
							<PostToc content={post.content} />
						</div>
					</aside>
				</div>
			</div>
		</>
	);
}
