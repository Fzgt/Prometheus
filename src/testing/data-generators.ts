/**
 * =============================================================================
 * 📖 测试数据生成器 (Test Data Generators / Factories)
 * =============================================================================
 *
 * 【知识点 - 工厂函数模式（Factory Pattern）】
 * 测试中经常需要创建测试数据。每次手写完整对象很繁琐且容易遗漏字段。
 * 工厂函数提供：
 *   1. 合理的默认值（每个字段都有值）
 *   2. 可选的覆盖（只传需要定制的字段）
 *   3. 随机数据（用 @ngneat/falso 库生成）
 *
 * 【@ngneat/falso - 随机数据生成库】
 * 类似 Faker.js，但更轻量。提供各种随机数据生成函数：
 *   - randFullName()：随机生成全名
 *   - randParagraph()：随机生成段落
 *   - randText()：随机生成文本
 *   - randUrl()：随机生成 URL
 *
 * 【TS 技巧 - Partial<T> + 展开运算符】
 * overrides: Partial<Post> = {}
 *   - Partial<Post>：所有属性变为可选
 *   - = {}：默认为空对象
 *
 * { ...默认值, ...overrides }
 *   → overrides 中有的字段覆盖默认值
 *   → overrides 中没有的字段使用默认值
 *
 * 使用示例：
 *   createPost()                            → 完全随机的文章
 *   createPost({ title: '测试文章' })       → 标题固定，其他随机
 *   createPost({ tags: ['React', 'TS'] })  → 标签固定，其他随机
 * =============================================================================
 */
import { randFullName, randParagraph, randText, randUrl } from '@ngneat/falso';
import { nanoid } from 'nanoid';

import type { Comment, Post } from '@/types/api';

/** 文章数据工厂 */
export const createPost = (overrides: Partial<Post> = {}): Post => ({
	id: nanoid(),
	slug: `test-post-${nanoid(6)}`, // 短 ID 做 slug 后缀
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
	...overrides, // 覆盖指定字段
});

/** 评论数据工厂 */
export const createComment = (overrides: Partial<Comment> = {}): Comment => ({
	id: nanoid(),
	postId: nanoid(),
	authorName: randFullName(),
	content: randParagraph(),
	createdAt: new Date().toISOString(),
	...overrides,
});
