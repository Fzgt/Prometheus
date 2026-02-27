import { HttpResponse, http } from 'msw';

import { db } from '../db';

export const tagsHandlers = [
	http.get('/api/tags', () => {
		const allPosts = db.post.getAll();
		const tagCounts: Record<string, number> = {};

		allPosts.forEach((post) => {
			(post.tags as string[]).forEach((tag) => {
				tagCounts[tag] = (tagCounts[tag] || 0) + 1;
			});
		});

		const tags = Object.entries(tagCounts)
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count);

		return HttpResponse.json({ data: tags });
	}),
];
