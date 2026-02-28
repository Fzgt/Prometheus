/**
 * =============================================================================
 * 📖 文章目录组件 (Table of Contents)
 * =============================================================================
 *
 * 在文章详情页右侧显示目录导航，高亮当前阅读位置。
 *
 * 【核心技术 - IntersectionObserver】
 * IntersectionObserver 是浏览器原生 API，用于检测元素是否进入视口。
 * 相比 scroll 事件监听的优势：
 * 1. 性能更好（浏览器内部优化，不在主线程频繁触发）
 * 2. API 更直观（entry.isIntersecting 直接告诉你是否可见）
 * 3. 支持配置 rootMargin（扩展/缩小检测区域）
 *
 * 【rootMargin 的工作原理】
 * rootMargin: '-80px 0px -70% 0px'
 * 格式：上 右 下 左（类似 CSS margin）
 *
 * -80px（上）→ 视口顶部缩进 80px（排除 sticky header 区域）
 * -70%（下）→ 视口底部缩进 70%
 *
 * 效果：只有标题进入视口顶部 30% 区域时才算"可见"。
 * 这确保了"当前阅读的标题"是最靠近页面顶部的那个，
 * 而不是页面底部偶然露出的下一个标题。
 *
 * 【平滑滚动的实现】
 * 点击目录项时，不用默认的锚点跳转（#id），
 * 而是手动计算位置并使用 window.scrollTo({ behavior: 'smooth' })。
 * 原因：需要减去 sticky header 的高度（offset = 80px）。
 *
 * 【缩进计算】
 * style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
 * h2 → 0px，h3 → 12px，h4 → 24px
 * 用 level - 2 是因为文章目录通常从 h2 开始（h1 是文章标题）。
 * =============================================================================
 */
import { useEffect, useState } from 'react';

import { extractHeadings } from '@/lib/markdown';
import { cn } from '@/utils/cn';

type TocItem = {
	id: string;   // 标题的 id 属性（由 rehype-slug 生成）
	text: string;  // 标题文本
	level: number; // 标题层级（2 = h2, 3 = h3）
};

type PostTocProps = {
	content: string;   // Markdown 原文（从中提取标题）
	className?: string;
};

export function PostToc({ content, className }: PostTocProps) {
	/** 当前高亮的标题 id */
	const [activeId, setActiveId] = useState<string>('');

	/**
	 * 【从 Markdown 提取标题列表】
	 * extractHeadings() 使用正则解析 Markdown 中的 ## / ### 标题
	 * （见 lib/markdown.ts）
	 *
	 * 注意：这里没有用 useMemo，因为 content 字符串在文章加载后不会变化。
	 * 如果 content 可能频繁变化，应该加 useMemo(() => extractHeadings(content), [content])
	 */
	const headings: TocItem[] = extractHeadings(content);

	/**
	 * 【IntersectionObserver 监听标题可见性】
	 *
	 * 流程：
	 * 1. 创建 observer，配置 rootMargin 和 threshold
	 * 2. 遍历所有标题 id，用 document.getElementById 找到 DOM 元素
	 * 3. observer.observe(el) 开始监听每个标题
	 * 4. 当标题进入观察区域时，回调中更新 activeId
	 * 5. 组件卸载时 observer.disconnect() 停止观察
	 *
	 * 【threshold: 0 的含义】
	 * 0 = 元素只要有 1px 进入观察区域就触发
	 * 1 = 元素完全进入观察区域才触发
	 * 0.5 = 元素 50% 进入时触发
	 */
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				});
			},
			{
				rootMargin: '-80px 0px -70% 0px',
				threshold: 0,
			},
		);

		// 观察所有标题 DOM 元素
		headings.forEach(({ id }) => {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		});

		// 清理：停止观察所有元素
		return () => observer.disconnect();
	}, [headings]);

	// 没有标题则不渲染目录
	if (headings.length === 0) return null;

	return (
		<nav className={cn('text-sm', className)} aria-label="文章目录">
			<p className="mb-3 font-semibold text-foreground">目录</p>
			<ul className="space-y-1.5">
				{headings.map((heading) => (
					<li
						key={heading.id}
						/**
						 * 【动态缩进】
						 * h2 (level=2) → paddingLeft: 0px
						 * h3 (level=3) → paddingLeft: 12px
						 * h4 (level=4) → paddingLeft: 24px
						 *
						 * 用 inline style 而非 Tailwind class，
						 * 因为缩进值是动态计算的，Tailwind 的 JIT 无法处理动态值。
						 */
						style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}
					>
						<a
							href={`#${heading.id}`}
							className={cn(
								'block truncate py-0.5 text-muted-foreground transition-colors hover:text-foreground',
								// 当前活跃标题高亮为主色调
								activeId === heading.id && 'font-medium text-primary',
							)}
							onClick={(e) => {
								/**
								 * 【自定义滚动行为】
								 * e.preventDefault() → 阻止默认锚点跳转
								 * 手动计算目标位置并平滑滚动
								 *
								 * getBoundingClientRect().top → 元素相对于视口的 y 坐标
								 * + window.scrollY → 加上当前滚动距离 = 元素在文档中的绝对位置
								 * - offset → 减去 sticky header 高度
								 */
								e.preventDefault();
								const el = document.getElementById(heading.id);
								if (el) {
									const offset = 80;
									const top =
										el.getBoundingClientRect().top + window.scrollY - offset;
									window.scrollTo({ top, behavior: 'smooth' });
								}
							}}
						>
							{heading.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
