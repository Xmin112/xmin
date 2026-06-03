# Voyage — 动画系统

## 动画哲学

Voyage 的动画不是装饰，是**产品语言**。

- 每一个动画都有物理重量——不飘、不轻浮
- 动画速度反映信息重要性——重要的事慢一点，让用户吸收
- 空间动画（3D 相机）和 UI 动画（2D 元素）用不同的缓动曲线
- 动画之间不冲突——同一时间只有一个"主角动画"在发生

---

## 缓动函数库

### 主缓动（UI 元素）

```
easeOutCubic         cubic-bezier(0.33, 1, 0.68, 1)
  用途：UI 元素入场（卡片、文字、面板）
  感觉：快启动、慢停下，有惯性但不拖沓
  时长：300-500ms

easeInCubic          cubic-bezier(0.32, 0, 0.67, 0)
  用途：UI 元素退场
  感觉：慢启动、快消失，不拖泥带水
  时长：200-350ms

easeInOutCubic       cubic-bezier(0.65, 0, 0.35, 1)
  用途：相机过渡、缩放动画
  感觉：对称、平滑、像呼吸
  时长：1.2-2.5s
```

### 弹性缓动（特殊场景）

```
easeOutBack          cubic-bezier(0.34, 1.56, 0.64, 1)
  用途：建筑弹出、卡片 stagger 入场
  感觉：超过目标再弹回来，有玩具/游戏感
  时长：400-600ms

spring               (mass: 1, stiffness: 200, damping: 20)
  用途：弹窗、快速 UI 反馈
  感觉：有弹性的快速响应
```

### 自定义缓动（地球飞行专用）

```
flyEase:
  第一阶段 (0-30%)：   缓出，像被引力抓住
  第二阶段 (30-80%)：  匀速，稳定的"飞行"
  第三阶段 (80-100%)： 缓入，像轻轻降落在目的地

  实现：用 GSAP timeline + 多段 keyframe
  或贝塞尔近似：cubic-bezier(0.5, 0, 0.2, 1)
```

---

## 动画时间线总览

```
页面加载
│
├─ 0ms         地球出现（已在场景中）
│              地球开始自转（Y 轴旋转 0.06 rad/s）
│
├─ 3000ms      Q1 "你想去哪？" 淡入 (600ms easeOutCubic)
│  3600ms      输入线淡入 (400ms easeOutCubic)
│
├─ [用户输入 "首尔" → Enter]
│  0ms         文字"首尔"上浮消失 (350ms easeInCubic)
│  350ms       输入线淡出 (250ms)
│  600ms       短暂空白
│  900ms       Q2 "和谁一起去？" 淡入 (500ms easeOutCubic)
│  1400ms      输入线淡入 (400ms)
│
├─ [用户输入 "一个人" → Enter]
│  0ms         文字上浮消失
│  ...         同上
│  [完成 Q3 选项选择]
│
├─ 0ms         选中卡片放大 + 其余淡出 (350ms)
│  500ms       "正在为你探索首尔..." 淡入 (400ms)
│  2000ms      文字淡出 (300ms)
│
├─ 2500ms      ★ 飞行开始 ★
│              Level 1: World → 从 z=2.8 开始
│  2500ms      Level 2: Continent, z → 2.0 (1.8s flyEase)
│              [停顿 800ms, 相机微呼吸]
│  5100ms      Level 3: Country, z → 1.5 (1.5s flyEase)
│              [停顿 800ms]
│  7400ms      Level 4: City, z → 1.15 (1.5s flyEase)
│              [停顿 600ms]
│  9500ms      Level 5: District, z → 1.03 (1.2s flyEase)
│              [停顿 500ms]
│              ★ 飞行结束 ★
│
├─ 11200ms    2.5D 建筑群浮现
│             每个建筑弹出 (500ms easeOutBack, 每栋延迟 35ms × 30 栋)
│             总时长约 1500ms
│
├─ 12700ms    路线金色虚线渐绘
│             从左（起点）到右（终点）
│             800ms, stroke-dashoffset 动画
│
├─ 13500ms    时间轴卡片入场
│             顶部第一张先入，向下 stagger
│             每个卡片：400ms easeOutCubic + 100ms 延迟
│             总时长约 900ms
│
└─ 探索态      用户自由交互
              点击 → 350ms 视角移动
              Hover → 150ms 微反馈
```

---

## 分类动画规格

### A. 文字/UI 入场

