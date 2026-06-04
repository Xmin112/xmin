# Voyage 原型设计审查

> 审查标准：design-md + frontend-design + web-design-guidelines
> 参考基准：Animal Crossing / Monument Valley / Cozy Grove

---

## 逐维度评分

### 色彩：4/10

**Skill 标准：** "Dominant colors with sharp accents outperform timid, evenly-distributed palettes" (frontend-design)

**当前状态：** timid, evenly-distributed palette。

```
地面 #F5EDE0 → 建筑 #F8F2EA → 屋顶 #C4A882 → UI #FFFDF5
```

这四个颜色之间的差异不到 5% 亮度。整张画面看起来像**一杯加了太多奶的拿铁**——全是奶色，没有咖啡。

**Animal Crossing 怎么做：** 绿色草地是主导色，建筑的红色/蓝色屋顶是锐利强调色，天空是淡蓝。三者形成清晰的对比层次。你的眼睛能在 0.1 秒内区分"这是地、这是建筑、这是天"。

**我的问题：** 地和建筑颜色撞了。从远处看，地面和建筑墙面融为一体——你看不清建筑在哪、地在哪。缺少"图层感"。

### 光影：3/10

**当前状态：** 软阴影 + 均匀暖光 = 没有戏剧性。没有高光区域、没有暗角、没有视觉引导。

**Monument Valley 怎么做：** 光是设计元素。强方向光在建筑上投下几何阴影。亮面和暗面的对比创造了"不可能几何体"的诗意。

**Cozy Grove 怎么做：** 光有颜色倾向——黄昏是橙色、夜晚是蓝色。阴影不只是"暗"，而是"被染上了环境色"。

**我的问题：** 我用了 ACES 色调映射 + 暖方向光，但最终效果是"均匀地暖"。没有亮的地方特别亮、暗的地方特别暗。整个画面像被平均压平了。

### 材质：4/10

**当前状态：** 建筑墙面 roughness 0.6，地面 roughness 0.85。材质有差异，但肉眼几乎分辨不出来。

**Animal Crossing 怎么做：** 木头是木头，石头是石头，草是草。每种材质有明确的视觉特征——不是 roughness 0.6 vs 0.85 的差异，而是"看起来就是不同的东西"。

**我的问题：** 所有东西都是 `meshStandardMaterial` + 差不多的 roughness。没有 toon shading、没有材质多样性、没有手绘感。看起来像是"一个 3D 场景"而不是"一个手工搭建的世界"。

### 动效：6/10

**Skill 标准：** "one well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions" (frontend-design)

**做得好的：** GSAP 建筑 stagger 入场 + back.out 弹性是最大的亮点。角色移动用 quickTo 平滑。世界呼吸（太阳微动）有想法。

**缺的：**
- 入场完成后，世界就静止了。没有任何持续的生命感——树不动、旗不飘、NPC 不呼吸
- 发现地点时没有任何反馈动画——没有粒子、没有闪光、没有镜头微震
- 点击地面移动时没有涟漪反馈
- 缺少"惊喜时刻"

### 空间构图：3/10

**Skill 标准：** "Unexpected layouts. Asymmetry. Overlap." (frontend-design)

**当前状态：** 建筑沿道路网格均匀排列。中心对称。正交相机固定角度。布局是**城市规划工具**的思维方式，不是**世界设计**的思维方式。

**Monument Valley 怎么做：** 建筑不在网格上。它们悬浮在空间中，路径蜿蜒，视角每次转动都看到不同的构图。

**Animal Crossing 怎么做：** 中心有一棵大树或一个广场。河流蜿蜒穿过。地形有起伏（虽然 Toy 比例的 Voyage 不需要地形）。建筑围绕焦点散布。

**我的问题：** 没有中心、没有焦点、没有"广场"。建筑是均匀分布的。这不叫世界，这叫**网格**。

### 字体：5/10

