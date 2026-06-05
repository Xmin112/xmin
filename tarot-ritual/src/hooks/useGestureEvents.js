/**
 * useGestureEvents — 手势→状态机桥接 Hook
 *
 * 防抖 + 手势→阶段映射。返回响应式状态供 UI 反馈使用。
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import useCaseStore from '../core/caseMachine'

const DEBOUNCE_MS = { open: 400, swipe: 200, pinch: 400 }
const MIN_CONFIDENCE = { open: 0.4, swipe: 0.4, pinch: 0.5 }

export function useGestureEvents({ gesture, confidence }) {
  const phase     = useCaseStore((s) => s.phase)
  const touchMode = useCaseStore((s) => s.touchMode)

  const timerRef   = useRef(null)
  const lastGestureRef = useRef('none')
  const [isDebouncing, setIsDebouncing] = useState(false)
  const [progress, setProgress] = useState(0)

  const clearDebounce = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsDebouncing(false)
    setProgress(0)
  }, [])

  useEffect(() => {
    if (touchMode) return

    // 手势丢失或置信度不足 → 取消防抖
    const minConf = MIN_CONFIDENCE[gesture] || 0.5
    if (gesture === 'none' || confidence < minConf) {
      if (lastGestureRef.current !== 'none') {
        clearDebounce()
        lastGestureRef.current = 'none'
      }
      return
    }

    // 同一手势持续中，不重复触发
    if (gesture === lastGestureRef.current) return

    // 新手势出现
    lastGestureRef.current = gesture

    const ms = DEBOUNCE_MS[gesture] || 400
    if (!isValidTrigger(gesture, phase)) return

    clearDebounce()
    setIsDebouncing(true)
    setProgress(0)

    // 进度动画
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const p = Math.min(elapsed / ms, 1)
      setProgress(p)
      if (p < 1 && timerRef.current !== null) {
        requestAnimationFrame(tick)
      }
    }
    requestAnimationFrame(tick)

    timerRef.current = setTimeout(() => {
      setIsDebouncing(false)
      setProgress(0)
      lastGestureRef.current = 'none'
      triggerAction(gesture)
    }, ms)
  }, [gesture, confidence, phase, touchMode, clearDebounce])

  useEffect(() => clearDebounce, [clearDebounce])

  return { isDebouncing, progress }
}

const VALID_MAP = { open: ['IDLE'], swipe: ['CALIBRATING'], pinch: ['SCANNING'] }

function isValidTrigger(g, p) { return (VALID_MAP[g] || []).includes(p) }

function triggerAction(gesture) {
  const store = useCaseStore.getState()
  console.log('[FBC::GESTURE] 触发:', gesture, '当前阶段:', store.phase)
  switch (gesture) {
    case 'open':
      store.startCalibration()
      break
    case 'swipe':
      store.triggerResonance()
      break
    case 'pinch': {
      const ents = store.entities
      if (ents.length > 0) {
        store.locateEntity(Math.floor(Math.random() * ents.length))
      }
      break
    }
  }
}
