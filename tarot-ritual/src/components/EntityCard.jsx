/**
 * EntityCard — FBC 机密档案卡片
 *
 * 双面 3D 卡片：
 *   正面（卡背）= [[CLASSIFIED]] 机密印章 + 红色安全条纹
 *   背面（卡面）= FBC 档案页：红条标题 + 实体编号 + 属性分类
 *
 * @param {Object} props
 * @param {import('../data/entities').Entity} props.entity
 * @param {boolean} props.isFlipped
 * @param {'sm'|'md'|'lg'}  [props.size='md']
 * @param {boolean} [props.isSelected]
 * @param {()=>void} [props.onClick]
 * @param {string} [props.className]
 */

import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const SIZES = {
  sm:  { w: 70,  h: 110, emoji: 24, title: 7,  detail: 6  },
  md:  { w: 100, h: 160, emoji: 32, title: 8,  detail: 7  },
  lg:  { w: 140, h: 220, emoji: 42, title: 10, detail: 8  },
}

const EntityCard = forwardRef(({ entity, isFlipped, size = 'md', isSelected, onClick, className = '' }, ref) => {
  const { w, h, emoji, title, detail } = SIZES[size]

  return (
    <motion.div
      ref={ref}
      className={`entity-card cursor-pointer ${className}`}
      style={{ width: w, height: h }}
      onClick={onClick}
      whileHover={!isFlipped ? {} : { scale: 1.03 }}
      animate={isSelected ? {
        boxShadow: [
          '0 0 0px rgba(192,57,43,0)',
          '0 0 20px rgba(192,57,43,0.4)',
          '0 0 0px rgba(192,57,43,0)',
        ],
      } : {}}
      transition={isSelected ? {
        boxShadow: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
      } : {}}
    >
      <motion.div
        className="entity-card-inner"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
      >
        {/* ─── 正面：CLASSIFIED 卡背 ─── */}
        <div className="card-face card-classified" style={{ width: w, height: h }}>
          <div className="card-classified-lines" />

          {/* FBC 鹰徽章（简化为几何三角） */}
          <div className="relative mb-3" style={{ fontSize: emoji }}>
            <div style={{
              width: emoji * 1.2, height: emoji * 1.2,
              border: '1px solid rgba(192,57,43,0.3)',
              transform: 'rotate(45deg)',
              position: 'absolute',
              top: '50%', left: '50%',
              marginLeft: -(emoji * 0.6),
              marginTop: -(emoji * 0.6),
            }} />
            <span style={{ position: 'relative', zIndex: 1 }}>
              ▲
            </span>
          </div>

          {/* CLASSIFIED 印章 */}
          <div className="fbc-stamp" style={{ fontSize: Math.max(6, w * 0.07), marginBottom: 4 }}>
            CLASSIFIED
          </div>

          {/* 安全等级 */}
          <div className="fbc-label" style={{ fontSize: Math.max(5, w * 0.06), marginBottom: 8 }}>
            {entity.classification}
          </div>

          {/* 底部实体编号 */}
          <div className="absolute bottom-3 text-center" style={{ fontSize: Math.max(6, w * 0.07) }}>
            <span style={{ color: 'rgba(192,57,43,0.4)', letterSpacing: 2 }}>
              {entity.designation}
            </span>
          </div>
        </div>

        {/* ─── 反面：档案卡面 ─── */}
        <div className="card-face card-face-back card-dossier" style={{ width: w, height: h }}>
          {/* 顶部红条 */}
          <div className="card-dossier-header" style={{ fontSize: Math.max(6, detail * 0.85) }}>
            <span>FBC ARCHIVE</span>
            <span>{entity.designation}</span>
          </div>

          {/* 实体主内容 */}
          <div className="flex-1 flex flex-col items-center justify-center p-2">
            {/* 表情符号 */}
            <div style={{ fontSize: emoji, lineHeight: 1, marginBottom: 6 }}>
              {entity.emoji}
            </div>

            {/* 代号 */}
            <div
              className="text-center font-bold"
              style={{
                fontSize: Math.max(8, title),
                color: '#e8e0d5',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1.2,
              }}
            >
              {entity.codename}
            </div>

            {/* 实体编号 */}
            <div
              className="text-center mt-2"
              style={{
                fontSize: Math.max(6, detail),
                color: '#6b6b6b',
                letterSpacing: '0.1em',
              }}
            >
              [{entity.designation}]
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-1 justify-center mt-3 px-1">
              {entity.tags.slice(0, 2).map((tag, i) => (
                <span
                  key={i}
                  className="fbc-stamp"
                  style={{
                    fontSize: Math.max(5, detail * 0.7),
                    padding: '1px 6px',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 底部红条 */}
          <div
            className="w-full"
            style={{
              height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(192,57,43,0.6), transparent)',
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
})

EntityCard.displayName = 'EntityCard'
export default EntityCard
