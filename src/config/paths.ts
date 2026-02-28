/**
 * =============================================================================
 * 📖 路由路径常量 (Route Path Constants)
 * =============================================================================
 *
 * 【设计模式 - 集中管理路由路径】
 * 将所有路由路径定义在一个地方，而不是在代码中硬编码 '/posts/xxx'。
 * 好处：
 *   1. 修改路径只需改一处（单一数据源 Single Source of Truth）
 *   2. getHref 函数确保参数拼接的正确性（如 URL 编码）
 *   3. TypeScript 类型检查：getHref('react') 有类型提示
 *
 * 【TS 技巧 - as const（常量断言）】
 * as const 将对象的所有属性变为 readonly（只读）并收窄类型：
 *   - 没有 as const：path 的类型是 string
 *   - 有 as const：path 的类型是 '/'（字面量类型）
 * 这在需要精确类型匹配的场景（如路由类型检查）非常有用。
 *
 * 【面试考点】
 * Q: "你的项目中路由路径是怎么管理的？"
 * A: "集中定义在 paths.ts，每个路由有 path（用于路由定义）和 getHref（用于导航），
 *     避免硬编码字符串，修改一处全局生效。"
 * =============================================================================
 */
export const paths = {
	home: {
		path: '/',
		getHref: () => '/',
	},
	post: {
		path: '/posts/:slug',
		// getHref 接受 slug 参数，返回完整路径
		getHref: (slug: string) => `/posts/${slug}`,
	},
	tag: {
		path: '/tags/:tag',
		// encodeURIComponent 处理特殊字符（如中文标签 "最佳实践" → "%E6%..."）
		// 确保 URL 安全，浏览器地址栏能正确显示
		getHref: (tag: string) => `/tags/${encodeURIComponent(tag)}`,
	},
	about: {
		path: '/about',
		getHref: () => '/about',
	},
} as const;
