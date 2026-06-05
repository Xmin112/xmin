/**
 * SurveillanceFeed — FBC 监控画面
 *
 * Control 美学摄像头组件：
 *   - 方形画面 + L 形准星角标
 *   - 红色细线手骨叠加层
 *   - 状态指示（闪烁红 = 未检测 / 稳定红 = 锁定）
 *   - 希斯失真效果（检测到手势时短暂红移）
 *
 * @param {Object} props
 * @param {boolean} props.isActive
 * @param {string}  props.gesture
 * @param {number}  props.confidence
 * @param {boolean} props.isDebouncing
 * @param {Array<{x:number,y:number,z:number}>|null} props.landmarks
 */

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// MediaPipe 手部连接线定义（21个关键点之间的边）
const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],       // 拇指
  [0,5],[5,6],[6,7],[7,8],       // 食指
  [0,9],[9,10],[10,11],[11,12],  // 中指
  [0,13],[13,14],[14,15],[15,16],// 无名指
  [0,17],[17,18],[18,19],[19,20],// 小指
  [5,9],[9,13],[13,17],          // 手掌
]

export default function SurveillanceFeed({
  isActive, gesture, confidence, isDebouncing, landmarks,
}) {
  const skeletonCanvasRef = useRef(/** @type {HTMLCanvasElement | null} */ (null))

  // 绘制手骨叠加层
  useEffect(() => {
    const canvas = skeletonCanvasRef.current
    if (!canvas || !landmarks) {
      // 清除画布
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx?.clearRect(0, 0, canvas.width, canvas.height)
      }
      return
    }

    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height

    ctx.clearRect(0, 0, w, h)

    // 绘制连线
    ctx.strokeStyle = 'rgba(192, 57, 43, 0.6)'
    ctx.lineWidth = 1.5

    for (const [i, j] of CONNECTIONS) {
      const a = landmarks[i]
      const b = landmarks[j]
      if (!a || !b) continue

      ctx.beginPath()
      ctx.moveTo(a.x * w, a.y * h)
      ctx.lineTo(b.x * w, b.y * h)
      ctx.stroke()
    }

    // 绘制关键点
    for (const lm of landmarks) {
      if (!lm) continue
      const x = lm.x * w
      const y = lm.y * h

      ctx.beginPath()
      ctx.arc(x, y, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(192, 57, 43, 0.9)'
      ctx.fill()
    }
  }, [landmarks])

  if (!isActive) return null

  const isLocked = gesture !== 'none' && confidence >= 0.4

  return (
    <div className="relative" style={{ width: 280, height: 210 }}>
      {/* 视频画面由 BioCalibration 托管，此处只渲染叠加层 */}

      {/* 希斯红移效果 */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgba(139, 0, 0, 0.08)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* 手骨叠加层 */}
      <canvas
        ref={skeletonCanvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ transform: 'scaleX(-1)' }}
        width={280}
        height={210}
      />

      {/* L 形准星角标 */}
      <div className="retical-corner tl" style={{ borderColor: isLocked ? '#c0392b' : 'rgba(192,57,43,0.3)' }} />
      <div className="retical-corner tr" style={{ borderColor: isLocked ? '#c0392b' : 'rgba(192,57,43,0.3)' }} />
      <div className="retical-corner bl" style={{ borderColor: isLocked ? '#c0392b' : 'rgba(192,57,43,0.3)' }} />
      <div className="retical-corner br" style={{ borderColor: isLocked ? '#c0392b' : 'rgba(192,57,43,0.3)' }} />

      {/* 中央扫描环 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="rounded-full transition-all duration-300"
          style={{
            width: 50,
            height: 50,
            border: `1px solid ${isLocked ? '#c0392b' : 'rgba(192,57,43,0.2)'}`,
            animation: isLocked ? 'blink 1.5s ease-in-out infinite' : 'none',
          }}
        />
      </div>

      {/* 防抖进度环 */}
      <AnimatePresence>
        {isDebouncing && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <svg width="70" height="70" viewBox="0 0 70 70">
              <circle
                cx="35" cy="35" r="32"
                fill="none"
                stroke="rgba(192,57,43,0.15)"
                strokeWidth="1.5"
              />
              <motion.circle
                cx="35" cy="35" r="32"
                fill="none"
                stroke="#c0392b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32}`}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: gesture === 'swipe' ? 0.3 : 0.5, ease: 'linear' }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '35px 35px' }}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 状态指示文字 */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1"
        style={{
          background: 'rgba(0,0,0,0.7)',
          border: `1px solid ${isLocked ? 'rgba(192,57,43,0.6)' : 'rgba(107,107,107,0.3)'}`,
          fontSize: 9,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: isLocked ? '#e8e0d5' : '#6b6b6b',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {gesture === 'none' && 'STANDING BY'}
        {gesture === 'open' && 'PALM DETECTED'}
        {gesture === 'pinch' && 'PINCH LOCK'}
        {gesture === 'swipe' && 'SWIPE REGISTERED'}
      </div>

      {/* 顶部扫描线 */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: '100%' }}>
        <div
          style={{
            width: '100%',
            height: 1,
            background: 'rgba(192,57,43,0.2)',
            animation: 'scanline-move 3s linear infinite',
          }}
        />
      </div>
    </div>
  )
}
