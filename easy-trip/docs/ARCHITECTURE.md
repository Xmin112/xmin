# Easy Trip — 架构设计

## 技术栈

| 层 | 选型 | 理由 |
|---|---|---|
| 前端框架 | Next.js 15 + React 19 | SSR/SSG 混合，App Router |
| 语言 | TypeScript（strict） | 红线要求 |
| 样式 | Tailwind CSS 4 | 原子化样式，配合 iOS 毛玻璃自定义 |
| AI 对话 | DeepSeek V4 API | 中文好、支持联网搜索、便宜 |
| 路线规划 | **自己实现**（路径排序算法） | 核心能力，不外包 |
| 交互地图 | MapLibre GL JS | 开源免费，自定义风格强 |
| 分享卡片渲染 | 纯 Canvas API | 手绘路线图导出 |
| 部署 | Vercel | Next.js 亲妈，免费额度够 MVP |
| 数据存储 | 无（MVP 不需要） | 后续加 PostgreSQL |

---

## 架构概览

```
┌─────────────────────────────────────────────────┐
│              浏览器（Next.js 前端）               │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ 聊天 UI   │  │ 地图组件  │  │ Canvas 导出   │  │
│  │ (React)  │  │(MapLibre)│  │ (分享卡片)    │  │
│  └────┬─────┘  └────┬─────┘  └───────────────┘  │
│       │             │                            │
└───────┼─────────────┼────────────────────────────┘
        │             │
┌───────▼─────────────▼────────────────────────────┐
│              Next.js API Routes                   │
│                                                   │
│  ┌──────────────┐  ┌─────────────────────────┐   │
│  │ /api/chat    │  │ /api/route-optimize     │   │
│  │ (AI 对话)     │  │ (路线排序算法)           │   │
│  └──────┬───────┘  └───────────┬─────────────┘   │
│         │                      │                  │
└─────────┼──────────────────────┼──────────────────┘
          │                      │
┌─────────▼──────────┐  ┌───────▼──────────────────┐
│  DeepSeek V4 API   │  │  路径排序引擎（自研）      │
│  + 联网搜索        │  │  - 地理坐标距离计算        │
│                    │  │  - TSP 贪心/2-opt 优化    │
│                    │  │  - 地铁出入口数据          │
└────────────────────┘  └──────────────────────────┘
```

---

## 核心模块

### 1. AI 对话引擎（`/api/chat`）

**职责：**
- 接收用户消息，维护对话上下文
- 调用 DeepSeek V4 + 联网搜索
- 结构化输出：提取地点列表、坐标、类型、介绍
- 判断用户意图（单日规划/多日规划/调整/闲聊）

**Prompt 设计要点：**
- System prompt：定义 AI 角色——友好、有点小幽默的旅行规划师
- 强制联网搜索：每次地点相关查询都要搜最新的信息
- 输出格式约束：让 AI 输出结构化的 JSON（地点名、坐标、类型、一句话介绍），方便后续路线排序
- 偏好追问：如果用户没说清楚目的地/喜好，主动追问

**API 格式（OpenAI 兼容）：**
```typescript
// 请求
POST /api/chat
{
  messages: { role: "user" | "assistant", content: string }[],
  // 可选：已确认的地点列表（用户指定店铺）
}

// AI 返回结构
{
  reply: string,           // 给用户看的文字回复
  places?: {               // 提取的地点（可选，没到输出阶段就没有）
    name: string,
    lat: number,
    lng: number,
    category: string,
    intro: string,         // 一句话介绍
    source: string,        // 来源（搜索到的 / 用户指定的）
  }[],
  stage: "asking" | "searching" | "planning" | "done"
}
```

### 2. 路线排序引擎（`/api/route-optimize`）

**职责：**
- 输入：一组地点（含坐标）
- 输出：最优访问顺序 + 步行路线

**算法方案：**

起点是最近的地铁站出口（从 OpenStreetMap 获取），终点灵活。

```
输入地点列表 → 贪心最近邻构建初始路径 → 2-opt 局部交换优化 → 输出最优顺序
```

- **距离计算**：Haversine 公式（球面距离），不需要调用外部 API
- **优化目标**：总步行距离最短 + 不走回头路
- **时间复杂度**：10 个点以内的 2-opt 在毫秒级完成，够用
- **地铁站匹配**：从 OSM 数据预提取各地铁站出口坐标，匹配最近的一个作为起点

**为什么不调 Mapbox Directions API：**
- 它是按驾车/步行算具体路径的，不是算"访问顺序"的
- 访问顺序优化（类 TSP）是我们自己的核心逻辑
- OSM 有完整的人行道网络数据，后续可以自己算详细步行路径
- MVP 阶段直线距离 + 可视化就够好

