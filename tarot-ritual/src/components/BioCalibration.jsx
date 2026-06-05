/**
 * BioCalibration — 生物特征监控面板
 *
 * 整合：隐藏 video（始终在 DOM 中）+ 手势诊断面板 + 摄像头叠加层
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SurveillanceFeed from './SurveillanceFeed'

export default function BioCalibration({
  gesture, confidence, videoRef, landmarks, isReady, error,
  isDebouncing, touchMode, onEnableTouch,
}) {
  const showCamera = isReady && !error && !touchMode
  const isLocked = gesture !== 'none' && confidence >= 0.4
  const [debugExpanded, setDebugExpanded] = useState(false)

  // 自动展开诊断面板（检测到手势时）
  useEffect(() => {
    if (gesture !== 'none') setDebugExpanded(true)
  }, [gesture])

  const gestureLabel = {
    none:  'STANDBY',
    open:  'PALM DETECTED',
    pinch: 'PINCH LOCK',
    swipe: 'SWIPE REGISTERED',
  }[gesture] || 'UNKNOWN'

  return (
    <>
      {/* ── Video（始终在 DOM，MediaPipe 需要）── */}
      <video
        ref={videoRef}
        autoPlay playsInline muted
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 1, height: 1,
          opacity: 0,
          pointerEvents: 'none',
          transform: 'scaleX(-1)',
        }}
      />

      {/* ── 右下角：诊断面板 ── */}
      <motion.div
        style={{
          position: 'fixed',
          bottom: showCamera ? 260 : 30,
          right: 20,
          zIndex: 21,
          width: 200,
        }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: debugExpanded ? 1 : 0.4, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => setDebugExpanded(!debugExpanded)}
      >
        <div
          className="fbc-panel px-4 py-3 cursor-pointer"
          style={{ borderColor: isLocked ? 'rgba(192,57,43,0.5)' : 'rgba(107,107,107,0.2)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="fbc-label" style={{ fontSize: 7 }}>BIOMETRIC FEED</span>
            <motion.span
              style={{
                width: 5, height: 5,
                background: isLocked ? '#c0392b' : gesture !== 'none' ? '#6b6b6b' : '#333',
                borderRadius: '50%',
              }}
              animate={isLocked ? { opacity: [1, 0.2, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>

          <div style={{ fontSize: 10, color: isLocked ? '#e8e0d5' : '#6b6b6b', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
            {gestureLabel}
          </div>

          {debugExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-2 pt-2"
              style={{ borderTop: '1px solid rgba(192,57,43,0.1)' }}
            >
              <div className="flex justify-between" style={{ fontSize: 7, color: '#6b6b6b' }}>
                <span>CONFIDENCE</span>
                <span style={{ color: confidence >= 0.4 ? '#c0392b' : '#6b6b6b' }}>
                  {(confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between mt-1" style={{ fontSize: 7, color: '#6b6b6b' }}>
                <span>PHASE</span>
                <span style={{ color: '#e8e0d5' }}>
                  {gesture !== 'none' ? 'ACTIVE' : 'IDLE'}
                </span>
              </div>
              <div className="flex justify-between mt-1" style={{ fontSize: 7, color: '#6b6b6b' }}>
                <span>SMOOTHING</span>
                <span style={{ color: isDebouncing ? '#c0392b' : '#6b6b6b' }}>
                  {isDebouncing ? 'ARMING' : 'READY'}
                </span>
              </div>
              {isDebouncing && (
                <div className="mt-2" style={{ height: 2, background: 'rgba(192,57,43,0.15)' }}>
                  <motion.div
                    style={{ height: '100%', background: '#c0392b' }}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: gesture === 'swipe' ? 0.2 : 0.4, ease: 'linear' }}
                  />
                </div>
              )}
            </motion.div>
          )}

          {!debugExpanded && (
            <div className="fbc-label mt-1" style={{ fontSize: 6 }}>
              CLICK TO EXPAND
            </div>
          )}
        </div>
      </motion.div>

      {/* ── 摄像头加载 ── */}
      {!isReady && !error && !touchMode && (
        <div style={{ position: 'fixed', bottom: 30, left: '50%', marginLeft: -140, zIndex: 20 }}>
          <motion.div
            className="fbc-panel flex flex-col items-center gap-3 px-6 py-4"
            style={{ width: 300 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="fbc-label" style={{ fontSize: 9 }}>
              INITIALIZING SURVEILLANCE
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  style={{ width: 4, height: 4, background: '#c0392b' }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </div>
            <div className="fbc-label" style={{ fontSize: 7 }}>
              AWAITING CAMERA STREAM...
            </div>
          </motion.div>
        </div>
      )}

      {/* ── 权限被拒 ── */}
      {error === 'CAMERA_DENIED' && !touchMode && (
        <div style={{ position: 'fixed', bottom: 30, left: '50%', marginLeft: -170, zIndex: 20 }}>
          <motion.div
            className="fbc-panel flex flex-col items-center gap-4 px-6 py-5"
            style={{ width: 340 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="fbc-header -mx-6 -mt-5 mb-0" style={{ width: 'calc(100% + 48px)', fontSize: 9 }}>
              ⚠ SECURITY BREACH
            </div>
            <div style={{ fontSize: 10, color: '#6b6b6b', textAlign: 'center', lineHeight: 1.8 }}>
              摄像头权限已被拒绝。<br />
              启用浏览器摄像头权限，或使用触控模式。
            </div>
            <button className="fbc-btn" onClick={onEnableTouch} style={{ fontSize: 10 }}>
              ENABLE TOUCH CONTROL
            </button>
          </motion.div>
        </div>
      )}

      {/* ── 摄像头就绪 + 叠加层 ── */}
      {showCamera && (
        <div style={{ position: 'fixed', bottom: 30, left: '50%', marginLeft: -140, zIndex: 20 }}>
          <div style={{
            width: 280, height: 210,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* 显示用 video */}
            <video
              ref={videoRef}
              autoPlay playsInline muted
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)',
                filter: isLocked ? 'brightness(0.9) contrast(1.1)' : 'brightness(0.65) contrast(1.3)',
                transition: 'filter 0.3s ease',
              }}
            />

            {/* 叠加层 */}
            <SurveillanceFeed
              isActive={true}
              gesture={gesture}
              confidence={confidence}
              isDebouncing={isDebouncing}
              landmarks={landmarks}
              errorMessage={null}
            />
          </div>
        </div>
      )}

      {/* ── 触控模式 ── */}
      {touchMode && (
        <div style={{ position: 'fixed', bottom: 30, left: '50%', marginLeft: -140, zIndex: 20 }}>
          <motion.div
            className="fbc-panel flex flex-col items-center gap-3 px-6 py-4"
            style={{ width: 280 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="fbc-label" style={{ fontSize: 9 }}>
              TOUCH CONTROL MODE
            </div>
            <div style={{ fontSize: 10, color: '#6b6b6b', textAlign: 'center', lineHeight: 1.6 }}>
              触控模式已激活 · 使用屏幕按钮操作
            </div>
          </motion.div>
        </div>
      )}

      {/* ── 其他错误 ── */}
      {error && error !== 'CAMERA_DENIED' && !touchMode && (
        <div style={{ position: 'fixed', bottom: 30, left: '50%', marginLeft: -170, zIndex: 20 }}>
          <motion.div
            className="fbc-panel flex flex-col items-center gap-4 px-6 py-5"
            style={{ width: 340 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ color: '#c0392b', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em' }}>
              ⚠ SURVEILLANCE ERROR
            </div>
            <div style={{ fontSize: 10, color: '#6b6b6b', textAlign: 'center', lineHeight: 1.8 }}>
              {error === 'CAMERA_NOT_FOUND' && '未检测到摄像头设备。'}
              {error === 'MEDIAPIPE_ERROR' && '生物特征模块异常。'}
              {error === 'UNKNOWN' && '监控系统异常。'}
            </div>
            <button className="fbc-btn" onClick={onEnableTouch} style={{ fontSize: 10 }}>
              ENABLE TOUCH CONTROL
            </button>
          </motion.div>
        </div>
      )}
    </>
  )
}
