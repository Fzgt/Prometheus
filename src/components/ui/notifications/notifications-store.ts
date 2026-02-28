/**
 * =============================================================================
 * 📖 通知系统 Store (Notifications Store with Zustand)
 * =============================================================================
 *
 * 【知识点 - Zustand 全局状态管理】
 * 这是一个经典的 Zustand store 示例，展示了：
 *   1. 如何定义 store 类型
 *   2. 如何用 set 更新状态（不可变更新）
 *   3. 如何在 React 组件外使用 store（如 Axios 拦截器）
 *
 * 【为什么用 Zustand 而非 Context？】
 * 通知是一个需要"在任何地方触发"的全局功能：
 *   - API 拦截器中触发（非 React 组件）
 *   - 表单提交成功时触发
 *   - 定时任务中触发
 *
 * Context 需要在 React 组件树内使用 useContext()。
 * Zustand 可以通过 useNotifications.getState() 在任何地方使用！
 *
 * 【Zustand 的核心 API - set()】
 * set() 接受一个函数，参数是当前状态，返回需要更新的部分状态。
 * Zustand 会自动做浅合并（类似 Object.assign）。
 * 注意：必须返回新的数组/对象引用，不要直接修改 state！
 *   ✅ [...state.notifications, newItem]  — 创建新数组
 *   ❌ state.notifications.push(newItem)  — 直接修改原数组
 *
 * 【nanoid - 生成唯一 ID】
 * nanoid 比 uuid 更小（130 bytes），速度更快，
 * 且默认生成的 ID 更短（21 字符 vs uuid 的 36 字符）。
 * 用于为每条通知生成唯一标识，方便后续删除。
 * =============================================================================
 */
import { nanoid } from 'nanoid';
import { create } from 'zustand';

/** 单条通知的数据结构 */
export type Notification = {
	id: string;
	type: 'info' | 'warning' | 'success' | 'error';
	title: string;
	message?: string; // 可选的详细信息
};

/**
 * Store 类型定义
 *
 * 【TS 技巧 - Omit<Notification, 'id'>】
 * addNotification 的参数不需要传 id（由 store 自动生成），
 * Omit 从 Notification 类型中去掉 'id' 属性。
 * 这是 TypeScript 工具类型的典型用法。
 */
type NotificationsStore = {
	notifications: Notification[];
	addNotification: (notification: Omit<Notification, 'id'>) => void;
	dismissNotification: (id: string) => void;
};

/**
 * 创建 Zustand Store
 *
 * create<T>((set, get) => ({...})) 的泛型 T 定义了 store 的完整类型。
 * set：更新状态的函数
 * get：读取当前状态的函数（这里没用到）
 *
 * 【在 React 外使用】
 * 在 api-client.ts 的 Axios 拦截器中：
 *   useNotifications.getState().addNotification({ type: 'error', title: '...' });
 * getState() 直接返回最新的 store 状态，不需要在 React 组件内调用。
 */
export const useNotifications = create<NotificationsStore>((set) => ({
	notifications: [],

	addNotification: (notification) =>
		set((state) => ({
			// 不可变更新：展开旧数组 + 添加新通知
			notifications: [
				...state.notifications,
				{ id: nanoid(), ...notification }, // 自动生成 id
			],
		})),

	dismissNotification: (id) =>
		set((state) => ({
			// 用 filter 创建新数组，排除指定 id 的通知
			notifications: state.notifications.filter((n) => n.id !== id),
		})),
}));
