/**
 * useHandTracking — MediaPipe Hands 集成 Hook
 *
 * 初始化摄像头、加载 MediaPipe、逐帧检测手势。
 * 返回手势标签、置信度、关键点、摄像头状态和错误信息。
 *
 * 改编自 tarot/src/hooks/useHandDetection.ts
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { detectGesture, filterGesture } from '../core/gestureController'

/**
 * @typedef {'none'|'open'|'pinch'|'swipe'} Gesture
 */

/**
 * @param {boolean} active — 是否激活摄像头追踪
 * @returns {{
 *   gesture: Gesture,
 *   confidence: number,
 *   landmarks: Array<{x:number,y:number,z:number}> | null,
 *   indexTip: {x:number,y:number} | null,
 *   isReady: boolean,
 *   videoRef: React.RefObject<HTMLVideoElement | null>,
 *   error: string | null,
 * }}
 */
export function useHandTracking(active) {
  const [gesture, setGesture]     = useState(/** @type {Gesture} */ ('none'))
  const [confidence, setConf]     = useState(0)
  const [landmarks, setLandmarks] = useState(null)
  const [indexTip, setIndexTip]   = useState(null)
  const [isReady, setIsReady]     = useState(false)
  const [error, setError]         = useState(null)

  const videoRef        = useRef(/** @type {HTMLVideoElement | null} */ (null))
  const handsRef        = useRef(null)
  const cameraRef       = useRef(null)
  const gestureHistory  = useRef([])
  const positionHistory = useRef([])
  const mountedRef      = useRef(true)

  const onResults = useCallback((results) => {
    if (!mountedRef.current) return

    if (results.multiHandLandmarks?.length > 0) {
      const lm = results.multiHandLandmarks[0]
      setLandmarks(lm)
      // 食指指尖位置（用于卡片光标追踪）
      if (lm[8]) setIndexTip({ x: lm[8].x, y: lm[8].y })

      // 更新位置历史
      const wrist = lm[0] // 手腕 = 关键点 0
      positionHistory.current.push({ x: wrist.x, y: wrist.y })
      if (positionHistory.current.length > 8) {
        positionHistory.current.shift()
      }

      const raw = detectGesture(lm, positionHistory.current)
      const filtered = filterGesture(raw.gesture, gestureHistory.current)

      setGesture(filtered.gesture)
      setConf(filtered.confidence)
    } else {
      setLandmarks(null)
      setIndexTip(null)
      // 无手时清空历史
      gestureHistory.current = []
      positionHistory.current = []
      setGesture('none')
      setConf(0)
    }
  }, [])

  useEffect(() => {
    if (!active) return
    mountedRef.current = true

    let handsModule = null
    let cameraModule = null

    const init = async () => {
      try {
        // 动态导入 MediaPipe
        handsModule = await import('@mediapipe/hands')
        cameraModule = await import('@mediapipe/camera_utils')

        if (!mountedRef.current) return

        const hands = new handsModule.Hands({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        })

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,        // 轻量模型
          minDetectionConfidence: 0.5, // 降低阈值以适配更多环境
          minTrackingConfidence: 0.4,
        })

        hands.onResults(onResults)
        handsRef.current = hands

        if (videoRef.current) {
          const camera = new cameraModule.Camera(videoRef.current, {
            onFrame: async () => {
              if (handsRef.current && videoRef.current) {
                await handsRef.current.send({ image: videoRef.current })
              }
            },
            width: 320,
            height: 240,
          })

          cameraRef.current = camera
          await camera.start()

          if (mountedRef.current) {
            setIsReady(true)
            setError(null)
          }
        }
      } catch (err) {
        console.error('[FBC::BIOMETRIC] 初始化失败:', err)

        if (!mountedRef.current) return

        // 分类错误类型
        const msg = err.message || String(err)
        if (msg.includes('NotAllowed') || msg.includes('Permission')) {
          setError('CAMERA_DENIED')
        } else if (msg.includes('NotFound') || msg.includes('device')) {
          setError('CAMERA_NOT_FOUND')
        } else if (msg.includes('mediapipe') || msg.includes('Hands')) {
          setError('MEDIAPIPE_ERROR')
        } else {
          setError('UNKNOWN')
        }
        setIsReady(false)
      }
    }

    init()

    return () => {
      mountedRef.current = false
      if (cameraRef.current?.stop) {
        try { cameraRef.current.stop() } catch (_) { /* ignore */ }
      }
      if (handsRef.current?.close) {
        try { handsRef.current.close() } catch (_) { /* ignore */ }
      }
    }
  }, [active, onResults])

  return {
    gesture, confidence, landmarks, indexTip, isReady, videoRef, error,
  }
}