### 3. 地图渲染（MapLibre GL）

**职责：**
- 显示自定义风格的手绘感地图
- 标注 POI（手绘风图标）
- 绘制路线（SVG 路径，模拟手绘笔触）
- 支持缩放/拖拽

**自定义地图样式：**
- 用 MapLibre Style Spec 定义整套风格
- 或者用 Protomaps（免费瓦片）+ 自定义样式
- 道路颜色、建筑颜色全部重新配成暖色系
- 隐藏不需要的标注（POI 标签、路名等）

**手绘感实现思路：**
- 路线用 SVG `<path>` 叠加在地图上，加 `stroke-dasharray` + `stroke-linecap="round"`
- 可以给路线加个轻微的 `filter: drop-shadow` 模拟荧光笔渲染效果
- POI 图标用 Canvas 提前绘制的手绘风小图标（SVG 也可以）

### 4. Canvas 分享卡片（前端）

**职责：**
- 根据路线数据，在 Canvas 上绘制完整的手账风路线图
- 导出为 PNG，用户保存/分享

**绘制层级：**
1. 背景：奶油色底 + 纸张纹理
2. 顶部装饰：日期、天气、城市名（手写体）
3. 地图主体：简化版底图（道路 + 建筑轮廓）+ 路线 + POI 标记
4. 底部时间轴：按顺序列出地点（序号 + 名 + 介绍）
5. 装饰元素：胶带、贴纸、边框

> 地图主体部分可以直接截取 MapLibre 地图的 Canvas 并做风格化处理，或者用简化几何数据重新绘制。

---

## 目录结构

```
easy-trip/
├── docs/
│   ├── PRD.md
│   ├── DESIGN.md
│   └── ARCHITECTURE.md
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 根布局（字体、元数据）
│   │   ├── page.tsx            # 主页（聊天界面）
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts    # AI 对话 API
│   │       └── route-optimize/
│   │           └── route.ts    # 路线排序 API
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── OptionCards.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── map/
│   │   │   ├── RouteMap.tsx       # MapLibre 地图组件
│   │   │   ├── RouteLine.tsx      # 手绘风格路线
│   │   │   ├── PoiMarker.tsx      # 手绘 POI 标记
│   │   │   └── mapStyle.ts        # 自定义地图样式配置
│   │   ├── share/
│   │   │   ├── ShareCard.tsx      # Canvas 分享卡片组件
│   │   │   └── drawHanddrawn.ts   # 手绘元素绘制工具函数
│   │   └── ui/
│   │       ├── GlassCard.tsx      # 毛玻璃卡片
│   │       ├── GlassInput.tsx     # 毛玻璃输入框
│   │       └── Button.tsx         # iOS 风格按钮
│   ├── lib/
│   │   ├── deepseek.ts           # DeepSeek API 封装
│   │   ├── routeOptimizer.ts     # 路线排序算法
│   │   ├── geoUtils.ts           # 地理计算工具（Haversine 等）
│   │   └── prompts.ts            # AI System Prompt 模板
│   └── types/
│       ├── chat.ts               # 聊天相关类型
│       ├── place.ts              # 地点类型
│       └── route.ts              # 路线类型
├── public/
│   ├── fonts/                    # 手写体字体文件
│   └── icons/                    # 手绘图标 SVG
├── .claude/
│   └── CLAUDE.md                 # 项目级配置
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 数据流

### 单次路线规划的完整流程

```
1. 用户发送消息
   ChatInput → ChatContainer → POST /api/chat

2. AI 处理
   /api/chat → DeepSeek API（联网搜索）
   → 判断意图：该追问就追问 / 该出路线就出路线
   → 返回 { reply, places?, stage }

3. 前端展示
   - reply → MessageBubble（聊天消息）
   - places 为空 → 继续对话
   - places 有值 → 触发路线排序

4. 路线排序
   POST /api/route-optimize { places }
   → 最近邻 + 2-opt → 输出排序后的坐标序列
   → 同时返回最近地铁站出口信息

5. 地图渲染
   RouteMap 接收排序后的坐标序列
   → MapLibre 显示：标记 POI、绘制路线、标注地铁口
   → RouteLine 用 SVG 手绘风格覆盖

6. 分享卡片（用户主动触发）
   点击"保存图片"
   → ShareCard 用 Canvas 绘制完整手账版
   → canvas.toBlob() → 下载 / 复制到剪贴板
```
