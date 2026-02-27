import { randFullName, randParagraph, randText, randUrl } from '@ngneat/falso';
import { nanoid } from 'nanoid';

import type { Comment, Post } from '@/types/api';

export const createPost = (overrides: Partial<Post> = {}): Post => ({
	id: nanoid(),
	slug: `test-post-${nanoid(6)}`,
	title: randText({ charCount: 40 }),
	excerpt: randParagraph(),
	content: `## 测试内容\n\n${randParagraph()}\n\n\`\`\`typescript\nconsole.log('hello');\n\`\`\``,
	coverImage: randUrl(),
	tags: ['React', 'TypeScript'],
	readingTime: 5,
	publishedAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	author: {
		name: randFullName(),
		avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
		bio: randParagraph(),
	},
	...overrides,
});

export const createComment = (overrides: Partial<Comment> = {}): Comment => ({
	id: nanoid(),
	postId: nanoid(),
	authorName: randFullName(),
	content: randParagraph(),
	createdAt: new Date().toISOString(),
	...overrides,
});
