/**
 * =============================================================================
 * 📖 Handler 聚合导出 (Handler Aggregation)
 * =============================================================================
 *
 * 将所有 API handler 聚合成一个数组导出。
 * browser.ts 和 server.ts 都从这里导入，确保 mock 行为一致。
 *
 * 【展开运算符 ... 合并数组】
 * [...postsHandlers, ...commentsHandlers, ...tagsHandlers]
 * 将三个数组拍平合并成一个。MSW 按顺序匹配 handler，
 * 第一个匹配的 handler 会处理请求。
 * =============================================================================
 */
import { commentsHandlers } from './handlers/comments';
import { postsHandlers } from './handlers/posts';
import { tagsHandlers } from './handlers/tags';

export const handlers = [
	...postsHandlers,
	...commentsHandlers,
	...tagsHandlers,
];
