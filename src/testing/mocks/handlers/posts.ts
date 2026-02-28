/**
 * =============================================================================
 * 📖 MSW 文章 API Handler (Posts Mock API Handlers)
 * =============================================================================
 *
 * 【知识点 - MSW (Mock Service Worker) Handler】
 * MSW handler 模拟后端 API 的行为。每个 handler 包含：
 *   1. HTTP 方法 + 路径匹配（http.get('/api/posts', ...)）
 *   2. 请求参数解析（URL params、query params、body）
 *   3. 数据库查询逻辑
 *   4. 响应构造（HttpResponse.json(data, { status })）
 *
 * 这些 handler 同时用于：
 *   - 开发环境：浏览器中运行的 Service Worker 拦截请求
 *   - 测试环境：Node 中的 HTTP 拦截（不需要真正的网络请求）
 *
 * 【MSW v2 的 API 变化（相比 v1）】
 * v1：rest.get('/api/posts', (req, res, ctx) => res(ctx.json(data)))
 * v2：http.get('/api/posts', ({ request }) => HttpResponse.json(data))
 * v2 更接近 Web 标准（Request/Response API）。
 *
 * 【sanitizePost 函数的作用】
 * @mswjs/data 存储的是扁平结构（authorName、authorAvatar），
 * 但 API 返回的是嵌套结构（author: { name, avatar }）。
 * sanitizePost 做这个转换——将数据库格式转为 API 响应格式。
 * =============================================================================
 */
import { HttpResponse, http } from 'msw';

import { db } from '../db';

/**
 * 将数据库格式的 post 转为 API 响应格式
 *
 * 【TS 技巧 - ReturnType + typeof】
 * ReturnType<typeof db.post.getAll> 获取 getAll() 的返回值类型（Post[]）
 * [number] 取数组元素类型（Post）
 * 这比手动定义类型更安全——数据库 model 变了，这里自动跟着变。
 */
function sanitizePost(post: ReturnType<typeof db.post.getAll>[number]) {
	return {
		id: post.id,
		slug: post.slug,
		title: post.title,
		excerpt: post.excerpt,
		content: post.content,
		coverImage: post.coverImage,
		tags: post.tags,
		readingTime: post.readingTime,
		publishedAt: post.publishedAt,
		updatedAt: post.updatedAt,
		// 将扁平字段重组为嵌套的 author 对象
		author: {
			name: post.authorName,
			avatar: post.authorAvatar,
			bio: post.authorBio,
		},
	};
}

export const postsHandlers = [
	/**
	 * 获取文章列表（支持分页和标签筛选）
	 *
	 * 请求示例：GET /api/posts?page=2&tag=React
	 *
	 * 【URL 参数解析】
	 * request.url 是完整的请求 URL
	 * new URL(request.url) 解析 URL
	 * url.searchParams.get('page') 获取查询参数
	 */
	http.get('/api/posts', ({ request }) => {
		const url = new URL(request.url);
		const page = Number(url.searchParams.get('page')) || 1;
		const tag = url.searchParams.get('tag') || undefined;
		const pageSize = 6;

		// 获取所有文章并按发布时间倒序排列（新文章在前）
		const allPosts = db.post
			.getAll()
			.sort(
				(a, b) =>
					new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
			);

		// 标签筛选
		const filteredPosts = tag
			? allPosts.filter((p) => (p.tags as string[]).includes(tag))
			: allPosts;

		// 分页切片
		const start = (page - 1) * pageSize;
		const paginatedPosts = filteredPosts.slice(start, start + pageSize);

		// 返回 { data, meta } 格式的响应
		return HttpResponse.json({
			data: paginatedPosts.map(sanitizePost),
			meta: {
				page,
				total: filteredPosts.length,
				totalPages: Math.ceil(filteredPosts.length / pageSize),
			},
		});
	}),

	/**
	 * 搜索文章
	 * 请求示例：GET /api/posts/search?q=React
	 */
	http.get('/api/posts/search', ({ request }) => {
		const url = new URL(request.url);
		const q = url.searchParams.get('q') || '';

		const allPosts = db.post.getAll();
		// 简单的标题/摘要包含搜索（真实项目应使用全文搜索引擎）
		const results = q
			? allPosts.filter(
					(p) =>
						p.title.toLowerCase().includes(q.toLowerCase()) ||
						p.excerpt.toLowerCase().includes(q.toLowerCase()),
				)
			: allPosts;

		return HttpResponse.json({
			data: results.slice(0, 5).map((p) => ({
				id: p.id,
				slug: p.slug,
				title: p.title,
				excerpt: p.excerpt,
				tags: p.tags,
				publishedAt: p.publishedAt,
			})),
		});
	}),

	/**
	 * 获取单篇文章
	 *
	 * 【路径参数 :slug】
	 * http.get('/api/posts/:slug', ...) 中的 :slug 是路径参数。
	 * 通过 params.slug 获取实际值。
	 * 例如：GET /api/posts/react-hooks → params.slug = 'react-hooks'
	 */
	http.get('/api/posts/:slug', ({ params }) => {
		const post = db.post.findFirst({
			where: { slug: { equals: params.slug as string } },
		});

		if (!post) {
			return HttpResponse.json({ message: '文章不存在' }, { status: 404 });
		}

		return HttpResponse.json(sanitizePost(post));
	}),
];
