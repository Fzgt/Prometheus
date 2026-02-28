/**
 * =============================================================================
 * 📖 API 数据类型定义 (API Type Definitions)
 * =============================================================================
 *
 * 【TS 实战 - 前端类型建模】
 * 这个文件定义了与后端 API 交互的所有数据类型。
 * 在真实项目中，这些类型应该与后端 API 文档（Swagger/OpenAPI）保持一致。
 *
 * 【type vs interface 的选择】
 * 这里全部使用 type 而非 interface，原因：
 *   - 这些类型是"数据传输对象"（DTO），不需要继承
 *   - type 支持联合类型、交叉类型等高级特性
 *   - 在 React 生态中，type 是主流选择
 *
 * 【最佳实践 - 类型的组织方式】
 * types/ 目录存放全局共享的类型。
 * 如果类型只在一个 feature 内使用，应该定义在 feature 内部，
 * 而不是放到全局 types/ 中。这遵循"就近原则"。
 * =============================================================================
 */

/** 作者信息 */
export type Author = {
	name: string;
	avatar: string; // 头像 URL
	bio: string; // 个人简介
};

/**
 * 文章类型
 *
 * 【TS 技巧 - 可选属性 vs 必选属性】
 * coverImage?: string → 可选属性，类型是 string | undefined
 * 这意味着文章可以没有封面图。
 * 问号 ? 让这个属性在创建对象时可以不传。
 */
export type Post = {
	id: string; // 唯一标识（通常由后端生成）
	slug: string; // URL 友好的标识（如 'react-hooks-deep-dive'）
	title: string;
	excerpt: string; // 文章摘要（用于列表展示）
	content: string; // Markdown 格式的文章正文
	coverImage?: string; // 封面图 URL（可选）
	tags: string[]; // 标签数组
	readingTime: number; // 预估阅读时间（分钟）
	publishedAt: string; // ISO 8601 日期字符串（如 '2024-03-15T00:00:00.000Z'）
	updatedAt: string;
	author: Author; // 嵌套对象类型
};

/** 评论类型 */
export type Comment = {
	id: string;
	postId: string; // 关联的文章 ID（外键）
	authorName: string;
	content: string;
	createdAt: string;
};

/**
 * 标签类型（带文章数量）
 *
 * 这不是简单的字符串，而是带有统计信息的对象。
 * 用于标签云（Tag Cloud）展示，count 可以用来控制标签大小。
 */
export type Tag = {
	name: string;
	count: number; // 该标签下的文章数量
};

/**
 * 分页元信息
 *
 * 后端分页 API 的标准返回格式。
 * 前端用这些信息决定：
 *   - 当前是第几页
 *   - 总共有多少页
 *   - 是否有下一页（page < totalPages）
 */
export type Meta = {
	page: number;
	total: number; // 总记录数
	totalPages: number; // 总页数
};

/**
 * 【API 响应类型 - 统一格式】
 * 后端 API 的响应格式约定：
 *   - 列表接口返回 { data: T[], meta: Meta }
 *   - 详情接口直接返回 T
 *
 * 这种 { data, meta } 的格式是 REST API 的常见约定，
 * 让客户端可以统一处理分页逻辑。
 */
export type PostsResponse = {
	data: Post[];
	meta: Meta;
};

export type CommentsResponse = {
	data: Comment[];
};

export type TagsResponse = {
	data: Tag[];
};
