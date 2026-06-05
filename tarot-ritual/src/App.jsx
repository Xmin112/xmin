/**
 * App — FBC 阈域实体档案系统 · 主编排器
 *
 * 七阶段状态机驱动，Framer Motion AnimatePresence 保证无重叠。
 * 每阶段渲染专属组件，摄像头/手势/触控在所有阶段可访问。
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
import CalibratingScreen from './components/CalibratingScreen'
import ResonanceProtocol from './components/ResonanceProtocol'
import ScanningScreen from './components/ScanningScreen'
import EntityReveal from './components/EntityReveal'
import AnalysisScreen from './components/AnalysisScreen'
import DossierView from './components/DossierView'

export default function App() {
  // ─── Zustand 状态 ───
  const phase         = useCaseStore((s) => s.phase)
  const entities       = useCaseStore((s) => s.entities)
  const selectedEntity = useCaseStore((s) => s.selectedEntity)
  const orientation    = useCaseStore((s) => s.orientation)
  const reading        = useCaseStore((s) => s.reading)
  const touchMode      = useCaseStore((s) => s.touchMode)
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

  // ─── 摄像头追踪 ───
  const cameraActive = phase !== 'IDLE' || touchMode
  const { gesture, confidence, landmarks, isReady, videoRef, error } = useHandTracking(cameraActive)

  // ─── 手势事件（防抖 + 触发状态机） ───
  const { isDebouncing, progress } = useGestureEvents({ gesture, confidence })

  // ─── 圆形半径 ───
  const [circleRadius, setCircleRadius] = useState(
    Math.min(window.innerWidth, window.innerHeight) * 0.32
  )
  useEffect(() => {
    const update = () => {
      setCircleRadius(Math.min(window.innerWidth, window.innerHeight) * 0.32)
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // ─── 初始化 ───
  const initialized = useRef(false)
  useEffect(() => {
    if (!initialized.current) {
      initCase()
      initialized.current = true
    }
  }, [initCase])

  // ─── 摄像头就绪状态 ───
  useEffect(() => {
    setCameraReady(isReady)
  }, [isReady, setCameraReady])

  // ─── ANALYZING 阶段触发 Gemini ───
  useEffect(() => {
    if (phase !== 'ANALYZING' || !selectedEntity) return

    let cancelled = false
    analyzeEntity(selectedEntity, orientation).then((result) => {
      if (!cancelled) analysisComplete(result)
    })
    return () => { cancelled = true }
  }, [phase, selectedEntity, orientation, analysisComplete])

  // ─── 触控模式回调 ───
  const handleTouchStart = useCallback(() => {
    startCalibration()
  }, [startCalibration])

  // ─── 粒子强度 ───
  const particleIntensity =
    phase === 'SHUFFLING' || phase === 'REVEAL' ? 'high'
    : phase === 'IDLE' ? 'low'
    : 'medium'

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
      {/* ─── 粒子背景 ─── */}
      <ConcreteDust active={true} intensity={particleIntensity} />

      {/* ─── 阶段组件（AnimatePresence 保证无重叠） ─── */}
      <AnimatePresence mode="wait">
        {phase === 'IDLE' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <IdleScreen
              onStart={touchMode ? handleTouchStart : undefined}
            />
          </motion.div>
        )}

        {phase === 'CALIBRATING' && (
          <motion.div
            key="calibrating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CalibratingScreen
              entities={entities}
              circleRadius={circleRadius}
            />
          </motion.div>
        )}

        {phase === 'SHUFFLING' && (
          <motion.div
            key="shuffling"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ResonanceProtocol
              entities={entities}
              onComplete={() => resonanceComplete()}
            />
          </motion.div>
        )}

        {phase === 'SCANNING' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ScanningScreen
              entities={entities}
              onSelect={(i) => locateEntity(i)}
              circleRadius={circleRadius}
            />
          </motion.div>
        )}

        {phase === 'REVEAL' && selectedEntity && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EntityReveal
              entity={selectedEntity}
              orientation={orientation}
              onComplete={() => revealComplete()}
            />
          </motion.div>
        )}

        {phase === 'ANALYZING' && selectedEntity && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnalysisScreen
              entity={selectedEntity}
              orientation={orientation}
            />
          </motion.div>
        )}

        {phase === 'DOSSIER' && selectedEntity && (
          <motion.div
            key="dossier"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DossierView
              entity={selectedEntity}
              orientation={orientation}
              reading={reading}
              onReset={() => resetCase()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 顶部标题栏 ─── */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none">
        <h1
          className="text-center"
          style={{
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '0.6em',
            color: '#e8e0d5',
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: 'uppercase',
          }}
        >
          TAROT
        </h1>
        <div
          className="mx-auto mt-2"
          style={{
            width: 24, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(192,57,43,0.5), transparent)',
          }}
        />
        <div className="fbc-label" style={{ fontSize: 6, marginTop: 4 }}>
          FBC · CASE 22
        </div>
      </div>

      {/* ─── 阶段指示器 ─── */}
      <PhaseIndicator currentPhase={phase} />

      {/* ─── 摄像头/触控模块 ─── */}
      <BioCalibration
        gesture={gesture}
        confidence={confidence}
        videoRef={videoRef}
        landmarks={landmarks}
        isReady={isReady}
        error={error}
        isDebouncing={isDebouncing}
        touchMode={touchMode}
        onEnableTouch={() => enableTouchMode()}
      />

      {/* ─── Deerflow 标记 ─── */}
      <a
        href="https://deerflow.tech"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-4 z-30 opacity-30 hover:opacity-60 transition-opacity duration-500"
        style={{
          fontSize: 7,
          color: '#6b6b6b',
          letterSpacing: '0.2em',
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}
      >
        DF
      </a>
    </div>
  )
}

/**
 * 顶部阶段进度指示器
 */
function PhaseIndicator({ currentPhase }) {
  const phases = [
    'IDLE', 'CALIBRATING', 'SHUFFLING', 'SCANNING',
    'REVEAL', 'ANALYZING', 'DOSSIER',
  ]
  const currentIdx = phases.indexOf(currentPhase)

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 pointer-events-none">
      {phases.map((_, i) => (
        <div
          key={i}
          style={{
            width: 10,
            height: 2,
            background: i <= currentIdx
              ? '#c0392b'
              : 'rgba(107,107,107,0.2)',
            transition: 'background 0.5s ease',
          }}
        />
      ))}
    </div>
  )
}
