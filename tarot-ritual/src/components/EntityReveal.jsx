/**
 * EntityReveal — 实体档案解锁动画
 *
 * Control 美学卡片揭示：
 *   1. 选中卡片飞入中央
 *   2. 红色扫描线 + 希斯失真
 *   3. 3D rotateY 翻转 180°
 *   4. 红条展开 + 档案内容逐行打字机式出现
 *   5. 完成回调
 *
 * @param {Object} props
 * @param {import('../data/entities').Entity} props.entity
 * @param {'stable'|'decayed'} props.orientation
 * @param {()=>void} props.onComplete
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EntityCard from './EntityCard'

export default function EntityReveal({ entity, orientation, onComplete }) {
  const [stage, setStage] = useState('flyIn') // flyIn → scan → flip → content → done

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage('scan'),   600),
      setTimeout(() => setStage('flip'),   1400),
      setTimeout(() => setStage('content'), 2000),
      setTimeout(() => { setStage('done'); onComplete?.() }, 3800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  const formLabel = orientation === 'stable' ? 'STABLE FORM' : 'DECAYED FORM'
  const formText = orientation === 'stable' ? entity.stableForm : entity.decayedForm

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden fbc-scanline">
      {/* 背景红移 */}
      <AnimatePresence>
        {stage !== 'done' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 40%, rgba(139,0,0,0.08), transparent 60%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* 卡片动画区域 */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* 卡片：飞入 + 翻转 */}
        <motion.div
          layoutId={`entity-${entity.id}`}
          initial={{ scale: 0.6, y: 200, opacity: 0 }}
          animate={stage === 'flyIn'
            ? { scale: 1.15, y: -40, opacity: 1 }
            : stage === 'scan'
              ? { scale: 1.15, y: -40, x: [0, -3, 3, -1, 0] } // 希斯抖动
              : { scale: 1.1, y: -30, opacity: 1 }
          }
          transition={
            stage === 'scan'
              ? { x: { duration: 0.15, repeat: 3, ease: 'steps(2)' } }
              : { duration: 0.5, ease: [0.32, 0.72, 0, 1] }
          }
        >
          <EntityCard
            entity={entity}
            isFlipped={stage === 'flip' || stage === 'content' || stage === 'done'}
            size="lg"
          />
        </motion.div>

        {/* 扫描线效果 */}
        <AnimatePresence>
          {stage === 'scan' && (
            <motion.div
              className="absolute top-0 left-0 right-0 pointer-events-none"
              initial={{ height: '0%' }}
              animate={{ height: '100%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'linear' }}
              style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(192,57,43,0.3) 50%, transparent 100%)',
                top: '50%',
                transform: 'translateY(-50%)',
                height: 4,
              }}
            />
          )}
        </AnimatePresence>

        {/* 档案内容渐进显示 */}
        <AnimatePresence>
          {(stage === 'content' || stage === 'done') && (
            <motion.div
              className="fbc-panel px-6 py-5 max-w-md flex flex-col gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* 红条标题 */}
              <div className="fbc-header -mx-6 -mt-5 mb-1" style={{ fontSize: 10 }}>
                ARCHIVE DOSSIER: {entity.designation}
              </div>

              {/* 代号 */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div style={{
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: '#e8e0d5',
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: 'uppercase',
                }}>
                  {entity.codename}
                </div>
              </motion.div>

              {/* 形态标识 */}
              <motion.div
                className="flex items-center justify-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="fbc-label" style={{ fontSize: 8 }}>
                  ENTITY STATUS
                </div>
                <div
                  className="fbc-stamp"
                  style={{
                    borderColor: orientation === 'stable' ? 'rgba(201,169,110,0.6)' : 'rgba(192,57,43,0.8)',
                    color: orientation === 'stable' ? '#c9a96e' : '#c0392b',
                  }}
                >
                  {formLabel}
                </div>
              </motion.div>

              {/* 形态描述 */}
              <motion.div
                className="fbc-typewriter"
                style={{ fontSize: 10, color: '#e8e0d5', lineHeight: 1.9 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {formText}
              </motion.div>

              {/* 标签 */}
              <motion.div
                className="flex gap-2 flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                {entity.tags.map((tag, i) => (
                  <span key={i} className="fbc-stamp">{tag}</span>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
