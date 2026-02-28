/**
 * =============================================================================
 * 📖 根布局组件 (Root Layout)
 * =============================================================================
 *
 * 【架构模式 - Layout Route（布局路由）】
 * RootLayout 是所有页面共享的外壳：Header + Main + Footer。
 * 子路由通过 <Outlet /> 渲染在 <main> 标签内。
 *
 * 这种模式的好处：
 *   - 页面切换时 Header/Footer 不会重新渲染（性能优化）
 *   - 路由切换只更新 Outlet 内容（SPA 体验）
 *   - 通用逻辑（如 useScrollToTop）只需定义一次
 *
 * 【文件组织原则】
 * Header、Footer、GlobalLoadingIndicator 都定义在同一个文件中，
 * 因为它们只被 RootLayout 使用。如果某天它们变复杂了，再拆分为独立文件。
 * 这是"YAGNI"原则——不过度设计。
 * =============================================================================
 */
import { Github, Twitter } from 'lucide-react';
import * as React from 'react';
import { Link, Outlet, useNavigation } from 'react-router';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { siteConfig } from '@/config/site';
import { ThemeToggle } from '@/features/theme/components/theme-toggle';
import { useScrollToTop } from '@/hooks/use-scroll-to-top';
import { cn } from '@/utils/cn';

/**
 * 【Header 组件分析】
 *
 * 知识点：
 *   - sticky top-0：CSS 粘性定位，滚动时固定在顶部
 *   - backdrop-blur-sm：毛玻璃效果（CSS backdrop-filter）
 *   - bg-background/80：Tailwind 透明度语法，80 = 80% 不透明度
 *
 * 【React Router 的 <Link> vs <a>】
 *   - <Link to={...}>：客户端导航，不刷新页面，SPA 体验
 *   - <a href={...}>：传统导航，会刷新整个页面
 *   - 外部链接（GitHub、Twitter）用 <a>，站内导航用 <Link>
 *
 * 【Button 的 asChild 模式】
 * <Button asChild> 使用了 Radix UI 的 Slot 组件。
 * asChild 让 Button 不渲染自身的 <button> 标签，
 * 而是将样式和属性"注入"到子元素上。
 * 例如 <Button asChild><Link /></Button> 最终渲染为 <a> 标签带 Button 样式。
 * 这比 <Link className="btn-styles"> 更优雅，因为样式逻辑集中在 Button 组件内。
 */
