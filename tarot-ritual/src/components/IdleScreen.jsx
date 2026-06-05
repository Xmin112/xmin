/**
 * IdleScreen — 待命界面
 *
 * FBC 终端启动画面：
 *   倒金字塔几何标记 · 打字机闪烁光标 · 全大写文字
 *   摄像头就绪 → 显示"张开手掌"提示
 *   摄像头未就绪 → 5 秒超时后显示手动启动按钮
 *   摄像头被拒 → 显示触控模式入口
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useCaseStore from '../core/caseMachine'

export default function IdleScreen({ isReady, cameraError, onStart, onEnableTouch }) {
  const touchMode = useCaseStore((s) => s.touchMode)
  const [showFallback, setShowFallback] = useState(false)

  // 5 秒超时：如果摄像头还没就绪，显示手动按钮
  useEffect(() => {
    if (isReady || touchMode) return
    const t = setTimeout(() => setShowFallback(true), 5000)
    return () => clearTimeout(t)
  }, [isReady, touchMode])

  let statusText
  if (touchMode) {
    statusText = 'TOUCH CONTROL MODE ACTIVE'
  } else if (cameraError === 'CAMERA_DENIED') {
    statusText = 'CAMERA ACCESS DENIED'
  } else if (isReady) {
    statusText = 'PLACE OPEN PALM TOWARD CAMERA'
  } else if (showFallback) {
    statusText = 'CAMERA NOT DETECTED · USE BUTTON BELOW'
  } else {
    statusText = 'INITIALIZING SURVEILLANCE...'
  }

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center gap-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      {/* 倒金字塔几何标记 */}
      <div className="relative" style={{ width: 80, height: 80 }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: `1px solid ${isReady ? 'rgba(192,57,43,0.4)' : 'rgba(192,57,43,0.15)'}`,
          transition: 'border-color 0.5s ease',
        }} />
        <motion.div
          style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 0, height: 0,
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderBottom: '34px solid rgba(192,57,43,0.15)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 4, height: 4,
            background: isReady ? '#c0392b' : '#6b6b6b',
            transform: 'translate(-50%, -50%)',
            transition: 'background 0.5s ease',
          }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* 标题 */}
      <div className="text-center flex flex-col items-center gap-3">
        <h1 style={{
          fontSize: 28, fontWeight: 700, letterSpacing: '0.5em',
          color: '#e8e0d5', fontFamily: "'JetBrains Mono', monospace",
          textTransform: 'uppercase',
        }}>
          TAROT
        </h1>
        <div style={{
          width: 60, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(192,57,43,0.6), transparent)',
        }} />
        <div className="fbc-label" style={{ fontSize: 9, marginTop: 4 }}>
          FBC PARANATURAL DIVISION
        </div>
      </div>

      {/* 操作提示 */}
      <div className="text-center flex flex-col items-center gap-5">
        <div className="fbc-label" style={{ fontSize: 8 }}>
          THRESHOLD ENTITY ARCHIVE ACCESS
        </div>
        <div style={{
          fontSize: 10, color: '#6b6b6b', letterSpacing: '0.1em',
          fontFamily: "'JetBrains Mono', monospace",
          maxWidth: 320, lineHeight: 1.6,
        }}>
          {statusText}
        </div>

        {/* 闪烁光标（仅摄像头就绪时显示） */}
        {isReady && !touchMode && (
          <motion.div
            style={{ width: 12, height: 2, background: '#c0392b' }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}

        {/* 摄像头未就绪时的加载指示器 */}
        {!isReady && !touchMode && !showFallback && !cameraError && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={{ width: 4, height: 4, background: '#c0392b' }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
        )}

        {/* 手动启动按钮（触控模式 / 超时回退） */}
        {(touchMode || showFallback) && (
          <motion.button
            className="fbc-btn" onClick={onStart}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: 11 }}
          >
            INITIATE CALIBRATION
          </motion.button>
        )}

        {/* 摄像头被拒 → 触控模式按钮 */}
        {cameraError === 'CAMERA_DENIED' && !touchMode && (
          <motion.button
            className="fbc-btn" onClick={onEnableTouch}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: 11, borderColor: 'rgba(201,169,110,0.5)', color: '#c9a96e' }}
          >
            ENABLE TOUCH CONTROL
          </motion.button>
        )}
      </div>

      {/* 底部 FBC 标识 */}
      <div className="absolute bottom-12 text-center">
        <div className="fbc-label" style={{ fontSize: 6 }}>
          FEDERAL BUREAU OF CONTROL · PARANATURAL RESEARCH DIVISION
        </div>
        <div className="fbc-label" style={{ fontSize: 6, marginTop: 2 }}>
          ENTITY TYPE: THRESHOLD · CASE 22 · CLEARANCE LEVEL 5
        </div>
      </div>
    </motion.div>
  )
}
