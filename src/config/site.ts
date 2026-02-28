/**
 * =============================================================================
 * 📖 站点配置 (Site Configuration)
 * =============================================================================
 *
 * 【设计模式 - 配置即数据】
 * 将站点元信息集中到一个配置文件中，而不是在组件中硬编码。
 * 这些信息被多处使用：Header（站名）、Footer（作者名）、SEO（描述）等。
 *
 * 【TS 技巧 - as const 的深层效果】
 * as const 让所有属性递归变为 readonly + 字面量类型：
 *   - siteConfig.name 的类型是 'Prometheus'（不是 string）
 *   - siteConfig.postsPerPage 的类型是 6（不是 number）
 * 虽然在这里用处不大，但养成习惯对于需要精确类型推断的场景很有帮助。
 *
 * 【实际项目建议】
 * 在真实项目中，这些配置可能来自：
 *   - CMS（如 Contentful、Strapi）
 *   - 环境变量
 *   - 服务端 API
 * 但对于静态博客，直接写在代码中是最简单的方案。
 * =============================================================================
 */
export const siteConfig = {
	name: 'Prometheus',
	title: 'React Blog - 探索现代前端技术',
	description:
		'一个专注于 React、TypeScript 和现代前端架构的技术博客，分享最佳实践与深度思考。',
	author: {
		name: 'Your Name',
		avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
		bio: '前端工程师，专注于 React 生态与工程化实践。热爱开源，享受用代码解决复杂问题的过程。',
		github: 'https://github.com/yourusername',
		twitter: 'https://twitter.com/yourusername',
	},
	url: 'http://localhost:3000',
	postsPerPage: 6,
	socialLinks: {
		github: 'https://github.com/yourusername',
		twitter: 'https://twitter.com/yourusername',
	},
} as const;