function Header() {
	const navLinks = [
		{ label: 'Articles', href: paths.home.getHref() },
		{ label: 'About', href: paths.about.getHref() },
	];

	return (
		<header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-sm">
			<div className="container flex h-14 max-w-4xl items-center justify-between">
				<div className="flex items-center gap-6">
					{/* 网站 Logo/名称 */}
					<Link
						to={paths.home.getHref()}
						className="flex items-center gap-2 font-bold text-foreground no-underline hover:no-underline"
					>
						{/* <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              B
            </span> */}
						{/**
						 * hidden sm:inline → 响应式设计：
						 *   - 移动端（< 640px）：隐藏文字
						 *   - 桌面端（>= 640px）：显示文字
						 * 这是 Tailwind 的 "mobile-first" 设计理念
						 */}
						<span className="hidden sm:inline">{siteConfig.name}</span>
					</Link>
					{/**
					 * 【导航链接的 map 渲染模式】
					 * 将导航配置抽成数组 + .map() 渲染，而非手写多个 <Link>。
					 * 好处：方便增删改导航项，数据和 UI 分离。
					 * 注意：map 时必须给每个元素 key，且 key 要稳定唯一。
					 */}
					<nav className="flex items-center gap-1">
						{navLinks.map((link) => (
							<Button key={link.href} variant="ghost" size="default" asChild>
								<Link
									to={link.href}
									className="no-underline hover:no-underline font-bold"
								>
									{link.label}
								</Link>
							</Button>
						))}
					</nav>
				</div>
				<div className="flex items-center gap-1">
					{/**
					 * 【无障碍性（Accessibility / a11y）】
					 * - aria-label="GitHub"：为图标按钮提供屏幕阅读器文本
					 * - rel="noopener noreferrer"：安全最佳实践
					 *   - noopener：防止新窗口通过 window.opener 操作原窗口
					 *   - noreferrer：不发送 Referer header
					 * - target="_blank"：在新标签页打开外部链接
					 */}
					<Button variant="ghost" size="icon" asChild>
						<a
							href={siteConfig.socialLinks.github}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="GitHub"
						>
							<Github className="size-4" />
						</a>
					</Button>
					<Button variant="ghost" size="icon" asChild>
						<a
							href={siteConfig.socialLinks.twitter}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Twitter"
						>
							<Twitter className="size-4" />
						</a>
					</Button>
					{/* 主题切换按钮（来自 features/theme 模块） */}
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}

function Footer() {
	return (
		<footer className="border-t border-border py-8">
			<div className="container max-w-4xl text-center text-sm text-muted-foreground">
				{/**
				 * 【JS 技巧 - 动态年份】
				 * new Date().getFullYear() 自动获取当前年份，
				 * 不用每年手动更新 copyright 年份。
				 */}
				<p>
					© {new Date().getFullYear()} {siteConfig.author.name} · Built with
					React + TypeScript + Vite
				</p>
			</div>
		</footer>
	);
}

/**
 * 全局路由加载指示器
 *
 * 【React Router 7 - useNavigation】
 * useNavigation() 返回当前的导航状态：
 *   - 'idle'：没有正在进行的导航
 *   - 'loading'：正在加载新路由的 loader 数据
 *   - 'submitting'：正在提交 form action
 *
 * 这个细长的进度条出现在页面最顶部（类似 NProgress / nprogress 库的效果），
 * 在路由切换时给用户视觉反馈。
 *
 * 注意：如果没有使用 React Router 的 loader，这个导航状态不会变为 'loading'。
 * 当前项目用 React.lazy 做代码分割，Suspense 会接管 loading 状态。
 */
function GlobalLoadingIndicator() {
	const navigation = useNavigation();
	const isLoading = navigation.state === 'loading';

	return (
		<div
			className={cn(
				'fixed left-0 right-0 top-0 z-50 h-0.5 bg-primary transition-all duration-300',
				isLoading ? 'opacity-100' : 'opacity-0',
			)}
			style={{ width: isLoading ? '70%' : '100%' }}
		/>
	);
}

/**
 * 根布局组件
 *
 * 【React Router - Outlet 模式】
 * <Outlet /> 是 React Router 的"插槽"组件：
 *   - 父路由定义 layout（Header + Main + Footer）
 *   - 子路由内容自动渲染在 <Outlet /> 位置
 *   - 路由切换时只有 <Outlet /> 的内容变化，Header/Footer 保持不变
 *
 * 【嵌套 Suspense 的作用】
 * provider.tsx 已经有一个全局 Suspense，为什么这里还要一个？
 *   - 全局 Suspense：首次加载应用时的全屏 loading
 *   - 此处 Suspense：路由切换时的局部 loading（保留 Header/Footer）
 * 这就是"Suspense 边界"的层级设计——越靠近数据源，用户体验越好。
 */
export function RootLayout() {
	// 路由切换时自动滚动到页面顶部
	useScrollToTop();

	return (
		<div className="min-h-screen bg-background font-sans antialiased">
			<GlobalLoadingIndicator />
			<Header />
			<main className="flex-1">
				{/**
				 * 路由切换时的局部 loading：
				 * 用户切换页面时，只有 Outlet 区域显示加载动画，
				 * Header 和 Footer 保持可见，体验更好。
				 */}
				<React.Suspense
					fallback={
						<div className="flex min-h-[60vh] items-center justify-center">
							<Spinner size="xl" />
						</div>
					}
				>
					<Outlet />
				</React.Suspense>
			</main>
			<Footer />
		</div>
	);
}
