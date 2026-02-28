/**
 * =============================================================================
 * 📖 文章卡片组件 (Post Card Component)
 * =============================================================================
 *
 * 【知识点 - Framer Motion 列表动画】
 * motion.article 是 Framer Motion 的动画包装器。
 * 每张卡片从透明/下移状态动画到正常状态。
 * delay: index * 0.05 → 列表中的卡片依次出现（交错动画 / stagger effect）
 * 这创造了一个"瀑布式"的出场效果。
 *
 * 【React Router - useNavigate 编程式导航】
 * useNavigate() 返回 navigate 函数，用于 JS 逻辑中的页面跳转。
 * 这里用在 onClick 上（而不是用 <Link>），因为整个卡片都是可点击的。
 * 另一种做法是用 <Link> 包裹整个卡片，但 <Link> 包裹 block 元素
 * 在语义和无障碍性上存在争议。
 *
 * 【Tailwind 技巧 - group hover】
 * group 和 group-hover 是 Tailwind 的"组"功能：
 *   - 父元素加 group 类名
 *   - 子元素用 group-hover:xxx 响应父元素的 hover 状态
 * 例如：鼠标悬停在卡片上时，标题颜色变为 primary（group-hover:text-primary）
 *
 * 【CSS 技巧 - line-clamp-2】
 * line-clamp-2 限制文本显示 2 行，超出部分用省略号截断。
 * 这是 CSS 原生属性 -webkit-line-clamp 的 Tailwind 封装。
 * =============================================================================
 */
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';

import { paths } from '@/config/paths';
import { type Post } from '@/types/api';
import { formatDate, formatReadingTime } from '@/utils/format';

import { TagChip } from './tag-chip';

type PostCardProps = {
	post: Post;
	index?: number; // 列表中的索引，用于交错动画的延迟计算
};

export function PostCard({ post, index = 0 }: PostCardProps) {
	const navigate = useNavigate();

	return (
		<motion.article
			// Framer Motion 动画配置
			initial={{ opacity: 0, y: 20 }} // 初始：透明 + 下移 20px
			animate={{ opacity: 1, y: 0 }} // 目标：完全可见 + 原位
			transition={{ duration: 0.3, delay: index * 0.05 }} // 交错延迟
			// 编程式导航：点击卡片跳转到文章详情
			onClick={() => navigate(paths.post.getHref(post.slug))}
			// group：启用 Tailwind 的组 hover 功能
			// hover:-translate-y-0.5：悬停时微微上浮（2px）
			className="group cursor-pointer rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
			role="article"
			aria-label={post.title}
		>
			{/* 封面图（如果有） */}
			{post.coverImage && (
				<div className="mb-4 overflow-hidden rounded-lg">
					<img
						src={post.coverImage}
						alt={post.title}
						// group-hover:scale-105：父元素悬停时图片放大 5%
						className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
						// loading="lazy"：延迟加载（浏览器原生属性，图片进入视口才加载）
						loading="lazy"
					/>
				</div>
			)}

			{/* 标签列表 */}
			<div className="mb-3 flex flex-wrap gap-1.5">
				{post.tags.map((tag) => (
					<TagChip key={tag} tag={tag} />
				))}
			</div>

			{/* 标题 - 悬停时颜色变化（group-hover） */}
			<h2 className="mb-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
				{post.title}
			</h2>

			{/* 摘要 - line-clamp-2 限制 2 行 */}
			<p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
				{post.excerpt}
			</p>

			{/* 元信息：发布日期 + 阅读时间 */}
			<div className="flex items-center gap-4 text-xs text-muted-foreground">
				<span className="flex items-center gap-1">
					<Calendar className="size-3" />
					{formatDate(post.publishedAt)}
				</span>
				<span className="flex items-center gap-1">
					<Clock className="size-3" />
					{formatReadingTime(post.readingTime)}
				</span>
			</div>
		</motion.article>
	);
}
