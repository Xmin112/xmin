/**
 * FBC CASE FILE — 状态机核心
 *
 * 严格的状态转换引擎。非法跳转被静默拒绝并记录。
 * 七个阶段按序推进，不可跳跃、不可重叠。
 *
 * IDLE → CALIBRATING → SHUFFLING → SCANNING → REVEAL → ANALYZING → DOSSIER
 */

import { create } from 'zustand'
import { selectEntitySet } from '../data/entities'
import { shuffleDeck, determineOrientation } from './entityProtocols'

/**
 * 合法转换映射表
 */
const VALID_TRANSITIONS = {
  IDLE:          ['CALIBRATING'],
  CALIBRATING:   ['SHUFFLING', 'IDLE'],
  SHUFFLING:     ['SCANNING'],
  SCANNING:      ['REVEAL', 'SHUFFLING'],
  REVEAL:        ['ANALYZING'],
  ANALYZING:     ['DOSSIER'],
  DOSSIER:       ['IDLE'],
}

/**
 * @typedef {'IDLE'|'CALIBRATING'|'SHUFFLING'|'SCANNING'|'REVEAL'|'ANALYZING'|'DOSSIER'} Phase
 */

const useCaseStore = create((set, get) => ({
  // ─── 状态 ───
  phase:         /** @type {Phase} */ ('IDLE'),
  entities:       [],
  selectedEntity: null,
  orientation:    null,     // 'stable' | 'decayed'
  reading:        null,     // Gemini 返回的解读对象
  error:          null,     // string | null
  cameraReady:    false,
  touchMode:      false,    // 摄像头权限被拒时的触控降级

  // ─── 内部方法 ───

  /**
   * 验证并执行阶段转换
   */
  _transition: (to) => {
    const { phase } = get()
    const allowed = VALID_TRANSITIONS[phase] || []

    if (!allowed.includes(to)) {
      console.warn(
        `[FBC::STATEMACHINE] 非法转换: ${phase} → ${to}。允许: [${allowed.join(', ')}]`
      )
      return false
    }

    set({ phase: to, error: null })
    return true
  },

  // ─── 公开动作 ───

  /**
   * 初始化案件 — IDLE
   * 洗牌 78 张实体，选 22 张用于展示
   */
  initCase: () => {
    const deck = selectEntitySet()
    set({
      phase: 'IDLE',
      entities: deck,
      selectedEntity: null,
      orientation: null,
      reading: null,
      error: null,
    })
  },

  /**
   * 生物特征校准 — IDLE → CALIBRATING
   */
  startCalibration: () => {
    if (!get().cameraReady && !get().touchMode) {
      set({ error: 'CAMERA_NOT_READY' })
      return false
    }
    return get()._transition('CALIBRATING')
  },

  /**
   * 阈值共振 — CALIBRATING → SHUFFLING
   */
  triggerResonance: () => {
    if (get()._transition('SHUFFLING')) {
      const reshuffled = shuffleDeck(get().entities)
      set({ entities: reshuffled })
      return true
    }
    return false
  },

  /**
   * 共振完成 — SHUFFLING → SCANNING
   */
  resonanceComplete: () => {
    return get()._transition('SCANNING')
  },

  /**
   * 实体定位 — SCANNING → REVEAL
   * @param {number} index — 卡片在圆形阵列中的索引
   */
  locateEntity: (index) => {
    if (!get()._transition('REVEAL')) return false
    const entity = get().entities[index]
    const orientation = determineOrientation()
    set({ selectedEntity: entity, orientation })
    return true
  },

  /**
   * 档案解锁完成 — REVEAL → ANALYZING
   */
  revealComplete: () => {
    return get()._transition('ANALYZING')
  },

  /**
   * 星界分析完成 — ANALYZING → DOSSIER
   */
  analysisComplete: (reading) => {
    if (get()._transition('DOSSIER')) {
      set({ reading })
      return true
    }
    return false
  },

  /**
   * 重置案件 — 任意阶段 → IDLE
   */
  resetCase: () => {
    const deck = selectEntitySet()
    set({
      phase: 'IDLE',
      entities: shuffleDeck(deck),
      selectedEntity: null,
      orientation: null,
      reading: null,
      error: null,
    })
  },

  /**
   * 设置摄像头就绪状态
   */
  setCameraReady: (ready) => set({ cameraReady: ready }),

  /**
   * 启用触控模式（摄像头权限被拒时）
   */
  enableTouchMode: () => set({ touchMode: true, cameraReady: true }),

  /**
   * 设置错误
   */
  setError: (err) => set({ error: err }),
}))

export default useCaseStore
