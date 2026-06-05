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
            {/* 正面——CLASSIFIED */}
            <div style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #1a1a1f, #121218)',
              border: '1px solid rgba(192,57,43,0.3)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                position: 'absolute', inset: 6,
                border: '1px solid rgba(192,57,43,0.15)',
              }} />
              <div style={{ fontSize: 36 }}>▲</div>
              <div className="fbc-stamp" style={{ marginTop: 8 }}>CLASSIFIED</div>
              <div style={{ fontSize: 7, color: 'rgba(192,57,43,0.3)', marginTop: 12, letterSpacing: 2 }}>
                {entity.designation}
              </div>
            </div>
            {/* 反面——档案 */}
            <div style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: '#0a0a10',
              border: '1px solid rgba(192,57,43,0.4)',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ background: '#8b0000', padding: '4px 8px', fontSize: 7, letterSpacing: '0.2em', color: '#e8e0d5', display: 'flex', justifyContent: 'space-between' }}>
                <span>FBC ARCHIVE</span><span>{entity.designation}</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-3">
                <div style={{ fontSize: 38 }}>{entity.emoji}</div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', color: '#e8e0d5', marginTop: 6, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
                  {entity.codename}
                </div>
              </div>
              <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(192,57,43,0.5), transparent)' }} />
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
