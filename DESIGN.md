# Design System — Voyage

> Apple × Balenciaga fusion：克制的纪念碑。
> "less but better" meets stark minimalism.

## Aesthetic Stance

**极度自信的克制。不对用户喊叫。让空间本身说话。**

Apple 的「去掉一切装饰，只留本质」× Balenciaga 的「纯黑纯白、锐利裁切、结构感极强的负空间」。
两者交汇处——没有暖意，没有讨好，没有多余。精准、锐利、沉默。

## Type

| 用途 | 字体 | Weight | 说明 |
|---|---|---|---|
| 标题 H1 | Geist | Light (300) | 大号、极轻、不吼 |
| 标题 H2/H3 | Geist | Regular (400) | 克制层级 |
| 正文 | Geist | Regular (400) | 16px, line-height 1.6, max-width 640px |
| 标注/导航/标签 | Geist | Medium (500) | 10px, uppercase, tracking-[0.2em] |
| Mono | Geist Mono | Regular | 仅用于坐标、时间、数据 |

**字号层级：** H1: 48-64px / H2: 28-36px / H3: 20-24px / Body: 16px / Caption: 12px / Eyebrow: 10px

## Color

```
页面底色       #FAFAFA            极浅灰白（不是纯白，纯白刺眼）
卡片底色       #FFFFFF            纯白卡片浮在浅灰底上
深色底色       #0A0A0A            路线结果区、沉浸式页面（反转）
主文字         #1A1A1A            近黑（永远不用 #000）
次级文字       #8E8E93            Apple 灰
三级文字       #C7C7CC            最淡灰，仅用于占位符
分割线         rgba(0,0,0,0.06)   几乎看不见
强调色         无                  黑白灰就是品牌色
错误/警告      #FF3B30            Apple 红，极少使用
成功           #34C759            Apple 绿，极少使用
```

**没有彩色 accent。没有渐变。没有发光。** 颜色不是品牌。克制是品牌。

## Spacing

```
基准单位       4px
段间距         96px-160px        py-24 ~ py-40
卡片内边距     24px              p-6
卡片间距       16px              gap-4
页面水平边距   24px (mobile) → 48px+ (desktop)  px-6 → md:px-12
圆角           16px              rounded-2xl
               32px              rounded-[2rem] (Hero 卡片)
```

**呼吸感是第一优先级。宁可多留白，不可挤。** 负空间不是浪费——负空间是设计材料。

## Motion

```
入场动画    translate-y-6 → 0 + opacity 0→1    duration-700
             交错延迟 100ms/stagger
按钮按压    active:scale-[0.98]                  duration-150
状态切换    cubic-bezier(0.32,0.72,0,1)          duration-500
路线绘制    dash-offset 动画                      duration-2000 (叙事性)
```

**铁律：所有动画仅作用于 `transform` + `opacity`。永远不碰 `width/height/top/left`。**
**禁用 `linear`、`ease-in-out`——只允许自定义 cubic-bezier。**

## Components

### Double-Bezel Card（所有卡片的唯一结构）
```
Outer Shell: bg-black/[0.03], ring-1 ring-black/[0.04], p-[6px], rounded-[2rem]
Inner Core:  bg-white, shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)], rounded-[calc(2rem-0.375rem)]
```

### Primary Button
```
rounded-full, px-6 py-3, bg-[#1A1A1A] text-white
hover: bg-[#2A2A2A]
active: scale-[0.98]
transition: duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
```

### Input Field
```
Double-Bezel 结构
bg-white, text-[#1A1A1A], placeholder-[#C7C7CC]
focus: ring-2 ring-black/[0.08], outline-none
```

### Timeline（路线结果列表）
```
左侧 1px 竖线 (rgba(0,0,0,0.06))
每个 stop：左侧圆点(8px) + 右侧内容区
stop 间间距：py-6
```

## Imagery

- 所有用户照片统一降低饱和度 10-15%（`filter: saturate(0.85)`）
- 地图：自定义低饱和配色（去除非必要标注色）
- 不使用任何装饰性插画
- 不使用 emoji 作为视觉元素

## What This System Rejects

- ❌ 渐变色文字或背景（任何形式）
- ❌ box-shadow 投影——用微弱边框 ring-1 替代
- ❌ backdrop-blur 毛玻璃——除全屏导航/弹窗外
- ❌ 多色系统——只有黑白灰 + Apple 红/绿（仅错误/成功）
- ❌ 圆角超过 32px
- ❌ 科技风、赛博风、游戏化元素
- ❌ 卡片悬浮阴影动画
- ❌ 任何形式的「发光」「霓虹」「光晕」
- ❌ 饱和度过高的摄影（所有图片统一去饱和）
- ❌ Inter, Roboto, Arial, Open Sans, Helvetica 字体
- ❌ `linear` 或 `ease-in-out` 过渡
- ❌ 1px solid gray 边框
- ❌ 对称的三列 Bootstrap 式网格

## Typography Discipline

- 标题层级仅用 size + weight，不用颜色
- 单行标题不超过 10 个中文字
- 正文区块最大宽度 640px
- 行间距 1.6（正文）/ 1.2（标题）

## Mobile Principle

- 768px 以下全部单列堆叠
- 禁用 `h-screen`，用 `min-h-[100dvh]`
- 触摸区域最小 44×44px
- 底部留出安全区 padding