| 元素 | 动画 | 时长 | 缓动 |
|---|---|---|---|
| 问题文字 | opacity 0→1, y 10→0 | 500ms | easeOutCubic |
| 输入线 | opacity 0→1, scaleX 0→1 | 400ms | easeOutCubic |
| 选项卡片 | opacity 0→1, scale 0.95→1 | 350ms | easeOutBack |
| hint 文字 | opacity 0→1 | 300ms, delay 200ms | easeOutCubic |
| 进度条填充 | scaleX 0→1 | 400ms | easeOutCubic |
| 飞行过渡文字 | opacity 0→1→0 | 400ms in, 300ms out | easeOutCubic |

### B. 文字/UI 退场

| 元素 | 动画 | 时长 | 缓动 |
|---|---|---|---|
| 答案文字 | opacity 1→0, y 0→-10 | 300ms | easeInCubic |
| 输入线 | opacity 1→0 | 200ms | easeInCubic |
| 选项卡片（未选中） | opacity 1→0.4, scale 1→0.98 | 300ms | easeInCubic |
| 选项卡片（选中） | scale 1→1.05→1, border accent | 350ms | easeOutBack |

### C. 3D 相机

| 动画 | 距离/角度 | 时长 | 缓动 |
|---|---|---|---|
| 飞行 Level 2 | z 2.8→2.0 | 1.8s | flyEase |
| 飞行 Level 3 | z 2.0→1.5 | 1.5s | flyEase |
| 飞行 Level 4 | z 1.5→1.15 | 1.5s | flyEase |
| 飞行 Level 5 | z 1.15→1.03 | 1.2s | flyEase |
| 探索态点击建筑 | 相机平移 50-200px | 350ms | easeOutCubic |
| 探索态拖拽旋转 | 跟随鼠标, ±15° | 实时 | 无（跟随输入） |
| 探索态滚轮缩放 | ±20% 距离 | 实时 | 无（跟随输入） |
| 重置视角（双击） | 回到默认位置 | 500ms | easeInOutCubic |

### D. 2.5D 世界

| 动画 | 规格 | 时长 | 缓动 |
|---|---|---|---|
| 建筑出场 | scaleY 0→1, 从地面"长出来" | 500ms/栋 | easeOutBack |
| 建筑 stagger | 每栋延迟 35ms, 从中心向外扩散 | — | — |
| 建筑选中浮起 | y 0→3m, 发光描边出现 | 350ms | easeOutCubic |
| 建筑取消选中 | y 3m→0, 发光消失 | 250ms | easeInCubic |
| 路线渐绘 | stroke-dashoffset 全长→0 | 800ms | easeInOutCubic |
| 起点星出现 | scale 0→1 + 旋转 360° | 500ms | easeOutBack |
| 终点旗出现 | 旗面从折叠到展开 | 400ms | easeOutCubic |
| 光斑颜色切换 | 渐变色过渡 | 2s | easeInOutCubic |

### E. 微交互

| 元素 | 触发 | 动画 | 时长 |
|---|---|---|---|
| 光标 | 输入框聚焦 | 闪烁 1s 间隔 | 持续 |
| 输入线 | 聚焦/失焦 | 颜色渐变 + 高度 1→2px | 200ms |
| 圆点（时间轴） | Hover | scale 1→1.3 | 150ms |
| 圆点（时间轴） | 选中 | scale 1→1.5 + 发光环 | 250ms |
| 建筑（世界） | Hover | 微亮 + 微浮起 y 1m | 200ms |
| 按钮 | Hover | scale 1→1.02 | 200ms |
| 按钮 | Press | scale 1→0.97 | 100ms |
| 按钮 | Release | scale 0.97→1.02→1 | 300ms spring |

### F. 分享图生成

| 步骤 | 时长 |
|---|---|
| 点击"保存路线图" → 遮罩出现 | 200ms |
| 遮罩上显示"正在生成..." | 即时 |
| Canvas 渲染（在后台） | ~500ms |
| "正在生成..." → "生成完成 ✓" | 300ms |
| 显示预览图 + 下载按钮 | 400ms easeOutCubic |
| 点击下载 → 按钮短暂变绿 ✓ | 300ms |

---

## 性能预算

```
目标帧率：    55fps+（所有动画）
地球渲染：    ≤ 8ms/frame（Three.js 主线程）
UI 动画：     使用 GPU 加速属性（transform, opacity）
             禁止动画 width/height/top/left
             禁止在动画中使用 box-shadow 过渡
canvas 重绘： 仅在必要时（相机移动、建筑弹出）
             闲时 0ms（地球自转用 requestAnimationFrame）
```

---

## 动画禁用（无障碍）

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

当用户系统开启了"减少动效"：
- 所有动画时长压缩到 0.01ms（几乎瞬间完成）
- 飞行动画变为直接跳转（无中间过渡）
- 建筑直接出现（不弹出）
- 路线直接显示（不渐绘）
