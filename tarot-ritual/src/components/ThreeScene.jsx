/**
 * ThreeScene — 3D 星空粒子场景 + Bloom 泛光
 *
 * Three.js r0.184 + EffectComposer + UnrealBloomPass
 * 动态星空粒子在球体分布中缓慢旋转。
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

export default function ThreeScene() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const w = window.innerWidth
    const h = window.innerHeight

    // ── 渲染器 ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ReinhardToneMapping
    container.appendChild(renderer.domElement)

    // ── 场景 & 相机 ──
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100)
    camera.position.z = 5

    // ── 星空粒子 ──
    const starCount = 800
    const starGeom = new THREE.BufferGeometry()
    const positions = new Float32Array(starCount * 3)
    const colors = new Float32Array(starCount * 3)
    const sizes = new Float32Array(starCount)

    for (let i = 0; i < starCount; i++) {
      // 球体分布
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 8 + Math.random() * 4
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
      // 颜色：大部分为灰白，少量红色
      const isRed = Math.random() > 0.85
      colors[i * 3] = isRed ? 0.8 : 0.3 + Math.random() * 0.4
      colors[i * 3 + 1] = isRed ? 0.1 : 0.3 + Math.random() * 0.4
      colors[i * 3 + 2] = isRed ? 0.1 : 0.3 + Math.random() * 0.4
      sizes[i] = Math.random() * 3 + 0.5
    }

    starGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    starGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    starGeom.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const starMat = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.8,
    })

    const stars = new THREE.Points(starGeom, starMat)
    scene.add(stars)

    // ── Bloom 后期处理 ──
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h), 0.6, 0.4, 0.85
    )
    bloomPass.threshold = 0.1
    bloomPass.strength = 0.5
    bloomPass.radius = 0.5
    composer.addPass(bloomPass)

    // ── 动画循环 ──
    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      stars.rotation.y += 0.0003
      stars.rotation.x += 0.0001
      composer.render()
    }
    animate()

    // ── Resize ──
    const onResize = () => {
      const w2 = window.innerWidth
      const h2 = window.innerHeight
      camera.aspect = w2 / h2
      camera.updateProjectionMatrix()
      renderer.setSize(w2, h2)
      composer.setSize(w2, h2)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="fixed inset-0" style={{ zIndex: 0 }} />
}
