/**
 * 手势控制器 — FBC 生物特征识别协议
 *
 * 检测 3 种手势：
 *   ✋ OPEN  — 张开手掌（≥4 指伸展）→ 校准确认
 *   ✌️ PINCH — 拇指与食指捏合 → 实体定位
 *   👆 SWIPE — 手掌快速上滑 → 阈值共振
 *
 * 包含平滑滤波（5 帧多数投票）和置信度计算。
 */

// ─── 手部解剖常数（MediaPipe 21 关键点索引） ───
const THUMB_TIP  = 4
const THUMB_MCP  = 2
const INDEX_TIP  = 8
const INDEX_MCP  = 5
const MIDDLE_TIP = 12
const MIDDLE_MCP = 9
const RING_TIP   = 16
const RING_MCP   = 13
const PINKY_TIP  = 20
const PINKY_MCP  = 17
const WRIST      = 0

const FINGER_TIPS = [THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP]
const FINGER_MCPS = [THUMB_MCP, INDEX_MCP, MIDDLE_MCP, RING_MCP, PINKY_MCP]

// ─── 阈值常量 ───
const PINCH_DISTANCE_THRESHOLD = 0.08   // 拇指-食指归一化距离阈值
const SWIPE_VELOCITY_THRESHOLD = 0.010  // 手腕 y 轴速度阈值（负值 = 向上）
const SWIPE_DIRECTION_RATIO    = 1.5    // |dy| / |dx| > 此值 → 垂直主导
const PALM_CENTER_Y_MIN        = 0.15   // 手掌中心 y 最小值（放宽）
const PALM_CENTER_Y_MAX        = 0.85   // 手掌中心 y 最大值（放宽）
const EXTENDED_FINGER_MIN      = 3      // OPEN 手势最少伸展手指数（放宽，适配小指不灵活者）
const SMOOTHING_WINDOW         = 5      // 平滑窗口帧数
const SWIPE_HISTORY_SIZE       = 8      // 滑动检测历史帧数

/**
 * 判断手指是否伸展
 * 拇指：比较 x 轴偏移
 * 其他四指：指尖 y < MCP y（y 轴向下）
 */
function isFingerExtended(landmarks, tipIdx, mcpIdx, isThumb) {
  if (!landmarks[tipIdx] || !landmarks[mcpIdx]) return false
  if (isThumb) {
    return Math.abs(landmarks[tipIdx].x - landmarks[mcpIdx].x) > 0.05
  }
  return landmarks[tipIdx].y < landmarks[mcpIdx].y
}

/**
 * 检查手掌中心是否在画面有效范围内
 */
function isPalmInCenter(landmarks) {
  if (!landmarks[WRIST] || !landmarks[MIDDLE_MCP]) return false
  const palmY = (landmarks[WRIST].y + landmarks[MIDDLE_MCP].y) / 2
  return palmY > PALM_CENTER_Y_MIN && palmY < PALM_CENTER_Y_MAX
}

/**
 * 计算两点之间的欧几里得距离（归一化坐标）
 */
