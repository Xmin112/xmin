# Skill 调用报告 — Voyage 设计审查

## 本次调用的 Skills

| Skill | 解决的问题 | 关键输入 |
|---|---|---|
| `design-md` | 建立正式设计系统，用 DESIGN.md 取代散落的口头设计决策 | 要求建立色彩/字体/材质/空间规则，定义"世界感" |
| `frontend-design` | 避免 AI-slop 审美，建立大胆独特的前端视觉方向 | "旅行版动物森友会"的全屏 3D 世界 |
| `web-design-guidelines` | Vercel 级产品设计规范：布局/排版/色彩/动效标准 | 全屏沉浸式世界的 Web 实现标准 |
| `strategic-compact` | 确认战略方向+识别上下文污染 | 废弃旧前端、从头重做 |

## Skill 输出摘要

### frontend-design 核心指导
- **审美方向**：需要明确的极端美学——"温暖的手工微缩模型世界"
- **字体**：禁止 Inter/Arial/Roboto。用有性格的字体——圆体、手写体、或温暖的衬线体
- **色彩**：主导色+锐利强调色，不要均匀分布的调色板
- **动效**：聚焦高光时刻——一个精心编排的页面加载（staggered reveal）比分散的微交互更有效
- **背景**：不要纯色——用纹理、噪点、渐变网格营造深度

### design-md 核心指导
- 建立 DESIGN.md 作为唯一设计真源
- 定义 tokens：色彩、字体、圆角、阴影、间距
- 每次设计决策引用 DESIGN.md，不口头决定

### web-design-guidelines 核心指导
- Vercel 工程团队的 Web 标准
- 布局系统、排版层级、色彩规范、动效标准

### strategic-compact 核心指导
- 方向确认：废弃旧前端、从零重做世界原型是正确的
- 在 Plan 完成后执行 compaction，清空旧上下文

## 未调用的 Skills（本次不需要）

| Skill | 原因 |
|---|---|
| `gsap` | 世界原型用 CSS + R3F 动画，暂时不需要 GSAP |
| `best-practices` | 进入实现阶段后调用 |
| `clean-architecture` | 原型阶段不涉及架构 |
| `react-nextjs-patterns` | 世界原型考虑用纯 HTML 以摆脱旧架构惯性 |
