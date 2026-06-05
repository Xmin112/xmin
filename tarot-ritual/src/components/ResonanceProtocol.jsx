/**
 * ResonanceProtocol — 阈值共振（洗牌）
 *
 * Control 风格：卡片从虚空飞入，红色能量脉冲，希斯几何碰撞，
 * 最终以 3D 环排列。加入粒子爆发。
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EntityCard from './EntityCard'

function ringPosition(i, total, radius) {
  const angle = (i / total) * Math.PI * 2 - Math.PI / 2
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius * 0.5,
    rotate: (angle * 180) / Math.PI + 90,
    z: Math.sin(angle) * 40,
  }
}

export default function ResonanceProtocol({ entities, onComplete }) {
  const [phase, setPhase] = useState('vortex') // vortex → collapse → ring
  const [hissGlitch, setHissGlitch] = useState(false)
  const r = Math.min(window.innerWidth, window.innerHeight) * 0.35

  useEffect(() => {
    const t1 = setTimeout(() => setHissGlitch(true), 400)
    const t2 = setTimeout(() => { setHissGlitch(false); setPhase('collapse') }, 1200)
    const t3 = setTimeout(() => setPhase('ring'), 2000)
    const t4 = setTimeout(() => onComplete?.(), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [onComplete])

  const total = entities.length

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* 希斯红色脉冲 */}
      <AnimatePresence>
        {hissGlitch && (
          <motion.div className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(139,0,0,0.4), transparent 60%)',
              filter: 'blur(20px)',
            }} />
        )}
      </AnimatePresence>

      {/* 红色扫描线 */}
      <motion.div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          style={{ width: '100%', height: 3, background: 'rgba(192,57,43,0.4)', filter: 'blur(1px)' }}
          animate={{ y: ['-100%', '200%'] }}
          transition={{ duration: 1.5, ease: 'linear', repeat: 2 }}
        />
      </motion.div>

      {/* 状态标签 */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none text-center">
        <AnimatePresence mode="wait">
          <motion.div key={phase}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="fbc-label" style={{ fontSize: 10, letterSpacing: '0.3em' }}>
              {phase === 'vortex' && '⟳ THRESHOLD RESONANCE'}
              {phase === 'collapse' && '◆ ENTITY COLLAPSE'}
              {phase === 'ring' && '◈ MANIFESTATION'}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 卡片动画 */}
      <div className="relative" style={{
        width: r * 2 + 200, height: r * 1.4 + 200,
        perspective: 1000, transformStyle: 'preserve-3d',
      }}>
        {entities.map((entity, i) => {
          const scatterAngle = Math.random() * Math.PI * 2
          const scatterDist = 500 + Math.random() * 400
          const pos = ringPosition(i, total, r)

          return (
            <motion.div key={entity.id} className="absolute"
              style={{ left: '50%', top: '50%', marginLeft: -50, marginTop: -80, zIndex: 10,
                transformStyle: 'preserve-3d' }}
              initial={{
                x: Math.cos(scatterAngle) * scatterDist,
                y: Math.sin(scatterAngle) * scatterDist,
                z: Math.random() * 200 - 100,
                rotate: Math.random() * 720 - 360,
                scale: 0.1, opacity: 0,
              }}
              animate={phase === 'vortex' ? {
                x: (Math.random() - 0.5) * 30,
                y: (Math.random() - 0.5) * 30,
                z: 0, rotate: (Math.random() - 0.5) * 20,
                scale: 0.7, opacity: 1,
              } : phase === 'collapse' ? {
                x: 0, y: 0, z: 0, rotate: 0, scale: 0.3, opacity: 0.5,
              } : {
                x: pos.x, y: pos.y, z: pos.z, rotate: pos.rotate,
                scale: 0.55, opacity: 1,
              }}
              transition={{
                duration: phase === 'vortex' ? 0.5 + Math.random() * 0.3
                  : phase === 'collapse' ? 0.4
                  : 0.8 + i * 0.015,
                delay: phase === 'vortex' ? i * 0.01 : phase === 'ring' ? i * 0.015 : 0,
                ease: phase === 'ring' ? [0.32, 0.72, 0, 1] : 'easeInOut',
              }}
            >
              <EntityCard entity={entity} size="md" />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
