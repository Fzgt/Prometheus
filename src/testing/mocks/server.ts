/**
 * =============================================================================
 * 📖 MSW Node 端服务器 (Node MSW Server)
 * =============================================================================
 *
 * 用于 Vitest 测试环境。
 * setupServer 不需要 Service Worker，直接在 Node.js 层面拦截 HTTP 请求。
 * 在 setup-tests.ts 中：
 *   beforeAll(() => server.listen())  → 启动拦截
 *   afterEach(() => server.resetHandlers())  → 重置临时 handler
 *   afterAll(() => server.close())  → 停止拦截
 * =============================================================================
 */
import { setupServer } from 'msw/node';

import { handlers } from './index';

export const server = setupServer(...handlers);
