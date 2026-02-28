/**
 * =============================================================================
 * 📖 关于页面 (About Page)
 * =============================================================================
 *
 * 展示作者介绍、博客说明和技术栈信息。
 *
 * 【知识点 - 模块级常量 vs 组件内常量】
 * techStack 数组定义在组件外部（模块级），而不是组件内部。
 * 原因：
 * 1. 这是静态数据，不依赖任何 props 或 state
 * 2. 放在组件外 → 只创建一次（模块加载时）
 * 3. 放在组件内 → 每次渲染都重新创建（虽然 JS 引擎会优化，但语义上不需要）
 *
 * 规则：纯静态数据放组件外，依赖 props/state 的数据放组件内。
 *
 * 【知识点 - Grid 响应式布局】
 * grid gap-4 sm:grid-cols-2 lg:grid-cols-3
 * → 默认 1 列（移动端）
 * → sm (640px+) → 2 列
 * → lg (1024px+) → 3 列
 *
 * 这是 Tailwind 响应式的核心模式：
 * 默认值是移动端样式，通过断点前缀逐步覆盖。
 * 这叫"Mobile First"设计理念。
 *
 * 【知识点 - 外部链接的安全属性】
 * target="_blank" → 在新标签页打开
 * rel="noopener noreferrer"：
 * - noopener → 新页面无法通过 window.opener 控制原页面（防钓鱼）
 * - noreferrer → 不发送 HTTP Referer 头（隐私保护）
 *
 * 【知识点 - prose 排版类】
 * prose prose-neutral max-w-none dark:prose-invert
 * 这里直接在 JSX 中使用 @tailwindcss/typography 的 prose 类，
 * 让 HTML 列表（<ul><li>）自动获得漂亮的排版样式。
 * 不需要手动为每个 <li> 添加 Tailwind class。
 * =============================================================================
 */
import { motion } from 'framer-motion';
import { Code2, Github, Heart, Twitter } from 'lucide-react';

import { ContentLayout } from '@/components/layouts/content-layout';
import { Head } from '@/components/seo/head';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

/**
 * 【技术栈数据 — 静态配置】
 * 按分类组织，方便在 UI 中用 grid 展示。
 * 每个 category 会成为一个卡片标题。
 */
const techStack = [
	{
		category: 'Frontend',
		items: ['React 18', 'TypeScript 5', 'Vite', 'React Router 7'],
	},
	{ category: 'Data', items: ['TanStack Query v5', 'Zustand', 'Axios', 'MSW'] },
	{
		category: 'UI',
		items: ['Tailwind CSS', 'Radix UI', 'Framer Motion', 'Lucide React'],
	},
	{ category: 'Testing', items: ['Vitest', 'Testing Library', 'Playwright'] },
	{
		category: 'Engineering',
		items: ['ESLint', 'Prettier', 'Husky', 'Storybook'],
	},
];

export function AboutPage() {
	return (
		<>
			<Head
				title="关于"
				description={`关于 ${siteConfig.author.name} 和这个博客`}
			/>
			<ContentLayout>
				{/**
				 * 【整页进入动画】
				 * 从下方 20px 淡入，持续 0.4 秒
				 * space-y-12 → 各 section 之间间距 3rem
				 */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="space-y-12"
				>
					{/* ── 作者介绍区 ─────────────────────────────── */}
					{/**
					 * 响应式布局：
					 * flex-col → 移动端上下排列（头像在上，文字在下）
					 * sm:flex-row → 平板+ 左右排列（头像在左，文字在右）
					 * sm:text-left → 平板+ 文字左对齐（移动端居中）
					 */}
					<section className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
						<img
							src={siteConfig.author.avatar}
							alt={siteConfig.author.name}
							className="size-24 rounded-full border-4 border-border object-cover"
						/>
						<div>
							<h1 className="text-3xl font-bold text-foreground">
								{siteConfig.author.name}
							</h1>
							<p className="mt-2 text-lg text-muted-foreground">
								{siteConfig.author.bio}
							</p>
							{/**
							 * 社交链接按钮
							 * justify-center → 移动端居中
							 * sm:justify-start → 平板+ 左对齐
							 * asChild → Button 样式应用到 <a> 上
							 */}
							<div className="mt-4 flex justify-center gap-2 sm:justify-start">
								<Button variant="outline" size="sm" asChild>
									<a
										href={siteConfig.author.github}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Github className="size-4" />
										GitHub
									</a>
								</Button>
								<Button variant="outline" size="sm" asChild>
									<a
										href={siteConfig.author.twitter}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Twitter className="size-4" />
										Twitter
									</a>
								</Button>
							</div>
						</div>
					</section>

					{/* ── 关于博客区 ─────────────────────────────── */}
					<section>
						<h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
							<Heart className="size-6 text-red-500" />
							关于这个博客
						</h2>
						{/**
						 * prose 类让原生 HTML 标签（p, ul, li）自动获得排版样式，
						 * 无需为每个元素单独添加 Tailwind class。
						 * dark:prose-invert → 深色模式自动反转颜色。
						 */}
						<div className="prose prose-neutral max-w-none dark:prose-invert">
							<p>
								这个博客是我系统学习和实践 React + TypeScript
								生态的产物。文章内容涵盖前端工程化、React 最佳实践、TypeScript
								深度用法等主题。
							</p>
							<p>
								项目本身就是一个学习案例——它完整实现了现代前端项目的工程化配置，包括：
							</p>
							<ul>
								<li>Feature-based 目录结构（参考 bulletproof-react）</li>
								<li>MSW + @mswjs/data 作为 Mock API 层</li>
								<li>TanStack Query v5 的 queryOptions 模式</li>
								<li>Zustand 管理客户端状态（主题 + 通知）</li>
								<li>Shiki 代码高亮 + react-markdown 文章渲染</li>
								<li>Framer Motion 页面过渡动画</li>
								<li>Vitest + Testing Library 测试配置</li>
							</ul>
						</div>
					</section>

					{/* ── 技术栈展示区 ───────────────────────────── */}
					<section>
						<h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
							<Code2 className="size-6 text-primary" />
							技术栈
						</h2>
						{/**
						 * 【Grid 响应式】
						 * grid → 网格布局
						 * gap-4 → 格子间距 1rem
						 * sm:grid-cols-2 → 640px+ 两列
						 * lg:grid-cols-3 → 1024px+ 三列
						 */}
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{techStack.map((group) => (
								<div
									key={group.category}
									className="rounded-lg border border-border bg-card p-4"
								>
									{/**
									 * uppercase tracking-wide → 大写 + 字间距
									 * 这是 category 标签的常见样式风格
									 */}
									<p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
										{group.category}
									</p>
									<ul className="space-y-1.5">
										{group.items.map((item) => (
											<li
												key={item}
												className="flex items-center gap-2 text-sm text-foreground"
											>
												{/* 小圆点作为列表标记 */}
												<span className="size-1.5 rounded-full bg-primary" />
												{item}
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</section>
				</motion.div>
			</ContentLayout>
		</>
	);
}
