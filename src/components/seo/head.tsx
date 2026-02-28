/**
 * =============================================================================
 * 📖 SEO 头部标签组件 (SEO Head Component)
 * =============================================================================
 *
 * 【知识点 - react-helmet-async 与 SEO】
 * SPA 的 HTML 是空壳（<div id="root"></div>），搜索引擎看不到动态内容。
 * react-helmet-async 让你在 React 组件中声明 <head> 标签，
 * 它会自动更新 document.head。
 *
 * 对于 SEO，最重要的 meta 标签：
 *   1. <title> → 搜索结果的标题
 *   2. <meta name="description"> → 搜索结果的描述
 *   3. Open Graph（og:*）→ 社交媒体分享卡片（Facebook、LinkedIn）
 *   4. Twitter Card → Twitter 分享卡片
 *
 * 【React 模式 - 默认 Props 值】
 * description = siteConfig.description → 解构赋值中给默认值
 * 如果调用方不传 description，自动使用站点配置中的描述。
 * type = 'website' → 大多数页面是 website，文章详情页传 'article'
 *
 * 注意：纯客户端 SPA 的 SEO 效果有限，因为搜索引擎爬虫可能不执行 JS。
 * 真正的 SEO 需要 SSR（服务端渲染）或 SSG（静态站点生成）。
 * =============================================================================
 */
import { Helmet } from 'react-helmet-async';

import { siteConfig } from '@/config/site';

type HeadProps = {
	title?: string;
	description?: string;
	image?: string;
	type?: 'website' | 'article'; // OG 类型
};

export function Head({
	title,
	description = siteConfig.description,
	image,
	type = 'website',
}: HeadProps) {
	// 有 title 时拼接站名（如 "React Hooks | Prometheus"），
	// 没有 title 时使用站点配置中的完整标题
	const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title;

	return (
		<Helmet>
			<title>{fullTitle}</title>
			<meta name="description" content={description} />

			{/* Open Graph - 用于 Facebook、LinkedIn 等社交平台的分享卡片 */}
			<meta property="og:title" content={fullTitle} />
			<meta property="og:description" content={description} />
			<meta property="og:type" content={type} />
			<meta property="og:site_name" content={siteConfig.name} />
			{/* 条件渲染：只有传入 image 时才添加 og:image 标签 */}
			{image && <meta property="og:image" content={image} />}

			{/* Twitter Card - Twitter 专属的分享卡片 */}
			{/* summary_large_image：大图模式（比 summary 模式展示面积更大） */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={fullTitle} />
			<meta name="twitter:description" content={description} />
			{image && <meta name="twitter:image" content={image} />}
		</Helmet>
	);
}
