/**
 * =============================================================================
 * 📖 MSW 浏览器端 Worker (Browser MSW Worker)
 * =============================================================================
 *
 * 【知识点 - MSW 的两种运行模式】
 * 1. 浏览器模式（setupWorker）：
 *    - 注册 Service Worker 拦截浏览器中的 fetch/XMLHttpRequest 请求
 *    - 用于开发环境（npm run dev）
 *    - 需要 public/mockServiceWorker.js 文件（MSW CLI 生成）
 *
 * 2. Node 模式（setupServer）→ 见 server.ts：
 *    - 直接拦截 Node.js 的 HTTP 模块
 *    - 用于测试环境（vitest）
 *    - 不需要 Service Worker
 *
 * 两者共享同一套 handlers（handlers/index.ts），
 * 确保开发和测试环境的 mock 行为一致。
 * =============================================================================
 */
import { setupWorker } from 'msw/browser';

import { handlers } from './index';

// 创建浏览器端的 MSW worker 实例
export const worker = setupWorker(...handlers);
