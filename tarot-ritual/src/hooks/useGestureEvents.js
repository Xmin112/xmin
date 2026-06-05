/**
 * useGestureEvents — 手势事件桥接 Hook
 *
 * 将原始的手势/置信度数据通过防抖处理后，
 * 触发 Zustand 状态机的阶段转换。
 *
 * 防抖参数：
 *   OPEN:  500ms — 需要稳定展示手掌
 *   SWIPE: 300ms — 滑动动作快，需要短窗
 *   PINCH: 500ms — 捏合需要故意保持
 */

import { useEffect, useRef, useCallback } from 'react'
import useCaseStore from '../core/caseMachine'

/** @type {Record<string, number>} */
const DEBOUNCE_MS = {
  open:  500,
  swipe: 300,
  pinch: 500,
}

const MIN_CONFIDENCE = {
  open:  0.7,
  swipe: 0.6,
  pinch: 0.7,
}

/**
 * @param {Object} opts
 * @param {string}  opts.gesture    — 当前手势标签
 * @param {number}  opts.confidence — 置信度 0-1
 */
export function useGestureEvents({ gesture, confidence }) {
  const phase = useCaseStore((s) => s.phase)
  const touchMode = useCaseStore((s) => s.touchMode)

  const timerRef   = useRef(null)
  const lastGestureRef = useRef(null)
  const progressRef = useRef(0) // 0-1 进度条

  // 暴露给 UI 的状态
  const stateRef = useRef({
    isDebouncing: false,
    progress: 0,
  })

  const clearDebounce = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    stateRef.current.isDebouncing = false
    stateRef.current.progress = 0
  }, [])

  useEffect(() => {
    if (touchMode) return
    if (gesture === 'none' || confidence < (MIN_CONFIDENCE[gesture] || 0.7)) {
      // 手势丢失或置信度不足，取消防抖
      if (lastGestureRef.current !== 'none') {
        clearDebounce()
        lastGestureRef.current = 'none'
      }
      return
    }

    // 同一手势持续中
    if (gesture === lastGestureRef.current) return

    lastGestureRef.current = gesture

    const ms = DEBOUNCE_MS[gesture] || 500

    // 检查该手势在当前阶段是否有效
    const valid = isValidTrigger(gesture, phase)
    if (!valid) return

    clearDebounce()
    stateRef.current.isDebouncing = true
    stateRef.current.progress = 0

    // 模拟进度更新（用于 UI 显示防抖进度环）
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      stateRef.current.progress = Math.min(elapsed / ms, 1)
      if (elapsed < ms) {
        requestAnimationFrame(tick)
      }
    }
    requestAnimationFrame(tick)

    timerRef.current = setTimeout(() => {
      stateRef.current.isDebouncing = false
      stateRef.current.progress = 0
      lastGestureRef.current = null
      triggerAction(gesture)
    }, ms)
  }, [gesture, confidence, phase, touchMode, clearDebounce])

  useEffect(() => {
    return clearDebounce
  }, [clearDebounce])

  return {
    isDebouncing: stateRef.current.isDebouncing,
    progress: stateRef.current.progress,
  }
}

/**
 * 检查手势在当前阶段是否有效
 */
function isValidTrigger(gesture, phase) {
  const map = {
    open:  ['IDLE'],
    swipe: ['CALIBRATING'],
    pinch: ['SCANNING'],
  }
  return (map[gesture] || []).includes(phase)
}

/**
 * 触发 Zustand action
 */
function triggerAction(gesture) {
  const store = useCaseStore.getState()

  switch (gesture) {
    case 'open':
      store.startCalibration()
      break
    case 'swipe':
      store.triggerResonance()
      break
    case 'pinch': {
      // 选一张随机实体（捏合手势触发）
      const { entities } = store
      if (entities.length > 0) {
        const idx = Math.floor(Math.random() * entities.length)
        store.locateEntity(idx)
      }
      break
    }
  }
}
