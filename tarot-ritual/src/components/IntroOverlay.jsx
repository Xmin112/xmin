/**
 * IntroOverlay — 入场动画层 + 跳过按钮
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function IntroOverlay({ onDismiss }) {
  const [visible, setVisible] = useState(true)

  const dismiss = () => { setVisible(false); onDismiss?.() }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div className="fixed inset-0 z-[900] flex flex-col items-center justify-center gap-10"
          style={{ background: '#050508' }}
          exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          {/* 倒金字塔 */}
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg width="80" height="80" viewBox="0 0 80 80">
              <polygon points="40,10 70,65 10,65" fill="none" stroke="#c0392b" strokeWidth="1" />
              <circle cx="40" cy="48" r="4" fill="none" stroke="#c0392b" strokeWidth="1" />
            </svg>
          </motion.div>

          {/* 文字 */}
          <motion.div className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}>
            <div style={{ fontSize: 14, letterSpacing: '0.4em', color: '#e8e0d5', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
              FEDERAL BUREAU OF CONTROL
            </div>
            <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#6b6b6b', marginTop: 8 }}>
              PARANATURAL RESEARCH DIVISION · CASE FILE 22
            </div>
          </motion.div>

          {/* 跳过按钮 */}
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
            onClick={dismiss}
            style={{
              background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)',
              color: '#6b6b6b', padding: '8px 24px', cursor: 'pointer',
              fontSize: 10, letterSpacing: '0.2em', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase',
            }}>
            [ SKIP ]
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
