import { Github, Twitter } from 'lucide-react';
import * as React from 'react';
import { Link, Outlet, useNavigation } from 'react-router';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { siteConfig } from '@/config/site';
import { ThemeToggle } from '@/features/theme/components/theme-toggle';
import { useScrollToTop } from '@/hooks/use-scroll-to-top';

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
					<Link
						to={paths.home.getHref()}
						className="flex items-center gap-2 font-bold text-foreground no-underline hover:no-underline"
					>
						<span className="hidden sm:inline">{siteConfig.name}</span>
					</Link>
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
				<p>
				 	{/* * new Date().getFullYear() 自动获取当前年份，不用每年手动更新 copyright 年份。 */}
					© {new Date().getFullYear()} {siteConfig.author.name} · Built with
					React + TypeScript + Vite
				</p>
			</div>
		</footer>
	);
}


export function RootLayout() {
	// 路由切换时自动滚动到页面顶部
	useScrollToTop();

	return (
		<div className="min-h-screen bg-background font-sans antialiased">
			<Header />
			<main className="flex-1">
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
