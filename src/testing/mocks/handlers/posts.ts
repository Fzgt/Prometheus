import { HttpResponse, http } from 'msw';

import { db } from '../db';

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
		author: {
			name: post.authorName,
			avatar: post.authorAvatar,
			bio: post.authorBio,
		},
	};
}

export const postsHandlers = [
	http.get('/api/posts', ({ request }) => {
		const url = new URL(request.url);
		const page = Number(url.searchParams.get('page')) || 1;
		const tag = url.searchParams.get('tag') || undefined;
		const pageSize = 6;

		const allPosts = db.post
			.getAll()
			.sort(
				(a, b) =>
					new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
			);

		const filteredPosts = tag
			? allPosts.filter((p) => (p.tags as string[]).includes(tag))
			: allPosts;

		const start = (page - 1) * pageSize;
		const paginatedPosts = filteredPosts.slice(start, start + pageSize);

		return HttpResponse.json({
			data: paginatedPosts.map(sanitizePost),
			meta: {
				page,
				total: filteredPosts.length,
				totalPages: Math.ceil(filteredPosts.length / pageSize),
			},
		});
	}),

	http.get('/api/posts/search', ({ request }) => {
		const url = new URL(request.url);
		const q = url.searchParams.get('q') || '';

		const allPosts = db.post.getAll();
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
