/**
 * ResonanceProtocol — 阈值共振（洗牌）动画
 *
 * FBC 档案风格：22 张 CLASSIFIED 卡片从散落状态
 * 经快速旋转震荡后排列为圆形阵列。
 *
 * Control 美学：锐利几何运动，红色拖影，最终排列成
 * 类似"倒金字塔"的圆形仪式阵列。
 *
 * @param {Object} props
 * @param {import('../data/entities').Entity[]} props.entities
 * @param {()=>void} props.onComplete
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EntityCard from './EntityCard'

function ringPosition(index, total, radius) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius * 0.65, // 椭圆
    rotate: (angle * 180) / Math.PI + 90,
  }
}

export default function ResonanceProtocol({ entities, onComplete }) {
  const [phase, setPhase] = useState('scatter') // scatter → vortex → ring
  const radius = Math.min(window.innerWidth, window.innerHeight) * 0.35

  // 阶段切换
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('vortex'), 100)
    const t2 = setTimeout(() => setPhase('ring'), 1400)
    const t3 = setTimeout(() => onComplete?.(), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  const scatterProps = useCallback((i, total) => {
    const angle = Math.random() * Math.PI * 2
    const dist = 600 + Math.random() * 500
    return {
      initial: {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        rotate: (Math.random() - 0.5) * 720,
        scale: 0.3,
        opacity: 0,
      },
      animate: phase === 'scatter'
        ? {
            x: (Math.random() - 0.5) * 20,
            y: (Math.random() - 0.5) * 20,
            rotate: (Math.random() - 0.5) * 15,
            scale: 1,
            opacity: 1,
          }
        : phase === 'vortex'
          ? { rotate: 360 * (i % 2 ? 1 : -1), scale: 0.5, opacity: 0.7 }
          : (() => {
              const pos = ringPosition(i, total, radius)
              return { x: pos.x, y: pos.y, rotate: pos.rotate, scale: 0.55, opacity: 1 }
            })(),
      transition: phase === 'scatter'
        ? { duration: 0.6 + Math.random() * 0.3, delay: i * 0.015, ease: [0.87, 0, 0.13, 1] }
        : phase === 'vortex'
          ? { duration: 0.6, delay: i * 0.01, ease: 'easeInOut' }
          : { duration: 1.0, delay: i * 0.015, ease: [0.32, 0.72, 0, 1] },
    }
  }, [phase, radius])

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* 希斯红色干扰背景 */}
      <AnimatePresence>
        {phase === 'vortex' && (
          <motion.div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at 50% 50%, rgba(139,0,0,0.15), transparent 70%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* 状态标识 */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <div className="fbc-label" style={{ fontSize: 9, marginBottom: 8 }}>
              {phase === 'scatter' && 'INITIATING RESONANCE'}
              {phase === 'vortex' && 'THRESHOLD OSCILLATION'}
              {phase === 'ring' && 'ENTITY MANIFESTATION'}
            </div>
            <div style={{
              width: 40, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(192,57,43,0.6), transparent)',
              margin: '0 auto',
            }} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 卡片阵列 */}
      <div
        className="relative"
        style={{
          width: radius * 2 + 200,
          height: radius * 2 + 200,
          transformStyle: 'preserve-3d',
        }}
      >
        {entities.map((entity, i) => {
          const props = scatterProps(i, entities.length)
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
              initial={props.initial}
              animate={props.animate}
              transition={props.transition}
            >
              <EntityCard entity={entity} size="md" />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
