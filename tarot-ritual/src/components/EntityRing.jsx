/**
 * EntityRing — 3D 卡片环
 *
 * 卡片以 3D 透视排列成环。手指位置驱动旋转。
 * 食指靠近某张卡片时高亮放大。
 *
 * Control 参考：The Board 的倒金字塔 + 物体悬浮感
 *
 * @param {{ entities: Entity[], indexTip: {x:number,y:number}|null, onSelect: (i:number)=>void, mode: 'browse'|'select' }} props
 */

import { useRef, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import EntityCard from './EntityCard'

export default function EntityRing({ entities, indexTip, onSelect, mode }) {
  const total = entities.length
  const containerRef = useRef(null)
  const angleRef = useRef(0)

  // 卡片环布局参数
  const r = Math.min(window.innerWidth, window.innerHeight) * 0.38

  // 根据手指位置计算目标旋转角度
  const targetAngle = useMemo(() => {
    if (!indexTip) return angleRef.current
    // 将归一化 x 坐标 (0-1) 映射到旋转角度
    const mapped = (indexTip.x - 0.5) * Math.PI * 1.5
    return mapped
  }, [indexTip])

  // 计算高亮卡片索引
  const highlightIndex = useMemo(() => {
    if (!indexTip || mode !== 'select') return -1
    // 找到离手指最近的卡片
    let bestIdx = -1, bestDist = Infinity
    for (let i = 0; i < total; i++) {
      const angle = ((i / total) * Math.PI * 2 + targetAngle)
      const cardX = Math.cos(angle) * r
      const cardY = Math.sin(angle) * r * 0.5
      // 手指归一化坐标映射到像素空间
      const fx = (indexTip.x - 0.5) * r * 2
      const fy = (indexTip.y - 0.5) * r * 1.2
      const dist = Math.sqrt((cardX - fx) ** 2 + (cardY - fy) ** 2)
      if (dist < bestDist) { bestDist = dist; bestIdx = i }
    }
    return bestDist < 80 ? bestIdx : -1
  }, [indexTip, targetAngle, mode, r, total])

  const handleCardClick = useCallback((i) => {
    if (mode === 'select') onSelect(i)
  }, [mode, onSelect])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ perspective: 1000, perspectiveOrigin: '50% 50%' }}
    >
      {/* 卡片环 */}
      <div className="relative" style={{
        width: r * 2 + 200, height: r * 1.4 + 200,
        transformStyle: 'preserve-3d',
      }}>
        {entities.map((entity, i) => {
          const baseAngle = (i / total) * Math.PI * 2
          const a = baseAngle + targetAngle
          const rx = Math.cos(a) * r
          const ry = Math.sin(a) * r * 0.5
          const rot = (a * 180) / Math.PI + 90

          // Z 深度：前面的卡片大，后面的小
          const zDepth = Math.sin(a) * 80
          const scale = 0.45 + (Math.sin(a) + 1) * 0.2
          const opacity = 0.4 + (Math.sin(a) + 1) * 0.35
          const isHighlighted = i === highlightIndex

          return (
            <motion.div
              key={entity.id}
              className="absolute cursor-pointer"
              style={{
                left: '50%', top: '50%',
                marginLeft: -50, marginTop: -80,
                zIndex: isHighlighted ? 50 : Math.floor(10 + zDepth * 0.1),
                transformStyle: 'preserve-3d',
              }}
              animate={{
                x: rx, y: ry, z: zDepth,
                rotate: rot,
                scale: isHighlighted ? scale * 1.25 : scale,
                opacity,
                filter: isHighlighted
                  ? 'brightness(1.3) drop-shadow(0 0 12px rgba(192,57,43,0.6))'
                  : 'brightness(0.8)',
              }}
              transition={{
                type: 'spring', stiffness: 60, damping: 20, mass: 0.5,
              }}
              whileHover={{ scale: scale * 1.4, zIndex: 60 }}
              onClick={() => handleCardClick(i)}
            >
              <EntityCard
                entity={entity}
                size="md"
                isSelected={isHighlighted}
              />
            </motion.div>
          )
        })}
      </div>

      {/* 手指光标 */}
      {indexTip && mode === 'select' && (
        <motion.div
          className="fixed pointer-events-none"
          style={{
            width: 24, height: 24,
            zIndex: 100,
          }}
          animate={{
            left: `${indexTip.x * 100}vw`,
            top: `${indexTip.y * 100}vh`,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        >
          {/* 几何准星 */}
          <svg width="24" height="24" viewBox="0 0 24 24">
            <line x1="12" y1="0" x2="12" y2="8" stroke="#c0392b" strokeWidth="1" />
            <line x1="12" y1="16" x2="12" y2="24" stroke="#c0392b" strokeWidth="1" />
            <line x1="0" y1="12" x2="8" y2="12" stroke="#c0392b" strokeWidth="1" />
            <line x1="16" y1="12" x2="24" y2="12" stroke="#c0392b" strokeWidth="1" />
            <circle cx="12" cy="12" r="3" fill="none" stroke="#c0392b" strokeWidth="1" />
          </svg>
        </motion.div>
      )}

      {/* 提示文字 */}
      <div className="absolute top-12 text-center z-20 pointer-events-none">
        <div className="fbc-label" style={{ fontSize: 9 }}>
          {mode === 'browse'
            ? 'SWIPE HAND TO ROTATE · OPEN PALM TO CONTINUE'
            : 'POINT AT CARD · PINCH TO SELECT'
          }
        </div>
      </div>
    </div>
  )
}
