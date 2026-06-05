/**
 * LoadingScreen — 全屏加载遮罩 + 渐变进度条
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(t); setTimeout(() => { setVisible(false); onComplete?.() }, 300); return 100 }
        return p + Math.random() * 15 + 5
      })
    }, 200)
    return () => clearInterval(t)
  }, [onComplete])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-8"
          style={{ background: '#050508' }}
          exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '0.5em', color: '#e8e0d5', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
            TAROT
          </div>
          <div style={{ width: 240, height: 2, background: 'rgba(107,107,107,0.2)' }}>
            <motion.div style={{ height: '100%', background: 'linear-gradient(90deg, #c0392b, #e8e0d5)' }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.15 }} />
          </div>
          <div style={{ fontSize: 9, color: '#6b6b6b', letterSpacing: '0.2em', fontFamily: "'JetBrains Mono', monospace" }}>
            INITIALIZING FBC ARCHIVE · {Math.floor(progress)}%
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
