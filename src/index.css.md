# index.css 注释文档

## Tailwind CSS 的三个层

- `@tailwind base` → 重置样式 + CSS 变量注入
- `@tailwind components` → 组件类（较少使用，因为用 React 组件代替）
- `@tailwind utilities` → 工具类（text-lg、flex、p-4 等）

这三个指令在构建时会被 Tailwind 替换为实际的 CSS 代码。

## CSS 变量 + HSL 颜色系统

这个项目使用 shadcn/ui 的颜色方案：
- 所有颜色定义为 CSS 变量（`--background`、`--primary` 等）
- 变量值只包含 HSL 的三个分量（色相 饱和度% 亮度%），不包含 `hsl()` 函数
- 在 `tailwind.config.cjs` 中用 `hsl(var(--primary))` 包裹

**为什么不直接用完整的 `hsl()` 值？**
- 因为 Tailwind 需要在 HSL 值后面添加透明度
- 例如 `bg-primary/80` → `hsl(221.2 83.2% 53.3% / 0.8)`
- 如果变量值包含 `hsl()`，就无法注入透明度

## 深色模式实现

- `:root` 定义浅色主题的变量值
- `.dark` 定义深色主题的变量值
- 当 `<html>` 有 `class="dark"` 时，`.dark` 的变量覆盖 `:root` 的变量
- 所有使用这些变量的颜色自动切换——无需修改任何组件代码！

## `@layer base`

将样式放入 base 层。base 层的样式优先级低于 components 和 utilities，所以 Tailwind 工具类可以覆盖这里定义的基础样式。

## CSS 变量颜色表

值的格式：`色相(°) 饱和度(%) 亮度(%)`

### 浅色主题（`:root`）

| 变量 | 值 | 说明 |
|---|---|---|
| `--background` | `0 0% 100%` | 白色 |
| `--foreground` | `222.2 84% 4.9%` | 近黑色 |
| `--primary` | `221.2 83.2% 53.3%` | 蓝色（主色调） |
| `--primary-foreground` | `210 40% 98%` | 主色调上的文字颜色 |
| `--secondary` | `210 40% 96.1%` | 浅灰蓝（次要操作） |
| `--muted` | `210 40% 96.1%` | 柔和背景 |
| `--muted-foreground` | `215.4 16.3% 46.9%` | 辅助文字 |
| `--accent` | `210 40% 96.1%` | 强调色（hover 背景） |
| `--destructive` | `0 84.2% 60.2%` | 红色（危险操作） |
| `--border` | `214.3 31.8% 91.4%` | 边框颜色 |
| `--input` | `214.3 31.8% 91.4%` | 输入框边框 |
| `--ring` | `221.2 83.2% 53.3%` | 焦点环颜色 |
| `--radius` | `0.5rem` | 全局圆角半径 |

### 深色主题（`.dark`）

`.dark` 选择器在 `<html class="dark">` 时生效。

| 变量 | 值 | 说明 |
|---|---|---|
| `--background` | `222.2 84% 4.9%` | 深蓝黑 |
| `--foreground` | `210 40% 98%` | 近白色 |
| `--primary` | `217.2 91.2% 59.8%` | 亮蓝色 |

## `@apply`

在 CSS 中使用 Tailwind 工具类的指令。

## `-webkit-font-smoothing: antialiased`

抗锯齿渲染：让文字在 macOS/iOS 上更清晰。

## 自定义滚动条（WebKit）

适用于 Chrome、Edge、Safari，让滚动条更细、更融入页面设计。
