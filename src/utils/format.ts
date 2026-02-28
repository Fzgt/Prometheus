/**
 * =============================================================================
 * 📖 日期和时间格式化工具 (Date & Time Formatting Utilities)
 * =============================================================================
 *
 * 【知识点 - dayjs vs Date vs Intl】
 * JavaScript 原生 Date API 功能有限且 API 设计不直观。
 * dayjs 是 moment.js 的轻量替代品（只有 2KB gzip），提供：
 *   - 链式 API：dayjs(date).format('YYYY-MM-DD')
 *   - 插件系统：按需加载功能（如相对时间）
 *   - 多语言支持：内置 i18n
 *   - 不可变性：每次操作返回新对象（moment.js 是可变的）
 *
 * 【为什么不用原生 Intl.DateTimeFormat？】
 * Intl 原生 API 也能格式化日期，但：
 *   - 不支持 "3天前" 这样的相对时间（Intl.RelativeTimeFormat 需要手动计算差值）
 *   - API 较为繁琐
 *   - dayjs 更符合前端社区的使用习惯
 *
 * 【插件加载模式】
 * dayjs.extend(relativeTime) → 为 dayjs 实例添加 .fromNow() 方法
 * dayjs.locale('zh-cn') → 设置全局语言为中文
 * 这种插件模式让 dayjs 核心保持极小，只按需加载功能。
 * =============================================================================
 */
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn'; // 中文语言包
import relativeTime from 'dayjs/plugin/relativeTime'; // 相对时间插件

// 注册插件：添加 .fromNow()、.from()、.to() 等方法
dayjs.extend(relativeTime);
// 设置全局语言为中文（"3 days ago" → "3天前"）
dayjs.locale('zh-cn');

/**
 * 格式化日期为中文格式
 *
 * 【TS 技巧 - 联合类型参数 string | Date】
 * 函数同时接受 ISO 字符串和 Date 对象，提高了使用灵活性。
 * dayjs() 能自动处理这两种格式。
 *
 * @example
 * formatDate('2024-03-15T00:00:00.000Z') → '2024年03月15日'
 * formatDate(new Date()) → '2026年02月28日'
 */
export const formatDate = (date: string | Date): string => {
	return dayjs(date).format('YYYY年MM月DD日');
};

/**
 * 格式化为相对时间
 *
 * .fromNow() 是 relativeTime 插件提供的方法，
 * 根据当前时间自动计算时间差并格式化。
 *
 * @example
 * formatRelativeDate('2024-03-15') → '2年前'
 * formatRelativeDate(new Date(Date.now() - 3600000)) → '1小时前'
 */
export const formatRelativeDate = (date: string | Date): string => {
	return dayjs(date).fromNow();
};

/**
 * 格式化阅读时间
 *
 * Math.ceil() 向上取整：1.2 分钟 → 2 分钟
 * 不足 1 分钟的特殊处理，给用户更好的体验。
 *
 * @example
 * formatReadingTime(0.5) → '不足 1 分钟阅读'
 * formatReadingTime(5.3) → '6 分钟阅读'
 */
export const formatReadingTime = (minutes: number): string => {
	if (minutes < 1) return '不足 1 分钟阅读';
	return `${Math.ceil(minutes)} 分钟阅读`;
};
