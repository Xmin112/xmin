/**
 * GestureCursor — 隐藏摄像头 + 手指标映射 + 发光光标
 *
 * 摄像头视频隐藏（1x1 px），MediaPipe 处理后，
 * 屏幕上渲染一个发光准星光标跟随食指位置。
 * 捏合时光标放大 + 变红。
 */

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function GestureCursor({
  videoRef, indexTip, gesture, confidence, isReady, error,
}) {
  // video 元素由 App.jsx 管理（始终在 DOM）
  return (
    <>

      {/* 发光光标 */}
      {isReady && indexTip && (
        <motion.div className="fixed pointer-events-none"
          style={{
            width: 32, height: 32,
            zIndex: 500,
            filter: gesture === 'pinch'
              ? 'drop-shadow(0 0 12px rgba(192,57,43,0.9)) drop-shadow(0 0 24px rgba(192,57,43,0.4))'
              : 'drop-shadow(0 0 6px rgba(232,224,213,0.3))',
          }}
          animate={{
            left: `${indexTip.x * 100}vw`,
            top: `${indexTip.y * 100}vh`,
            scale: gesture === 'pinch' ? 1.5 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32">
            {/* 外环 */}
            <circle cx="16" cy="16" r="12" fill="none"
              stroke={gesture === 'pinch' ? '#c0392b' : 'rgba(232,224,213,0.5)'}
              strokeWidth="1" />
            {/* 十字 */}
            <line x1="16" y1="4" x2="16" y2="10" stroke={gesture === 'pinch' ? '#c0392b' : 'rgba(232,224,213,0.3)'} strokeWidth="1" />
            <line x1="16" y1="22" x2="16" y2="28" stroke={gesture === 'pinch' ? '#c0392b' : 'rgba(232,224,213,0.3)'} strokeWidth="1" />
            <line x1="4" y1="16" x2="10" y2="16" stroke={gesture === 'pinch' ? '#c0392b' : 'rgba(232,224,213,0.3)'} strokeWidth="1" />
            <line x1="22" y1="16" x2="28" y2="16" stroke={gesture === 'pinch' ? '#c0392b' : 'rgba(232,224,213,0.3)'} strokeWidth="1" />
            {/* 中心点 */}
            <circle cx="16" cy="16" r="2.5"
              fill={gesture === 'pinch' ? '#c0392b' : 'rgba(232,224,213,0.5)'} />
          </svg>
        </motion.div>
      )}

      {/* 摄像头未就绪指示 */}
      {!isReady && !error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
          style={{ fontSize: 9, color: '#6b6b6b', letterSpacing: '0.2em', fontFamily: "'JetBrains Mono', monospace" }}>
          INITIALIZING CAMERA...
        </div>
      )}

      {/* 摄像头错误 */}
      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2"
          style={{ background: 'rgba(100,0,0,0.8)', border: '1px solid rgba(192,57,43,0.4)', fontSize: 9, color: '#ff4444', fontFamily: "'JetBrains Mono', monospace" }}>
          CAMERA ERROR · TAP TO USE TOUCH MODE
        </div>
      )}
    </>
  )
}
