/**
 * =============================================================================
 * 📖 开关状态 Hook (Disclosure Hook)
 * =============================================================================
 *
 * 【知识点 - 自定义 Hook 的设计原则】
 * 1. 命名必须以 use 开头（React 的规则，否则 Hook 规则不生效）
 * 2. 封装可复用的状态逻辑，让组件更干净
 * 3. 返回值要"语义化"——isOpen/open/close 比 state/setState 更清晰
 *
 * 这个 Hook 封装了"开/关"状态的通用逻辑，适用于：
 *   - Modal（对话框）
 *   - Dropdown（下拉菜单）
 *   - Sidebar（侧边栏）
 *   - 任何"展开/收起"的 UI 交互
 *
 * 【为什么用 useCallback 包裹 open/close/toggle？】
 * useCallback 让函数的引用在组件重渲染时保持稳定。
 * 如果不用 useCallback，每次渲染都会创建新的函数，导致：
 *   - 传给子组件时触发不必要的重渲染（如果子组件用了 React.memo）
 *   - 作为 useEffect 依赖时导致无限循环
 *
 * 空依赖数组 [] 意味着函数永远不变，因为 setIsOpen 是稳定的（React 保证）。
 *
 * 【面试高频题】
 * Q: "useCallback 是不是应该到处用？"
 * A: "不是。只在两个场景用：
 *     1. 函数作为 props 传给 React.memo 包裹的子组件
 *     2. 函数作为 useEffect/useMemo 的依赖
 *     其他情况用了反而增加代码复杂度和内存开销。"
 * =============================================================================
 */
import { useCallback, useState } from 'react';

export function useDisclosure(initialState = false) {
	const [isOpen, setIsOpen] = useState(initialState);

	// useCallback 确保函数引用稳定
	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	// toggle 用函数式更新 (prev) => !prev，
	// 确保在快速连续调用时基于最新状态计算
	const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

	return { isOpen, open, close, toggle };
}
