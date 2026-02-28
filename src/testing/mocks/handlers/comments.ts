/**
 * =============================================================================
 * 📖 MSW 评论 API Handler (Comments Mock API Handlers)
 * =============================================================================
 *
 * 展示了 MSW 处理 CRUD 操作的完整模式：
 *   - GET：获取评论列表（查询）
 *   - POST：创建评论（新增）
 *   - DELETE：删除评论（删除）
 *
 * 【知识点 - HTTP 状态码的正确使用】
 * - 200 OK：成功获取/修改资源（默认状态码）
 * - 201 Created：成功创建新资源
 * - 400 Bad Request：请求参数错误
 * - 404 Not Found：资源不存在
 * - 500 Internal Server Error：服务器内部错误
 *
 * 在 RESTful API 设计中，正确使用状态码让客户端可以
 * 统一处理不同的错误场景。
 * =============================================================================
 */
import { HttpResponse, http } from 'msw';
import { nanoid } from 'nanoid';

import { db, persistDb } from '../db';

export const commentsHandlers = [
	/**
	 * 获取评论列表
	 * GET /api/comments?postId=xxx
	 *
	 * 按创建时间正序排列（旧评论在前，新评论在后）
	 */
	http.get('/api/comments', ({ request }) => {
		const url = new URL(request.url);
		const postId = url.searchParams.get('postId');

		const comments = postId
			? db.comment
					.getAll()
					.filter((c) => c.postId === postId)
					.sort(
						(a, b) =>
							new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
					)
			: [];

		return HttpResponse.json({ data: comments });
	}),

	/**
	 * 创建评论
	 * POST /api/comments
	 *
	 * 【MSW v2 - 读取请求体】
	 * request.json() 返回 Promise<any>，需要用 await 或 as 断言类型。
	 * 这里用 as 类型断言告诉 TS 请求体的结构。
	 */
	http.post('/api/comments', async ({ request }) => {
		const body = (await request.json()) as {
			postId: string;
			authorName: string;
			content: string;
		};

		// 参数校验
		if (!body.postId || !body.authorName || !body.content) {
			return HttpResponse.json({ message: '缺少必要字段' }, { status: 400 });
		}

		// 创建评论并存入内存数据库
		const comment = db.comment.create({
			id: nanoid(),
			postId: body.postId,
			authorName: body.authorName.trim(),
			content: body.content.trim(),
			createdAt: new Date().toISOString(),
		});

		// 持久化到 localStorage（刷新后数据不丢失）
		await persistDb('comment');

		// 201 Created：表示资源创建成功
		return HttpResponse.json(comment, { status: 201 });
	}),

	/**
	 * 删除评论
	 * DELETE /api/comments/:id
	 */
	http.delete('/api/comments/:id', ({ params }) => {
		const comment = db.comment.findFirst({
			where: { id: { equals: params.id as string } },
		});

		if (!comment) {
			return HttpResponse.json({ message: '评论不存在' }, { status: 404 });
		}

		// 从内存数据库中删除
		db.comment.delete({ where: { id: { equals: params.id as string } } });

		return HttpResponse.json({ success: true });
	}),
];
