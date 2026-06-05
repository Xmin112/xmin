/**
 * AnalysisScreen — 星界分析加载界面
 *
 * Gemini API 调用期间显示：
 *   已揭示的卡片 · 加载动画（FBC 数据流式） · 闪烁进度指示
 *
 * @param {Object} props
 * @param {import('../data/entities').Entity} props.entity
 * @param {'stable'|'decayed'} props.orientation
 */

import { motion } from 'framer-motion'
import EntityCard from './EntityCard'

export default function AnalysisScreen({ entity, orientation }) {
  const formLabel = orientation === 'stable' ? 'STABLE FORM' : 'DECAYED FORM'

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 overflow-hidden">
      {/* 卡片 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <EntityCard entity={entity} isFlipped={true} size="lg" />
      </motion.div>

      {/* 实体标识 */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div style={{
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: '0.2em',
          color: '#e8e0d5',
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: 'uppercase',
        }}>
          {entity.codename}
        </div>
        <div className="fbc-label mt-2" style={{ fontSize: 8 }}>
          [{entity.designation}] · {formLabel}
        </div>
      </motion.div>

      {/* 分析进度 */}
      <motion.div
        className="fbc-panel px-8 py-4 flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="fbc-label" style={{ fontSize: 9 }}>
          ASTRAL ANALYSIS IN PROGRESS
        </div>

        {/* 数据流式进度条 */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              style={{
                width: 6,
                height: 16,
                background: '#c0392b',
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                height: [8, 16, 8],
              }}
              transition={{
                duration: 1,
                delay: i * 0.08,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div style={{
          fontSize: 8,
          color: '#6b6b6b',
          letterSpacing: '0.1em',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          CROSS-REFERENCING DIMENSIONAL ARCHIVE...
        </div>
      </motion.div>

      {/* 希斯扫描线 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 3px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.02, 0.04, 0.02] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  )
}