function distance(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 计算手指数目
 */
function countExtendedFingers(landmarks) {
  return FINGER_TIPS.filter((tip, i) =>
    isFingerExtended(landmarks, tip, FINGER_MCPS[i], i === 0)
  ).length
}

/**
 * 检测两指捏合
 * 条件：
 *   1. 拇指与食指距离 < 阈值
 *   2. 其余至少 2 指伸展（区分于握拳）
 */
function detectPinch(landmarks) {
  const d = distance(landmarks[THUMB_TIP], landmarks[INDEX_TIP])
  if (d >= PINCH_DISTANCE_THRESHOLD) return false

  const otherExtended = [MIDDLE_TIP, RING_TIP, PINKY_TIP].filter((tip, i) =>
    isFingerExtended(landmarks, tip, [MIDDLE_MCP, RING_MCP, PINKY_MCP][i], false)
  ).length

  return otherExtended >= 2
}

/**
 * 检测上滑手势
 * 比较当前手腕位置与历史位置均值的差值
 * 条件：
 *   1. 平均速度 > 阈值
 *   2. 垂直方向移动占主导
 */
function detectSwipe(landmarks, history) {
  if (history.length < 3) return false

  // 计算早期帧的平均手腕位置
  const earlySlice = history.slice(0, 3)
  const earlyAvg = earlySlice.reduce(
    (acc, h) => ({ x: acc.x + h.x / earlySlice.length, y: acc.y + h.y / earlySlice.length }),
    { x: 0, y: 0 }
  )

  // 最近帧的手腕位置
  const current = landmarks[WRIST]

  const dx = current.x - earlyAvg.x
  const dy = current.y - earlyAvg.y

  // 向上移动 = dy 为负（y 轴向下）
  const velocityY = Math.abs(dy) / history.length
  const isUpward = dy < 0
  const isVerticalDominant = Math.abs(dy) > Math.abs(dx) * SWIPE_DIRECTION_RATIO

  return isUpward && velocityY > SWIPE_VELOCITY_THRESHOLD && isVerticalDominant
}

/**
 * 5 帧多数投票平滑
 * @param {string[]} gestureHistory — 最近 N 帧的手势标签
 * @returns {{ gesture: string, confidence: number }}
 */
function smoothGesture(gestureHistory) {
  if (gestureHistory.length === 0) return { gesture: 'none', confidence: 0 }

  const counts = { open: 0, pinch: 0, swipe: 0, none: 0 }
  for (const g of gestureHistory) {
    counts[g] = (counts[g] || 0) + 1
  }

  // 找到出现次数最多的手势
  let best = 'none'
  let bestCount = 0
  for (const [g, c] of Object.entries(counts)) {
    if (c > bestCount) {
      best = g
      bestCount = c
    }
  }

  const required = Math.ceil(SMOOTHING_WINDOW * 0.6) // 需要 60% 多数
  if (bestCount >= required) {
    return { gesture: best, confidence: bestCount / SMOOTHING_WINDOW }
  }

  return { gesture: 'none', confidence: 0 }
}

/**
 * 主检测函数
 *
 * @param {Array<{x: number, y: number, z: number}>} landmarks
 *   MediaPipe 归一化关键点数组（21 个点）
 * @param {Array<{x: number, y: number}>} positionHistory
 *   手腕位置历史（最近 SWIPE_HISTORY_SIZE 帧）
 * @returns {{ gesture: 'none'|'open'|'pinch'|'swipe', confidence: number }}
 */
export function detectGesture(landmarks, positionHistory) {
  if (!landmarks || landmarks.length < 21) {
    return { gesture: 'none', confidence: 0 }
  }

  if (!isPalmInCenter(landmarks)) {
    return { gesture: 'none', confidence: 0 }
  }

  const extendedCount = countExtendedFingers(landmarks)

  // 优先级: SWIPE > PINCH > OPEN > NONE
  // SWIPE 优先级最高因为它动作最快，需要在历史中保留

  if (detectSwipe(landmarks, positionHistory)) {
    return { gesture: 'swipe_raw', confidence: 0.7 } // raw 表示未经平滑
  }

  if (detectPinch(landmarks)) {
    return { gesture: 'pinch_raw', confidence: 0.8 }
  }

  if (extendedCount >= EXTENDED_FINGER_MIN) {
    return { gesture: 'open_raw', confidence: extendedCount / 5 }
  }

  return { gesture: 'none', confidence: 0 }
}

/**
 * 将原始手势（带 _raw 后缀）通过平滑过滤器
 *
 * @param {string} rawGesture
 * @param {string[]} gestureHistory — 会被原地修改
 * @returns {{ gesture: 'none'|'open'|'pinch'|'swipe', confidence: number }}
 */
export function filterGesture(rawGesture, gestureHistory) {
  // 从 raw 标签去掉 _raw 后缀
  const base = rawGesture === 'none' ? 'none'
    : rawGesture.replace('_raw', '')

  gestureHistory.push(base)
  if (gestureHistory.length > SMOOTHING_WINDOW) {
    gestureHistory.shift()
  }

  return smoothGesture(gestureHistory)
}