**Skill 标准：** "Choose fonts that are beautiful, unique, and interesting" (frontend-design)

**当前状态：** Nunito 比 Inter 好，但仍然是一个"安全"的选择。Google Fonts 上排名前 20 的字体。

**Animal Crossing 怎么做：** 使用圆润的、手绘风格的自定义字体。UI 文字看起来像手工写的。

**我的问题：** Nunito 是对的"方向"但不够"极端"。一个"玩具世界"应该用更 toy-like 的字体——像 Fredoka、Baloo 2、或者手写体 Caveat 做标注。

### 世界感 vs 网页感：3/10

**最大的问题：** 世界和 UI 没有融合。

- 探索计数 → HTML div 浮在 Canvas 上
- 提示文字 → HTML div 浮在 Canvas 上
- 对话框 → HTML div 浮在 Canvas 上
- 印章卡片 → HTML div 浮在 Canvas 上
- Deerflow → HTML div 浮在角落

**每一个 UI 元素都在提醒用户："这是一个网页"**。

---

## 最大的 3 个问题

### 1. 没有焦点，没有"世界中心"

Animal Crossing 有广场。Cozy Grove 有篝火。我的世界是一个均匀的建筑网格，你站在任何一个位置看到的画面都差不多。

**应该：** 世界需要一个明确的地标——一棵大树、一座钟楼、一个喷泉广场。用户的视线应该被自然引导到某个方向。

### 2. 所有颜色都在 5% 范围内

地面、建筑、屋顶、UI——全是一个色调的变体。专业术语叫"low contrast"。

**frontend-design 原话：** "Dominant colors with sharp accents outperform timid, evenly-distributed palettes"

**应该：** 地面变成更明显的暖米或浅绿（像真的微缩模型底座）。POI 建筑用更突出的暖红/暖橙。阴影更深。天空区域有色彩。

### 3. 世界是静止的

建筑弹出后就再也不动了。树不摇。光不变。NPC 不呼吸。没有任何"活的东西"。

**Animal Crossing 怎么做：** 树叶在飘、虫子在飞、邻居在散步、云在移动。世界一直在动——不是大动，是**微小的持续的生命迹象**。

**应该：** 树叶微摇（GSAP/rotate）、NPC 微微晃动、光线缓慢变化、旗面飘动、偶尔有粒子飘过。

---

## Skill 判定：不合格

**产品方向正确。视觉交付不及格。**

参照 frontend-design 的标准——"Visually striking and memorable"、"Cohesive with a clear aesthetic point-of-view"、"Meticulously refined in every detail"——当前原型一个都没达到。

它不是一个"让人想住进去的世界"。它是一个"看起来还不错的 3D 技术 Demo"。

---

## 改进路线（不写代码，只列方向）

| # | 问题 | 改进方向 |
|---|---|---|
| 1 | 无焦点 | 在场景中央加入一棵大型地标树或钟楼 |
| 2 | 色彩扁平 | 地面加深/加绿；建筑用更饱和的暖色；加入蓝天/天空色 |
| 3 | 世界静止 | 树木 GSAP 微摇、NPC 呼吸动画、粒子漂浮 |
| 4 | UI 割裂 | 对话框改成 3D 气泡（Canvas 内渲染）；探索计数放进世界角落 |
| 5 | 无惊喜 | 发现地点时触发粒子爆发 + 镜头微震 + 音效视觉化 |
| 6 | 建筑无个性 | POI 建筑用完全不同的形状（圆柱形/三角/多层），不是同一套 box |
| 7 | 光照平坦 | 降低 ambient 强度、增加 directional shadow 对比度、给阴影染色 |
| 8 | 无天空 | 场景上方加渐变色天空平面，或至少让背景不是纯色地面色 |
| 9 | 字体保守 | 换成 Fredoka 或 Baloo 2（更 toy-like），标注用手写体 |
| 10 | 缺少材质变化 | POI 用 toon shading 或 emissive，创造"手绘感" |
