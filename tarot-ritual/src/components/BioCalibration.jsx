/**
 * BioCalibration — 生物特征校准容器
 *
 * 连接 useHandTracking 与 SurveillanceFeed。
 * 处理摄像头权限错误，提供触控降级模式。
 *
 * @param {Object} props
 * @param {string}  props.gesture
 * @param {number}  props.confidence
 * @param {import('react').RefObject<HTMLVideoElement>} props.videoRef
 * @param {Array<{x:number,y:number,z:number}>|null} props.landmarks
 * @param {boolean} props.isReady
 * @param {string|null} props.error
 * @param {boolean} props.isDebouncing
 * @param {boolean} props.touchMode
 * @param {()=>void} props.onEnableTouch
 */

import { motion } from 'framer-motion'
import SurveillanceFeed from './SurveillanceFeed'

export default function BioCalibration({
  gesture, confidence, videoRef, landmarks, isReady, error,
  isDebouncing, touchMode, onEnableTouch,
}) {
  // 触控模式 — 不显示摄像头
  if (touchMode) {
    return (
      <div className="absolute z-20" style={{ bottom: 30 }}>
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
    )
  }

  // 摄像头就绪中
  if (!isReady && !error) {
    return (
      <div className="absolute z-20" style={{ bottom: 30 }}>
        <motion.div
          className="fbc-panel flex flex-col items-center gap-3 px-6 py-3"
          style={{ width: 280 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="fbc-label text-center" style={{ fontSize: 9 }}>
            INITIALIZING SURVEILLANCE
          </div>
          <div style={{
            display: 'flex', gap: 4, alignItems: 'center',
          }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={{
                  width: 4, height: 4,
                  background: '#c0392b',
                }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // 摄像头权限被拒
  if (error === 'CAMERA_DENIED') {
    return (
      <div className="absolute z-20" style={{ bottom: 30 }}>
        <motion.div
          className="fbc-panel flex flex-col items-center gap-4 px-6 py-5"
          style={{ width: 320 }}
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
    )
  }

  // 正常监控画面
  return (
    <div className="absolute z-20" style={{ bottom: 30 }}>
      <SurveillanceFeed
        videoRef={videoRef}
        isActive={true}
        gesture={gesture}
        confidence={confidence}
        isDebouncing={isDebouncing}
        landmarks={landmarks}
        errorMessage={error}
      />
    </div>
  )
}
