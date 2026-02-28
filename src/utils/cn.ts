/**
 * =============================================================================
 * 📖 className 合并工具 (Class Name Merge Utility)
 * =============================================================================
 *
 * 【知识点 - clsx + tailwind-merge 的黄金组合】
 * 这是 Tailwind CSS 项目中最常见的工具函数。两个库各司其职：
 *
 * 1. clsx（或 classnames）：
 *    - 将多种格式的 className 合并成一个字符串
 *    - 支持：字符串、对象、数组、嵌套等
 *    - 例如：clsx('font-bold', { 'text-red': hasError }, isLarge && 'text-xl')
 *      → 'font-bold text-red text-xl'（如果条件为真）
 *
 * 2. tailwind-merge：
 *    - 智能合并 Tailwind 类名，解决冲突问题
 *    - 例如：twMerge('px-2 py-1', 'px-4')
 *      → 'py-1 px-4'（px-4 覆盖 px-2，而不是两个都保留）
 *    - 没有 twMerge，className 里会同时存在 px-2 和 px-4，
 *      CSS 优先级取决于样式表顺序，行为不可预测！
 *
 * 【为什么不只用 clsx？】
 * clsx 只负责"拼接"，不理解 Tailwind 的语义。
 * 'px-2 px-4' 对 clsx 来说两个都保留，但对 Tailwind 来说是冲突。
 * tailwind-merge 知道 px-2 和 px-4 是同一个 CSS 属性（padding-x），
 * 所以只保留后者。
 *
 * 【在组件中的典型用法】
 * function Card({ className, ...props }) {
 *   return <div className={cn('rounded-lg p-4 bg-card', className)} {...props} />;
 * }
 * // 使用时可以覆盖默认样式：
 * <Card className="p-8" /> → 最终 className 是 'rounded-lg bg-card p-8'
 *
 * 【面试考点】
 * Q: "你的 Tailwind 组件怎么支持自定义样式？"
 * A: "用 cn() 函数合并默认 className 和外部传入的 className，
 *     底层用 clsx 拼接 + tailwind-merge 处理冲突。"
 * =============================================================================
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 className 的工具函数
 *
 * 【TS 技巧 - rest 参数 + 展开类型】
 * (...inputs: ClassValue[]) 表示接受任意数量的参数，
 * 每个参数都是 ClassValue 类型（string | number | object | array | undefined）
 *
 * 调用方式灵活：
 *   cn('a', 'b')                    → 'a b'
 *   cn('a', isActive && 'b')        → 'a b' 或 'a'
 *   cn('px-2', { 'px-4': large })   → 'px-4'（large 为 true 时）
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
