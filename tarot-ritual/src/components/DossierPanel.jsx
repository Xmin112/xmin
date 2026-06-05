/**
 * DossierPanel — 机密档案解读面板
 */

import gsap from 'gsap'
import { useEffect, useRef } from 'react'

export default function DossierPanel({ entity, orientation, reading, onReset }) {
  const panelRef = useRef(null)

  const isStable = orientation === 'stable'
  const formLabel = isStable ? 'STABLE FORM' : 'DECAYED FORM'

  const report = reading || {
    fieldEffect: entity.summary,
    boardDirective: isStable
      ? `[[${entity.codename}/稳定/批准接触]]`
      : `[[${entity.codename}/衰减/谨慎评估]]`,
    contactProtocol: isStable ? entity.stableForm : entity.decayedForm,
  }

  useEffect(() => {
    gsap.fromTo(panelRef.current, { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
    })
  }, [])

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 px-6">
      <div ref={panelRef} className="flex flex-col gap-5 max-w-lg w-full" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* 档案头部 */}
        <div className="fbc-panel w-full">
          <div className="fbc-header" style={{ fontSize: 10 }}>
            ARCHIVE DOSSIER: {entity.designation}
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="fbc-label" style={{ fontSize: 8 }}>
              SECURITY: {entity.classification}
            </span>
            <span className="fbc-stamp" style={{
              fontSize: 7,
              borderColor: isStable ? 'rgba(201,169,110,0.6)' : 'rgba(192,57,43,0.8)',
              color: isStable ? '#c9a96e' : '#c0392b',
            }}>{formLabel}</span>
          </div>
        </div>

        {/* 实体代号 */}
        <div className="text-center">
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.2em', color: '#e8e0d5', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
            {entity.codename}
          </div>
          <div className="fbc-label" style={{ fontSize: 8, marginTop: 4 }}>
            [{entity.designation}] · {entity.classification}
          </div>
        </div>

        {/* 董事会批示 */}
        <div className="fbc-panel px-5 py-4">
          <div className="fbc-label" style={{ fontSize: 7, marginBottom: 6 }}>BOARD DIRECTIVE</div>
          <div className="fbc-board" style={{ fontSize: 11, lineHeight: 1.8 }}>
            {report.boardDirective}
          </div>
        </div>

        {/* 场效应分析 */}
        <div className="fbc-panel px-5 py-4">
          <div className="fbc-label" style={{ fontSize: 7, marginBottom: 6 }}>FIELD EFFECT ANALYSIS</div>
          <p className="fbc-typewriter" style={{ fontSize: 11, color: '#e8e0d5', margin: 0 }}>
            {report.fieldEffect}
          </p>
        </div>

        {/* 接触协议 */}
        <div className="fbc-panel px-5 py-4">
          <div className="fbc-label" style={{ fontSize: 7, marginBottom: 6 }}>CONTACT PROTOCOL</div>
          <p className="fbc-typewriter" style={{ fontSize: 11, color: '#e8e0d5', margin: 0 }}>
            {report.contactProtocol}
          </p>
        </div>

        {/* 重置 */}
        <div className="flex justify-center pb-8">
          <button className="fbc-btn" onClick={onReset} style={{ fontSize: 10 }}>
            CLOSE DOSSIER
          </button>
        </div>
      </div>
    </div>
  )
}
