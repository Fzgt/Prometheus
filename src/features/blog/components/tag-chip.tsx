/**
 * =============================================================================
 * 📖 标签芯片组件 (Tag Chip)
 * =============================================================================
 *
 * 可复用的标签显示组件，支持两种模式：
 * 1. 静态模式（clickable=false）→ 只显示标签文字（Badge 组件）
 * 2. 可点击模式（clickable=true）→ 点击跳转到标签页
 *
 * 【知识点 - 组件的两种渲染路径】
 * 通过 clickable prop 控制渲染不同的 JSX：
 * - false → 返回 <Badge>（纯展示）
 * - true → 返回 <button>（可交互）
 *
 * 这是一种常见的"多态组件"模式：
 * 同一个组件根据 props 决定渲染成不同的 DOM 结构。
 *
 * 另一种实现方式是 asChild 模式（如 Button 组件），
 * 但这里的两种形态差异较大，直接用条件渲染更清晰。
 *
 * 【知识点 - 默认参数值】
 * { isActive = false, clickable = false }
 * ES6 解构默认值：如果调用者不传这些 props，自动使用默认值。
 * 好处是调用者可以只写 <TagChip tag="React" />，不需要传所有 props。
 *
 * 【知识点 - useNavigate vs Link】
 * 这里用 useNavigate() + button onClick，而非 <Link to={...}>。
 * 原因：Button 和 Link 的语义不同：
 * - <a>（Link）→ 导航到新页面（右键可以"在新标签页打开"）
 * - <button> → 执行操作
 *
 * 这里标签芯片更接近"操作"语义（过滤文章），所以用 button。
 * 但如果在文章详情页中，标签点击是"导航到标签页"，语义上用 Link 更合适。
 * 实际项目中两种都可以接受。
 * =============================================================================
 */
import { useNavigate } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { paths } from '@/config/paths';
import { cn } from '@/utils/cn';

type TagChipProps = {
	tag: string;        // 标签名称
	count?: number;     // 文章数量（可选）
	isActive?: boolean; // 是否为选中状态
	clickable?: boolean; // 是否可点击
	className?: string;
};

export function TagChip({
	tag,
	count,
	isActive = false,
	clickable = false,
	className,
}: TagChipProps) {
	const navigate = useNavigate();

	// ── 静态模式：使用 Badge 组件 ────────────────────────
	if (!clickable) {
		return (
			<Badge variant={isActive ? 'default' : 'secondary'} className={className}>
				{tag}
				{/**
				 * count !== undefined → 只有传了 count 才显示
				 * 不能用 count && xxx，因为 count=0 时 0 是 falsy，
				 * 会导致数量为 0 时不显示（但我们可能想显示 "(0)"）
				 */}
				{count !== undefined && (
					<span className="ml-1 opacity-70">({count})</span>
				)}
			</Badge>
		);
	}

	// ── 可点击模式：使用 button 元素 ────────────────────
	return (
		<button
			onClick={() => navigate(paths.tag.getHref(tag))}
			className={cn(
				'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
				isActive
					? 'border-transparent bg-primary text-primary-foreground'
					: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
				className,
			)}
		>
			{tag}
			{count !== undefined && (
				<span className="ml-1 opacity-70">({count})</span>
			)}
		</button>
	);
}
