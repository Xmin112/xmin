/**
 * ScanningScreen — 实体定位界面
 *
 * 洗牌完成后，22 张牌以警戒线阵列排列。
 * 捏合选择一张实体。
 */

import { motion } from 'framer-motion'
import EntityCard from './EntityCard'

export default function ScanningScreen({ entities, onSelect, circleRadius }) {
  const r = circleRadius || Math.min(window.innerWidth, window.innerHeight) * 0.32

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* 扫描线效果 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(192,57,43,0.02) 3px, rgba(192,57,43,0.02) 6px)',
        }}
      />

      {/* 卡片阵列（散布） */}
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
              className="absolute cursor-pointer"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: -50,
                marginTop: -80,
                zIndex: 10,
              }}
              initial={{ x, y, rotate: rot, scale: 0.55 }}
              animate={{
                x: x + (Math.random() - 0.5) * 15,
                y: y + (Math.random() - 0.5) * 15,
                rotate: rot,
                scale: 0.6,
              }}
              transition={{
                x: { duration: 2 + Math.random(), repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
                y: { duration: 2 + Math.random(), repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
              }}
              whileHover={{ scale: 0.7, zIndex: 30 }}
              onClick={() => onSelect(i)}
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
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="fbc-label" style={{ fontSize: 9, marginBottom: 6 }}>
          RESONANCE STABILIZED · ENTITIES MANIFESTED
        </div>
        <div style={{
          fontSize: 11,
          color: '#e8e0d5',
          letterSpacing: '0.15em',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          PINCH TO LOCATE ENTITY
        </div>
        <div style={{
          width: 30, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(192,57,43,0.5), transparent)',
          margin: '8px auto 0',
        }} />
        <div className="fbc-label" style={{ fontSize: 7, marginTop: 8 }}>
          OR TAP A CARD DIRECTLY
        </div>
      </motion.div>
    </div>
  )
}
