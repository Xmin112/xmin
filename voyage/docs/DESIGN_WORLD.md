# Voyage World — 设计系统

> 基于 design-md + frontend-design + gsap + web-design-guidelines 指导

## 美学方向

**"温暖的手工微缩模型世界"** (playful/toy-like)

像一个用木头、纸板、毛毡手工搭建的微型城市。
参考：Animal Crossing 的玩具感 + Monument Valley 的几何诗意

## 色彩

```css
:root {
  --ground:       #F5EDE0;   /* 暖米色地面 */
  --sidewalk:     #F8F2E8;   /* 人行道 */
  --road:         #EBE0D0;   /* 路面 */
  --wall-warm:    #F8F2EA;   /* 暖白墙面 */
  --wall-tan:     #EDE6DA;   /* 米褐墙面 */
  --roof-dark:    #C4A882;   /* 深屋顶 */
  --roof-red:     #D4A88C;   /* POI 红砖屋顶 */
  --tree:         #7BA869;   /* 树冠绿 */
  --trunk:        #A08568;   /* 树干棕 */
  --accent:       #FF6B6B;   /* 珊瑚强调色 */
  --gold:         #FFD93D;   /* 金色标记 */
  --ui-bg:        #FFFDF5;   /* UI 底色 */
  --text-1:       #4A3728;   /* 深棕文字 */
  --text-2:       #8B7A68;   /* 次级文字 */
  --text-3:       #B8A898;   /* 辅助文字 */
}
```

## 字体

- 主字体: **Nunito** (圆润友好游戏感)
- 禁止: Inter, Roboto, Arial, system fonts

## 光照

- 方向光: `#FFE4CC` 135°方位 50°仰角 (下午3点金色阳光)
- 环境光: `#FFF5EC`
- 半球光: 天空 `#FFECD2` + 地面 `#C8B898`
- 色调映射: ACESFilmic, exposure 1.15

## 动效 (GSAP)

| 场景 | 缓动 | 时长 | stagger |
|---|---|---|---|
| 建筑弹出 | back.out(1.7) | 0.5s | 0.03s |
| 角色走路 | quickTo (x,y) | 0.3s | - |
| 地面涟漪 | power2.out | 0.6s | - |
| 发现粒子 | power3.out | 0.8s | 0.02s |
| 印章庆祝 | elastic.out(1,0.3) | 1.2s | - |
| 世界呼吸 | sine.inOut | 4s | - |

## UI 规则

一切 UI 在世界内部。不用 HTML div 浮层。
- 探索计数: 3D 场景角落的小徽章
- 对话框: 3D 气泡浮在 NPC 旁
- 印章: Canvas 粒子 + CSS 卡片动画
