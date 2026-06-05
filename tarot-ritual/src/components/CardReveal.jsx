/**
 * CardReveal — 3D 卡牌 + GSAP 翻转动画
 *
 * 使用 CSS 3D transforms + GSAP timeline 驱动：
 *   卡片从下方飞入 → 放大 → rotateY 翻转 → 档案解锁
 */

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function CardReveal({ entity, orientation, onComplete }) {
  const containerRef = useRef(null)
  const cardRef = useRef(null)
  const contentRef = useRef(null)

  const formLabel = orientation === 'stable' ? 'STABLE' : 'DECAYED'
  const activeText = orientation === 'stable' ? entity.stableForm : entity.decayedForm

  useEffect(() => {
    const tl = gsap.timeline({ onComplete: () => onComplete?.() })

    // 卡片飞入
    tl.fromTo(containerRef.current, { y: 300, scale: 0.5, opacity: 0 }, {
      y: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'power3.out',
    })
    // 希斯抖动
    .to(containerRef.current, {
      x: -5, duration: 0.05, ease: 'none',
    }).to(containerRef.current, {
      x: 5, duration: 0.05, ease: 'none',
    }).to(containerRef.current, {
      x: 0, duration: 0.05,
    })
    // 翻转
    .to(cardRef.current, {
      rotateY: 180, duration: 0.7, ease: 'power2.inOut',
    }, '+=0.3')
    // 红条展开
    .fromTo(contentRef.current, {
      clipPath: 'inset(0 0 100% 0)', opacity: 0,
    }, {
      clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 0.6, ease: 'power2.out',
    })
  }, [onComplete])

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div ref={containerRef} className="flex flex-col items-center gap-6 max-w-md">
        {/* 3D 卡片 */}
        <div style={{ perspective: 800 }}>
          <div ref={cardRef} style={{
            width: 140, height: 220,
            transformStyle: 'preserve-3d',
          }}>
            {/* 正面——塔罗贴图 */}
            <div style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
              border: '1px solid rgba(192,57,43,0.4)', overflow: 'hidden',
            }}>
              <img src={`/cards/major_${String(entity.id).padStart(2,'0')}.png`}
                alt={entity.codename}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            {/* 反面——FBC 档案 */}
            <div style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, #0d0d14 0%, #12121f 40%, #0a0a10 100%)',
              border: '1px solid rgba(192,57,43,0.35)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ position: 'absolute', inset: 5, border: '1px solid rgba(192,57,43,0.2)' }} />
              <svg width="50" height="50" viewBox="0 0 40 40">
                <polygon points="20,4 36,32 4,32" fill="none" stroke="rgba(192,57,43,0.4)" strokeWidth="1" />
                <polygon points="20,28 30,10 10,10" fill="none" stroke="rgba(192,57,43,0.2)" strokeWidth="0.5" />
                <circle cx="20" cy="20" r="2" fill="rgba(192,57,43,0.6)" />
              </svg>
              <div style={{ marginTop: 6, padding: '2px 10px', border: '1px solid rgba(192,57,43,0.5)', color: '#c0392b', fontSize: 8, fontWeight: 700, letterSpacing: '0.25em', fontFamily: "'JetBrains Mono', monospace" }}>CLASSIFIED</div>
            </div>
          </div>
        </div>

        {/* 档案内容 */}
        <div ref={contentRef} className="fbc-panel px-5 py-4 w-full flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="fbc-label" style={{ fontSize: 7 }}>ENTITY STATUS</span>
            <span className="fbc-stamp" style={{
              borderColor: orientation === 'stable' ? 'rgba(201,169,110,0.6)' : 'rgba(192,57,43,0.8)',
              color: orientation === 'stable' ? '#c9a96e' : '#c0392b',
            }}>{formLabel}</span>
          </div>
          <p className="fbc-typewriter" style={{ fontSize: 10, color: '#e8e0d5', margin: 0 }}>
            {activeText}
          </p>
        </div>
      </div>
    </div>
  )
}
