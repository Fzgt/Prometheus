/**
 * =============================================================================
 * 📖 测试环境初始化 (Test Setup)
 * =============================================================================
 *
 * 【知识点 - Vitest 测试生命周期】
 * 这个文件在 vite.config.ts 中通过 setupFiles 配置指定：
 *   test: { setupFiles: './src/testing/setup-tests.ts' }
 * 它在所有测试文件执行前运行，用于：
 *   1. 导入 jest-dom 扩展（toBeInTheDocument 等 matcher）
 *   2. 启动 MSW Node 服务器（拦截测试中的 HTTP 请求）
 *
 * 【@testing-library/jest-dom】
 * 为 Vitest 的 expect 添加 DOM 相关的断言：
 *   - toBeInTheDocument()：元素是否在 DOM 中
 *   - toHaveTextContent('xxx')：元素是否包含指定文本
 *   - toBeVisible()：元素是否可见
 *   - toBeDisabled()：表单元素是否被禁用
 *
 * 【MSW Node 服务器生命周期】
 * beforeAll：启动 MSW 服务器（拦截所有 HTTP 请求）
 *   onUnhandledRequest: 'error' → 没有匹配 handler 的请求会报错
 *   这确保测试中的每个 HTTP 请求都有对应的 mock
 *
 * afterEach：重置 handlers
 *   测试中可能用 server.use() 临时覆盖 handler，
 *   afterEach 恢复到默认 handlers，确保测试之间不互相影响
 *
 * afterAll：关闭服务器，释放资源
 * =============================================================================
 */
import '@testing-library/jest-dom';

import { server } from './mocks/server';

// 所有测试开始前：启动 MSW 服务器
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
// 每个测试结束后：重置临时添加的 handler
afterEach(() => server.resetHandlers());
// 所有测试结束后：关闭 MSW 服务器
afterAll(() => server.close());
