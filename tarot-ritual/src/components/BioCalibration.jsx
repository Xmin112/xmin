/**
 * BioCalibration — 生物特征校准容器
 *
 * 管理摄像头 <video> 元素和手势反馈叠加层。
 * video 始终在 DOM 中以确保 MediaPipe Camera 可以附加。
 */

import { motion } from 'framer-motion'
import SurveillanceFeed from './SurveillanceFeed'

export default function BioCalibration({
  gesture, confidence, videoRef, landmarks, isReady, error,
  isDebouncing, touchMode, onEnableTouch,
}) {
  const showCamera = isReady && !error && !touchMode
  const isLocked = gesture !== 'none' && confidence >= 0.7

  return (
    <>
      {/* ── 摄像头容器（始终渲染以确保 video 在 DOM 中）── */}
      <div
        style={{
          position: 'fixed',
          bottom: 30,
          left: '50%',
          marginLeft: showCamera ? -140 : 0,
          width: showCamera ? 280 : 1,
          height: showCamera ? 210 : 1,
          opacity: showCamera ? 1 : 0,
          zIndex: showCamera ? 20 : -1,
          overflow: 'hidden',
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Video（始终存在） */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
            filter: isLocked ? 'brightness(0.9) contrast(1.1)' : 'brightness(0.7) contrast(1.3)',
            transition: 'filter 0.3s ease',
          }}
        />

        {/* 叠加层（仅在摄像头就绪时显示） */}
        {showCamera && (
          <SurveillanceFeed
            videoRef={videoRef}
            isActive={true}
            gesture={gesture}
            confidence={confidence}
            isDebouncing={isDebouncing}
            landmarks={landmarks}
            errorMessage={null}
          />
        )}
      </div>

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
              触控模式已激活 · 使用屏幕按钮进行操作
            </div>
          </motion.div>
        </div>
      )}

      {/* ── 摄像头就绪中 ── */}
      {!isReady && !error && !touchMode && (
        <div style={{ position: 'fixed', bottom: 30, left: '50%', marginLeft: -140, zIndex: 20 }}>
          <motion.div
            className="fbc-panel flex flex-col items-center gap-3 px-6 py-3"
            style={{ width: 280 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="fbc-label text-center" style={{ fontSize: 9 }}>
              INITIALIZING SURVEILLANCE
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
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
              CHECKING CAMERA...
            </div>
          </motion.div>
        </div>
      )}

      {/* ── 摄像头权限被拒 ── */}
      {error === 'CAMERA_DENIED' && !touchMode && (
        <div style={{ position: 'fixed', bottom: 30, left: '50%', marginLeft: -160, zIndex: 20 }}>
          <motion.div
            className="fbc-panel flex flex-col items-center gap-4 px-6 py-5"
            style={{ width: 340 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ color: '#c0392b', fontSize: 14, fontWeight: 700, letterSpacing: '0.2em' }}>
              ⚠ CAMERA ACCESS DENIED
            </div>
            <div style={{ fontSize: 10, color: '#6b6b6b', textAlign: 'center', lineHeight: 1.8 }}>
              摄像头权限已被拒绝。<br />
              请启用浏览器摄像头权限，或使用触控模式继续。
            </div>
            <button className="fbc-btn" onClick={onEnableTouch}>
              ENABLE TOUCH CONTROL
            </button>
          </motion.div>
        </div>
      )}

      {/* ── 其他摄像头错误 ── */}
      {error && error !== 'CAMERA_DENIED' && !touchMode && (
        <div style={{ position: 'fixed', bottom: 30, left: '50%', marginLeft: -160, zIndex: 20 }}>
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
              {error === 'MEDIAPIPE_ERROR' && '生物特征模块加载异常。'}
              {error === 'UNKNOWN' && '监控系统未知异常。'}
            </div>
            <button className="fbc-btn" onClick={onEnableTouch}>
              ENABLE TOUCH CONTROL
            </button>
          </motion.div>
        </div>
      )}
    </>
  )
}
