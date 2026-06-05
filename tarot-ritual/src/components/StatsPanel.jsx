/**
 * StatsPanel — 右侧统计数据面板
 *
 * 彩虹卡开关 · 卡牌总数 · 抽卡记录 · 全屏切换
 */

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function StatsPanel({ drawCount = 0, totalCards = 78 }) {
  const [rainbow, setRainbow] = useState(false)
  const [fs, setFs] = useState(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setFs(true) }
    else { document.exitFullscreen(); setFs(false) }
  }

  return (
    <motion.div className="fixed right-4 top-24 z-40 flex flex-col gap-2"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}>
      {[
        { label: 'RAINBOW', value: rainbow ? 'ON' : 'OFF', action: () => setRainbow(!rainbow), active: rainbow },
        { label: 'CARDS', value: `${drawCount}/${totalCards}`, action: null, active: false },
        { label: 'FULLSCREEN', value: fs ? 'ON' : 'OFF', action: toggleFullscreen, active: fs },
      ].map((item, i) => (
        <div key={i}
          onClick={item.action}
          className="cursor-pointer px-3 py-2 flex justify-between gap-6 items-center"
          style={{
            background: `rgba(18,18,24,0.85)`,
            backdropFilter: 'blur(12px)',
            border: `1px solid ${item.active ? 'rgba(192,57,43,0.4)' : 'rgba(107,107,107,0.15)'}`,
            transition: 'border-color 0.3s ease',
          }}>
          <span style={{ fontSize: 8, color: '#6b6b6b', letterSpacing: '0.15em', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
            {item.label}
          </span>
          <span style={{
            fontSize: 10, color: item.active ? '#e8e0d5' : '#6b6b6b',
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
          }}>
            {item.value}
          </span>
        </div>
      ))}
    </motion.div>
  )
}
