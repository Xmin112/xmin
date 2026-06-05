/**
 * App — FBC 阈域实体档案系统 · 主编排器 v3
 *
 * 新增：3D 卡片环 + 手指位置追踪驱动旋转 + 粒子爆发特效
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useCaseStore from './core/caseMachine'
import { useHandTracking } from './hooks/useHandTracking'
import { useGestureEvents } from './hooks/useGestureEvents'
import { analyzeEntity } from './core/astralAnalysis'

import ConcreteDust from './components/ConcreteDust'
import BioCalibration from './components/BioCalibration'
import IdleScreen from './components/IdleScreen'
import EntityRing from './components/EntityRing'
import ResonanceProtocol from './components/ResonanceProtocol'
import EntityReveal from './components/EntityReveal'
import AnalysisScreen from './components/AnalysisScreen'
import DossierView from './components/DossierView'

export default function App() {
  const phase         = useCaseStore((s) => s.phase)
  const entities      = useCaseStore((s) => s.entities)
  const selectedEntity = useCaseStore((s) => s.selectedEntity)
  const orientation   = useCaseStore((s) => s.orientation)
  const reading       = useCaseStore((s) => s.reading)
  const touchMode     = useCaseStore((s) => s.touchMode)

  const initCase       = useCaseStore((s) => s.initCase)
  const startCalibration = useCaseStore((s) => s.startCalibration)
  const triggerResonance = useCaseStore((s) => s.triggerResonance)
  const resonanceComplete = useCaseStore((s) => s.resonanceComplete)
  const locateEntity   = useCaseStore((s) => s.locateEntity)
  const revealComplete = useCaseStore((s) => s.revealComplete)
  const analysisComplete = useCaseStore((s) => s.analysisComplete)
  const resetCase      = useCaseStore((s) => s.resetCase)
  const setCameraReady = useCaseStore((s) => s.setCameraReady)
  const enableTouchMode = useCaseStore((s) => s.enableTouchMode)

  // 摄像头追踪（包含食指指尖位置）
  const {
    gesture, confidence, landmarks, indexTip, isReady, videoRef, error,
  } = useHandTracking(true)

  // 手势事件（防抖 + 触发状态机）
  const { isDebouncing, progress } = useGestureEvents({ gesture, confidence })

  // 初始化
  const initialized = useRef(false)
  useEffect(() => { if (!initialized.current) { initCase(); initialized.current = true } }, [initCase])

  // 摄像头就绪
  useEffect(() => { setCameraReady(isReady) }, [isReady, setCameraReady])

  // ANALYZING → Gemini 调用（带超时保护）
  useEffect(() => {
    if (phase !== 'ANALYZING' || !selectedEntity) return
    let cancelled = false
    const timeout = setTimeout(() => {
      if (!cancelled) analysisComplete(null) // 5 秒超时，用回退数据
    }, 5000)

    analyzeEntity(selectedEntity, orientation).then((result) => {
      clearTimeout(timeout)
      if (!cancelled) analysisComplete(result)
    }).catch(() => {
      clearTimeout(timeout)
      if (!cancelled) analysisComplete(null)
    })
    return () => { cancelled = true; clearTimeout(timeout) }
  }, [phase, selectedEntity, orientation, analysisComplete])

  // 触控回调
  const handleTouchStart = useCallback(() => startCalibration(), [startCalibration])

  // 粒子强度
  const particleIntensity =
    phase === 'SHUFFLING' || phase === 'REVEAL' ? 'high'
    : phase === 'IDLE' ? 'low' : 'medium'

  return (
    <div
      className="relative w-screen h-screen overflow-hidden noise-overlay"
      style={{
        background: `
          radial-gradient(ellipse 60% 40% at 50% 40%, rgba(139,0,0,0.06) 0%, transparent 50%),
          radial-gradient(ellipse 40% 30% at 30% 70%, rgba(192,57,43,0.03) 0%, transparent 50%),
          #050508
        `,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <ConcreteDust active={true} intensity={particleIntensity} burst={phase === 'SHUFFLING'} />

      <AnimatePresence mode="wait">
        {phase === 'IDLE' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <IdleScreen isReady={isReady} cameraError={error}
              onStart={handleTouchStart} onEnableTouch={() => enableTouchMode()} />
          </motion.div>
        )}

        {/* CALIBRATING + SCANNING 共用 3D 卡片环 */}
        {(phase === 'CALIBRATING' || phase === 'SCANNING') && (
          <motion.div key={phase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EntityRing
              entities={entities}
              indexTip={indexTip}
              onSelect={(i) => locateEntity(i)}
              mode={phase === 'SCANNING' ? 'select' : 'browse'}
            />
          </motion.div>
        )}

        {phase === 'SHUFFLING' && (
          <motion.div key="shuffling" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ResonanceProtocol entities={entities} onComplete={() => resonanceComplete()} />
          </motion.div>
        )}

        {phase === 'REVEAL' && selectedEntity && (
          <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EntityReveal entity={selectedEntity} orientation={orientation}
              onComplete={() => revealComplete()} />
          </motion.div>
        )}

        {phase === 'ANALYZING' && selectedEntity && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AnalysisScreen entity={selectedEntity} orientation={orientation} />
          </motion.div>
        )}

        {phase === 'DOSSIER' && selectedEntity && (
          <motion.div key="dossier" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DossierView entity={selectedEntity} orientation={orientation}
              reading={reading} onReset={() => resetCase()} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 顶部标题 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none">
        <h1 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.6em', color: '#e8e0d5', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
          TAROT
        </h1>
        <div style={{ width: 24, height: 1, margin: '4px auto 0', background: 'linear-gradient(90deg, transparent, rgba(192,57,43,0.5), transparent)' }} />
        <div className="fbc-label" style={{ fontSize: 6, marginTop: 4 }}>FBC · CASE 22</div>
      </div>

      {/* 阶段指示器 */}
      <PhaseIndicator currentPhase={phase} />

      {/* 摄像头 + 诊断面板 */}
      <BioCalibration gesture={gesture} confidence={confidence} videoRef={videoRef}
        landmarks={landmarks} isReady={isReady} error={error}
        isDebouncing={isDebouncing} touchMode={touchMode}
        onEnableTouch={() => enableTouchMode()} />

      {/* Deerflow */}
      <a href="https://deerflow.tech" target="_blank" rel="noopener noreferrer"
        className="absolute bottom-3 right-4 z-30 opacity-30 hover:opacity-60 transition-opacity duration-500"
        style={{ fontSize: 7, color: '#6b6b6b', letterSpacing: '0.2em', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', textDecoration: 'none' }}>
        DF
      </a>
    </div>
  )
}

function PhaseIndicator({ currentPhase }) {
  const phases = ['IDLE', 'CALIBRATING', 'SHUFFLING', 'SCANNING', 'REVEAL', 'ANALYZING', 'DOSSIER']
  const idx = phases.indexOf(currentPhase)
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 pointer-events-none">
      {phases.map((_, i) => (
        <div key={i} style={{ width: 10, height: 2, background: i <= idx ? '#c0392b' : 'rgba(107,107,107,0.2)', transition: 'background 0.5s ease' }} />
      ))}
    </div>
  )
}
