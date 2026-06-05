/**
 * EntityCard — FBC 塔罗实体卡片
 *
 * 正面：经典 Rider-Waite 塔罗牌贴图
 * 背面：FBC 机密档案设计（红色几何 + CLASSIFIED 印章）
 */

import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const SIZES = {
  sm:  { w: 70,  h: 118 },
  md:  { w: 100, h: 168 },
  lg:  { w: 140, h: 235 },
}

/**
 * 获取卡片贴图 URL
 * 经典 Rider-Waite-Smith 塔罗牌（公有领域）
 */
function cardImageUrl(entityId) {
  const n = String(entityId).padStart(2, '0')
  return `/cards/major_${n}.png`
}

const EntityCard = forwardRef(({ entity, isFlipped, size = 'md', isSelected, onClick, className = '' }, ref) => {
  const { w, h } = SIZES[size]

  return (
    <motion.div
      ref={ref}
      className={`cursor-pointer ${className}`}
      style={{
        width: w, height: h,
        transformStyle: 'preserve-3d',
      }}
      onClick={onClick}
      animate={isSelected ? {
        boxShadow: [
          '0 0 0px rgba(192,57,43,0)',
          '0 0 20px rgba(192,57,43,0.5)',
          '0 0 0px rgba(192,57,43,0)',
        ],
      } : {}}
      transition={isSelected ? { boxShadow: { repeat: Infinity, duration: 2 } } : {}}
    >
      <motion.div style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', position: 'relative' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}>
        {/* ── 正面：塔罗牌贴图 ── */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          border: '1px solid rgba(192,57,43,0.3)',
          overflow: 'hidden',
        }}>
          <img
            src={cardImageUrl(entity.id)}
            alt={entity.nameEn}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              // 图片加载失败时显示 emoji 回退
              e.target.style.display = 'none'
              e.target.parentElement.style.display = 'flex'
              e.target.parentElement.style.alignItems = 'center'
              e.target.parentElement.style.justifyContent = 'center'
              e.target.parentElement.style.background = '#0a0a10'
              e.target.parentElement.innerHTML = `<div style="text-align:center;padding:20%"><div style="font-size:${w*0.3}px;line-height:1">${entity.emoji}</div><div style="font-size:${Math.max(7,w*0.06)}px;color:#e8e0d5;margin-top:4px;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:0.1em">${entity.codename}</div></div>`
            }}
          />
        </div>

        {/* ── 背面：FBC 机密档案设计 ── */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'linear-gradient(135deg, #0d0d14 0%, #12121f 40%, #0a0a10 100%)',
          border: '1px solid rgba(192,57,43,0.35)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {/* 外层安全框 */}
          <div style={{
            position: 'absolute', inset: 5,
            border: '1px solid rgba(192,57,43,0.2)',
          }} />
          {/* 内层几何装饰 */}
          <div style={{
            position: 'absolute', inset: 10,
            border: '1px solid rgba(192,57,43,0.08)',
            transform: 'rotate(45deg)',
            width: 'calc(100% - 20px)',
            height: 'calc(100% - 20px)',
          }} />

          {/* FBC 鹰徽 — 简化几何三角 */}
          <div className="relative" style={{ marginBottom: 6 }}>
            {/* 三角 */}
            <svg width={w * 0.28} height={w * 0.28} viewBox="0 0 40 40">
              {/* 外三角 */}
              <polygon points="20,4 36,32 4,32"
                fill="none" stroke="rgba(192,57,43,0.4)" strokeWidth="1" />
              {/* 内三角（倒） */}
              <polygon points="20,28 30,10 10,10"
                fill="none" stroke="rgba(192,57,43,0.2)" strokeWidth="0.5" />
              {/* 中心点 */}
              <circle cx="20" cy="20" r="2" fill="rgba(192,57,43,0.6)" />
              {/* 放射线 */}
              <line x1="20" y1="20" x2="20" y2="6" stroke="rgba(192,57,43,0.15)" strokeWidth="0.5" />
              <line x1="20" y1="20" x2="34" y2="28" stroke="rgba(192,57,43,0.15)" strokeWidth="0.5" />
              <line x1="20" y1="20" x2="6" y2="28" stroke="rgba(192,57,43,0.15)" strokeWidth="0.5" />
            </svg>
          </div>

          {/* CLASSIFIED 印章 */}
          <div style={{
            padding: '2px 8px',
            border: '1px solid rgba(192,57,43,0.5)',
            color: '#c0392b',
            fontSize: Math.max(6, w * 0.065),
            fontWeight: 700,
            letterSpacing: '0.25em',
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>
            CLASSIFIED
          </div>

          {/* 安全等级 */}
          <div style={{
            fontSize: Math.max(5, w * 0.05),
            color: 'rgba(107,107,107,0.6)',
            letterSpacing: '0.15em',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {entity.classification}
          </div>

          {/* 底部实体编号 */}
          <div style={{
            position: 'absolute',
            bottom: h * 0.08,
            fontSize: Math.max(5, w * 0.055),
            color: 'rgba(192,57,43,0.3)',
            letterSpacing: '0.2em',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {entity.designation}
          </div>

          {/* 红色安全条纹（上下） */}
          <div style={{
            position: 'absolute', top: 8, left: 5, right: 5,
            height: 2,
            background: 'repeating-linear-gradient(90deg, #8b0000 0px, #8b0000 6px, transparent 6px, transparent 10px)',
          }} />
          <div style={{
            position: 'absolute', bottom: 8, left: 5, right: 5,
            height: 2,
            background: 'repeating-linear-gradient(90deg, #8b0000 0px, #8b0000 6px, transparent 6px, transparent 10px)',
          }} />
        </div>
      </motion.div>
    </motion.div>
  )
})

EntityCard.displayName = 'EntityCard'
export default EntityCard
