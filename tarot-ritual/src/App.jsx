/**
 * App v4 — Three.js + GSAP + MediaPipe 架构
 *
 * 阶段: IDLE → CALIBRATING → SHUFFLING → SCANNING → REVEAL → DOSSIER
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useCaseStore from './core/caseMachine'
import { useHandTracking } from './hooks/useHandTracking'
import { useGestureEvents } from './hooks/useGestureEvents'
import { analyzeEntity } from './core/astralAnalysis'

import ThreeScene from './components/ThreeScene'
import LoadingScreen from './components/LoadingScreen'
import IntroOverlay from './components/IntroOverlay'
import FloatingHeader from './components/FloatingHeader'
import StatsPanel from './components/StatsPanel'
import GestureCursor from './components/GestureCursor'
import EntityRing from './components/EntityRing'
import ResonanceProtocol from './components/ResonanceProtocol'
import CardReveal from './components/CardReveal'
import DossierPanel from './components/DossierPanel'

export default function App() {
  const phase = useCaseStore((s) => s.phase)
  const entities = useCaseStore((s) => s.entities)
  const selectedEntity = useCaseStore((s) => s.selectedEntity)
  const orientation = useCaseStore((s) => s.orientation)
  const reading = useCaseStore((s) => s.reading)

  const initCase = useCaseStore((s) => s.initCase)
  const startCalibration = useCaseStore((s) => s.startCalibration)
  const triggerResonance = useCaseStore((s) => s.triggerResonance)
  const resonanceComplete = useCaseStore((s) => s.resonanceComplete)
  const locateEntity = useCaseStore((s) => s.locateEntity)
  const revealComplete = useCaseStore((s) => s.revealComplete)
  const analysisComplete = useCaseStore((s) => s.analysisComplete)
  const resetCase = useCaseStore((s) => s.resetCase)
  const setCameraReady = useCaseStore((s) => s.setCameraReady)

  // 摄像头
  const { gesture, confidence, landmarks, indexTip, isReady, videoRef, error } = useHandTracking(true)
  useGestureEvents({ gesture, confidence })

  // 加载 → 入场
  const [loaded, setLoaded] = useState(false)
  const [introDone, setIntroDone] = useState(false)

  const initialized = useRef(false)
  useEffect(() => {
    if (!initialized.current) { initCase(); initialized.current = true }
  }, [initCase])

  useEffect(() => { setCameraReady(isReady) }, [isReady, setCameraReady])

  // ANALYZING → Gemini（带超时）
  useEffect(() => {
    if (phase !== 'ANALYZING' || !selectedEntity) return
    let cancelled = false
    const timeout = setTimeout(() => { if (!cancelled) analysisComplete(null) }, 5000)
    analyzeEntity(selectedEntity, orientation).then((r) => {
      clearTimeout(timeout); if (!cancelled) analysisComplete(r)
    }).catch(() => { clearTimeout(timeout); if (!cancelled) analysisComplete(null) })
    return () => { cancelled = true; clearTimeout(timeout) }
  }, [phase, selectedEntity, orientation, analysisComplete])

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#050508', fontFamily: "'JetBrains Mono', monospace" }}>
      {/* 加载 */}
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      {/* 入场 */}
      {loaded && !introDone && <IntroOverlay onDismiss={() => setIntroDone(true)} />}

      {/* 3D 背景 */}
      {loaded && introDone && <ThreeScene />}

      {/* UI 叠加层 */}
      {loaded && introDone && (
        <>
          <FloatingHeader />
          <StatsPanel drawCount={phase === 'DOSSIER' ? 1 : 0} />

          {/* 阶段组件 */}
          <AnimatePresence mode="wait">
            {(phase === 'CALIBRATING' || phase === 'SCANNING') && (
              <motion.div key={phase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EntityRing entities={entities} indexTip={indexTip}
                  onSelect={(i) => locateEntity(i)}
                  mode={phase === 'SCANNING' ? 'select' : 'browse'} />
              </motion.div>
            )}

            {phase === 'SHUFFLING' && (
              <motion.div key="shuffle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ResonanceProtocol entities={entities} onComplete={() => resonanceComplete()} />
              </motion.div>
            )}

            {phase === 'REVEAL' && selectedEntity && (
              <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CardReveal entity={selectedEntity} orientation={orientation}
                  onComplete={() => revealComplete()} />
              </motion.div>
            )}

            {phase === 'ANALYZING' && selectedEntity && (
              <motion.div key="analyzing" className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center flex flex-col items-center gap-4">
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.2em', color: '#e8e0d5', fontFamily: "'JetBrains Mono', monospace" }}>
                    {selectedEntity.codename}
                  </div>
                  <div className="fbc-label" style={{ fontSize: 9 }}>ASTRAL ANALYSIS IN PROGRESS</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} style={{ width: 6, height: 16, background: '#c0392b' }}
                        animate={{ opacity: [0.3, 1, 0.3], height: [8, 16, 8] }}
                        transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'DOSSIER' && selectedEntity && (
              <motion.div key="dossier" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DossierPanel entity={selectedEntity} orientation={orientation}
                  reading={reading} onReset={() => resetCase()} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* IDLE 手势唤醒按钮 */}
          {phase === 'IDLE' && (
            <motion.div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 text-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              <div className="fbc-label" style={{ fontSize: 9, marginBottom: 10 }}>
                PLACE OPEN PALM TOWARD CAMERA
              </div>
              <motion.div style={{ width: 60, height: 60, border: '1px solid rgba(192,57,43,0.3)', borderRadius: '50%', margin: '0 auto' }}
                animate={{ boxShadow: ['0 0 0px rgba(192,57,43,0)', '0 0 20px rgba(192,57,43,0.3)', '0 0 0px rgba(192,57,43,0)'] }}
                transition={{ duration: 2, repeat: Infinity }}>
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 8, height: 8, background: '#c0392b', borderRadius: '50%' }} />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* 手势光标 */}
          <GestureCursor videoRef={videoRef} indexTip={indexTip}
            gesture={gesture} confidence={confidence} isReady={isReady} error={error} />
        </>
      )}

      {/* Deerflow */}
      <a href="https://deerflow.tech" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-3 right-4 z-50 opacity-30 hover:opacity-60"
        style={{ fontSize: 7, color: '#6b6b6b', letterSpacing: '0.2em', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', textDecoration: 'none' }}>
        DF
      </a>
    </div>
  )
}
