/**
 * IdleScreen — 待命界面
 *
 * FBC 终端启动画面：
 *   倒金字塔几何标记 · 打字机闪烁光标 · 全大写文字
 *   显示提示：展示手掌以开始生物特征校准
 */

import { motion } from 'framer-motion'
import useCaseStore from '../core/caseMachine'

export default function IdleScreen({ onStart }) {
  const touchMode = useCaseStore((s) => s.touchMode)

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center gap-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      {/* 倒金字塔几何标记 */}
      <div className="relative" style={{ width: 80, height: 80 }}>
        {/* 外框 */}
        <div style={{
          position: 'absolute',
          inset: 0,
          border: '1px solid rgba(192,57,43,0.2)',
        }} />
        {/* 内三角 */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 0, height: 0,
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderBottom: '34px solid rgba(192,57,43,0.15)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
        {/* 点 */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 4, height: 4,
            background: '#c0392b',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* 标题 */}
      <div className="text-center flex flex-col items-center gap-3">
        <h1
          className="text-center"
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '0.5em',
            color: '#e8e0d5',
            fontFamily: "'JetBrains Mono', monospace",
            textTransform: 'uppercase',
          }}
        >
          TAROT
        </h1>
        <div style={{
          width: 60, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(192,57,43,0.6), transparent)',
        }} />
        <div className="fbc-label" style={{ fontSize: 9, marginTop: 4 }}>
          FBC PARANATURAL DIVISION
        </div>
      </div>

      {/* 操作提示 */}
      <div className="text-center flex flex-col items-center gap-5">
        <div className="fbc-label" style={{ fontSize: 8 }}>
          THRESHOLD ENTITY ARCHIVE ACCESS
        </div>
        <div style={{
          fontSize: 10,
          color: '#6b6b6b',
          letterSpacing: '0.1em',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {touchMode
            ? 'PRESS BUTTON TO INITIATE CALIBRATION'
            : 'PLACE OPEN PALM TOWARD CAMERA'
          }
        </div>

        {/* 闪烁光标 */}
        <motion.div
          style={{ width: 12, height: 2, background: '#c0392b' }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* 触控模式按钮 */}
        {touchMode && (
          <motion.button
            className="fbc-btn"
            onClick={onStart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: 11 }}
          >
            INITIATE CALIBRATION
          </motion.button>
        )}
      </div>

      {/* 底部 FBC 标识 */}
      <div className="absolute bottom-12 text-center">
        <div className="fbc-label" style={{ fontSize: 6 }}>
          FEDERAL BUREAU OF CONTROL · PARANATURAL RESEARCH DIVISION
        </div>
        <div className="fbc-label" style={{ fontSize: 6, marginTop: 2 }}>
          ENTITY TYPE: THRESHOLD · CASE 22 · CLEARANCE LEVEL 5
        </div>
      </div>
    </motion.div>
  )
}
