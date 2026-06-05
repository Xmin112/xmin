/**
 * CalibratingScreen — 生物特征校准界面
 *
 * 手掌已确认，显示手势指引 + 实体卡片圆形阵列（缓慢旋转）
 */

import { motion } from 'framer-motion'
import EntityCard from './EntityCard'

export default function CalibratingScreen({ entities, circleRadius }) {
  const r = circleRadius || Math.min(window.innerWidth, window.innerHeight) * 0.32

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* 圆形卡片阵列 */}
      <div
        className="relative"
        style={{
          width: r * 2 + 200,
          height: r * 2 + 200,
          perspective: 1200,
        }}
      >
        {entities.map((entity, i) => {
          const angle = (i / entities.length) * Math.PI * 2 - Math.PI / 2
          const x = Math.cos(angle) * r
          const y = Math.sin(angle) * r * 0.65
          const rot = (angle * 180) / Math.PI + 90

          return (
            <motion.div
              key={entity.id}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: -50,
                marginTop: -80,
                zIndex: 10,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                x, y,
                rotate: rot,
                opacity: 1,
                scale: 0.55,
                rotateY: 10,
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.02,
                ease: [0.32, 0.72, 0, 1],
              }}
            >
              <EntityCard entity={entity} size="md" />
            </motion.div>
          )
        })}
      </div>

      {/* 手势指引 */}
      <motion.div
        className="absolute top-12 text-center z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="fbc-label" style={{ fontSize: 9, marginBottom: 6 }}>
          BIOMETRIC CALIBRATION COMPLETE
        </div>
        <div style={{
          fontSize: 11,
          color: '#e8e0d5',
          letterSpacing: '0.15em',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          SWIPE UPWARD TO INITIATE RESONANCE
        </div>
        <div style={{
          width: 30, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(192,57,43,0.5), transparent)',
          margin: '8px auto 0',
        }} />
      </motion.div>

      {/* 阵列旋转标记 */}
      <div className="absolute bottom-20 text-center z-20">
        <motion.div
          className="fbc-label"
          style={{ fontSize: 7 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          AWAITING THRESHOLD RESONANCE SIGNAL
        </motion.div>
      </div>
    </div>
  )
}
