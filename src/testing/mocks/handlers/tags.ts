/**
 * =============================================================================
 * 📖 MSW 标签 API Handler (Tags Mock API Handler)
 * =============================================================================
 *
 * 标签不是独立存储的——它们从文章的 tags 字段中聚合而来。
 * 这个 handler 遍历所有文章，统计每个标签出现的次数，
 * 然后按出现次数倒序排列返回。
 *
 * 这模拟了真实后端中 "SELECT tag, COUNT(*) FROM ... GROUP BY tag" 的逻辑。
 * =============================================================================
 */
import { HttpResponse, http } from 'msw';

import { db } from '../db';

export const tagsHandlers = [
	http.get('/api/tags', () => {
		const allPosts = db.post.getAll();

		/**
		 * 【统计标签出现次数】
		 * Record<string, number> 是 TS 内置工具类型：
		 * 键是 string，值是 number。用于创建动态的计数器对象。
		 *
		 * 算法：遍历所有文章 → 遍历每篇文章的标签 → 累加计数
		 */
		const tagCounts: Record<string, number> = {};

		allPosts.forEach((post) => {
			(post.tags as string[]).forEach((tag) => {
				tagCounts[tag] = (tagCounts[tag] || 0) + 1;
			});
		});

		// 将对象转为数组并按数量倒序排列
		const tags = Object.entries(tagCounts)
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count);

		return HttpResponse.json({ data: tags });
	}),
];
