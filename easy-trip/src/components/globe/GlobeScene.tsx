"use client";

import { useRef, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { GeoPoint } from "@/types/route";

interface GlobeSceneProps {
  /** 目标地点，globe 会旋转到对应位置 */
  targetLocation?: GeoPoint | null;
  /** 是否交互模式（聊天页）还是纯展示（首页） */
  interactive?: boolean;
  /** 是否缩小模式（右侧栏） */
  compact?: boolean;
  /** 缩放级别 */
  zoom?: number;
}

/** 地球 3D 场景 */
export function GlobeScene({
  targetLocation,
  interactive = true,
  compact = false,
  zoom = 2.2,
}: GlobeSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, zoom], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <Stars radius={100} depth={60} count={800} factor={4} saturation={0} fade speed={0.5} />

      <GlobeMesh targetLocation={targetLocation} />

      {interactive && !compact && (
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={1.5}
          maxDistance={5}
          autoRotate={targetLocation ? false : true}
          autoRotateSpeed={0.3}
        />
      )}
    </Canvas>
  );
}

/** 地球球体 */
function GlobeMesh({ targetLocation }: { targetLocation?: GeoPoint | null }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const earthTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // 海洋底色 — 深蓝
    ctx.fillStyle = "#0a1628";
    ctx.fillRect(0, 0, 1024, 512);

    // 简化的大陆形状（手绘风格的点状大陆）
    drawContinents(ctx);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // 定位到目标城市
  useEffect(() => {
    if (!targetLocation || !groupRef.current) return;

    const { lat, lng } = targetLocation;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = lng * (Math.PI / 180);

    const targetPos = new THREE.Vector3().setFromSphericalCoords(
      3.5,
      phi,
      -theta
    );

    // 平滑移动相机
    const startPos = camera.position.clone();
    const startTime = Date.now();
    const duration = 1500;

    function animate() {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      // easeInOutCubic
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      camera.position.lerpVectors(startPos, targetPos, ease);
      camera.lookAt(0, 0, 0);

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    }

    animate();
  }, [targetLocation, camera]);

  // 缓慢自转
  useFrame((_, delta) => {
    if (meshRef.current && !targetLocation) {
      meshRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.8}
          metalness={0.1}
        />
        {/* 大气光晕 */}
        <mesh>
          <sphereGeometry args={[1.02, 64, 64]} />
          <meshBasicMaterial
            color="#4ecdc4"
            transparent
            opacity={0.06}
            side={THREE.BackSide}
          />
        </mesh>
      </mesh>
    </group>
  );
}

/** 绘制简化手绘风格大陆形状 */
function drawContinents(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#1a3550";
  ctx.strokeStyle = "#2a5570";
  ctx.lineWidth = 1.5;

  // 简化的大陆块（用椭圆近似表示）
  const continents = [
    // 北美洲
    { x: 150, y: 80, w: 180, h: 130, rx: 60, ry: 50, rot: -0.2 },
    { x: 120, y: 60, w: 140, h: 80, rx: 50, ry: 35, rot: -0.1 },
    // 南美洲
    { x: 200, y: 280, w: 60, h: 120, rx: 25, ry: 50, rot: 0.15 },
    // 欧洲
    { x: 480, y: 70, w: 120, h: 80, rx: 50, ry: 35, rot: 0.1 },
    // 非洲
    { x: 500, y: 200, w: 100, h: 180, rx: 40, ry: 80, rot: 0 },
    // 亚洲
    { x: 620, y: 60, w: 250, h: 140, rx: 100, ry: 60, rot: 0.05 },
    { x: 680, y: 180, w: 120, h: 80, rx: 50, ry: 35, rot: -0.1 },
    // 东南亚群岛
    { x: 740, y: 240, w: 40, h: 30, rx: 15, ry: 12, rot: 0.3 },
    // 澳大利亚
    { x: 750, y: 320, w: 70, h: 50, rx: 30, ry: 20, rot: 0.2 },
    // 东亚（中国）
    { x: 640, y: 100, w: 160, h: 100, rx: 70, ry: 45, rot: -0.05 },
    // 日本
    { x: 810, y: 100, w: 18, h: 60, rx: 8, ry: 25, rot: 0.1 },
    // 韩国
    { x: 790, y: 90, w: 15, h: 25, rx: 6, ry: 10, rot: 0 },
  ];

  continents.forEach((c) => {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
}
