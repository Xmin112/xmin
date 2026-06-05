/**
 * ConcreteDust — FBC 混凝土粉尘粒子系统
 *
 * Control 美学：不是梦幻发光粒子，而是粗野主义建筑中的
 * 混凝土微粒 + 偶尔的希斯红色闪光 + 蓝图网格线。
 *
 * @param {Object} props
 * @param {boolean} [props.active=true]
 * @param {'low'|'medium'|'high'} [props.intensity='medium']
 */

import { useEffect, useRef } from 'react'

const INTENSITY_MAP = {
  low:    { spawnRate: 0.15, maxParticles: 40 },
  medium: { spawnRate: 0.4,  maxParticles: 100 },
  high:   { spawnRate: 0.8,  maxParticles: 200 },
}

export default function ConcreteDust({ active = true, intensity = 'medium' }) {
  const canvasRef = useRef(/** @type {HTMLCanvasElement | null} */ (null))
  const particlesRef = useRef([])
  const frameRef = useRef(0)
  const gridPhase = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let w = window.innerWidth
    let h = window.innerHeight
    canvas.width = w
    canvas.height = h

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }
    window.addEventListener('resize', resize)

    const { spawnRate, maxParticles } = INTENSITY_MAP[intensity] || INTENSITY_MAP.medium

    /** @param {number} cx @param {number} cy */
    const spawnParticle = (cx, cy) => ({
      x: cx + (Math.random() - 0.5) * w * 1.5,
      y: cy + (Math.random() - 0.5) * h * 1.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.3 + 0.1),
      size: Math.random() * 2 + 0.5,
      alpha: 0,
      life: 0,
      maxLife: 80 + Math.random() * 120,
      type: Math.random() > 0.85 ? 'red-flash' : Math.random() > 0.5 ? 'dust' : 'fine',
    })

    const animate = () => {
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2
      const cy = h / 2

      // ── 蓝图网格线 ──
      gridPhase.current += 0.0003
      ctx.save()
      ctx.globalAlpha = 0.03
      ctx.strokeStyle = '#c0392b'
      ctx.lineWidth = 0.5

      const gridSize = 80
      const offsetX = (gridPhase.current % 1) * gridSize
      const offsetY = (gridPhase.current * 0.7 % 1) * gridSize

      for (let x = offsetX; x < w; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = offsetY; y < h; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      ctx.restore()

      if (!active) {
        // 不活跃时粒子自然衰减
        particlesRef.current = particlesRef.current.filter((p) => {
          p.life++
          p.alpha = Math.max(0, p.alpha - 0.02)
          return p.life < p.maxLife
        })
        frameRef.current = requestAnimationFrame(animate)
        return
      }

      // ── 生成粒子 ──
      if (Math.random() < spawnRate && particlesRef.current.length < maxParticles) {
        particlesRef.current.push(spawnParticle(cx, cy))
      }

      // ── 更新和绘制 ──
      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++
        p.x += p.vx
        p.y += p.vy

        const progress = p.life / p.maxLife
        const fadeIn = Math.min(progress * 8, 1)
        const fadeOut = Math.max(1 - (progress - 0.7) / 0.3, 0)
        p.alpha = fadeIn * fadeOut

        if (p.life >= p.maxLife) return false

        ctx.save()

        if (p.type === 'red-flash') {
          // 希斯红色闪光
          ctx.globalAlpha = p.alpha * 0.7
          ctx.fillStyle = '#ff1a1a'
          ctx.shadowColor = '#ff1a1a'
          ctx.shadowBlur = 6
          ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2)
        } else if (p.type === 'dust') {
          // 混凝土粉尘
          ctx.globalAlpha = p.alpha * 0.5
          ctx.fillStyle = '#e8e0d5'
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // 细颗粒
          ctx.globalAlpha = p.alpha * 0.3
          ctx.fillStyle = '#6b6b6b'
          ctx.fillRect(p.x, p.y, p.size * 0.5, p.size * 0.5)
        }

        ctx.restore()
        return true
      })

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [active, intensity])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}
