"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { GeoPoint } from "@/types/route";

interface GlobeSceneProps {
  targetLocation?: GeoPoint | null;
  interactive?: boolean;
  compact?: boolean;
}

/** 轻量透明地球 — 适配浅色背景 */
export function GlobeScene({
  targetLocation,
  interactive = true,
  compact = false,
}: GlobeSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 2.3], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.0} />
      <directionalLight position={[-3, 1, -3]} intensity={0.4} />

      <GlobeMesh targetLocation={targetLocation} />

      {!compact && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!targetLocation}
          autoRotateSpeed={0.4}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.8}
        />
      )}
    </Canvas>
  );
}

/** 浅色地球 — 白底风格 */
function GlobeMesh({ targetLocation }: { targetLocation?: GeoPoint | null }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  // 干净的淡色地球纹理
  const earthTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // 淡奶油底色
    ctx.fillStyle = "#F5F0E8";
    ctx.fillRect(0, 0, 1024, 512);

    // 浅色大陆
    ctx.fillStyle = "#E8E0D0";
    ctx.strokeStyle = "#D5C8B5";
    ctx.lineWidth = 1;

    drawCleanContinents(ctx);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // 飞向目标
  useEffect(() => {
    if (!targetLocation || !groupRef.current) return;

    const { lat, lng } = targetLocation;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = lng * (Math.PI / 180);

    const targetPos = new THREE.Vector3().setFromSphericalCoords(3, phi, -theta);

    const startPos = camera.position.clone();
    const startTime = Date.now();
    const duration = 1600;

    function animate() {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      camera.position.lerpVectors(startPos, targetPos, ease);
      camera.lookAt(0, 0, 0);

      if (t < 1) requestAnimationFrame(animate);
    }
    animate();
  }, [targetLocation, camera]);

  useFrame((_, delta) => {
    if (meshRef.current && !targetLocation) {
      meshRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 72, 72]} />
        <meshStandardMaterial map={earthTexture} roughness={0.6} metalness={0} />
      </mesh>
      {/* 大气圈 — 柔和光晕 */}
      <mesh>
        <sphereGeometry args={[1.03, 64, 64]} />
        <meshBasicMaterial
          color="#C8D8E8"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

/** 干净的大陆绘制 */
function drawCleanContinents(ctx: CanvasRenderingContext2D) {
  const shapes = [
    { x: 150, y: 80, w: 180, h: 130, rx: 60, ry: 50, rot: -0.2 },
    { x: 120, y: 60, w: 140, h: 80, rx: 50, ry: 35, rot: -0.1 },
    { x: 200, y: 280, w: 60, h: 120, rx: 25, ry: 50, rot: 0.15 },
    { x: 480, y: 70, w: 120, h: 80, rx: 50, ry: 35, rot: 0.1 },
    { x: 500, y: 200, w: 100, h: 180, rx: 40, ry: 80, rot: 0 },
    { x: 620, y: 60, w: 250, h: 140, rx: 100, ry: 60, rot: 0.05 },
    { x: 680, y: 180, w: 120, h: 80, rx: 50, ry: 35, rot: -0.1 },
    { x: 740, y: 240, w: 40, h: 30, rx: 15, ry: 12, rot: 0.3 },
    { x: 750, y: 320, w: 70, h: 50, rx: 30, ry: 20, rot: 0.2 },
    { x: 640, y: 100, w: 160, h: 100, rx: 70, ry: 45, rot: -0.05 },
    { x: 810, y: 100, w: 18, h: 60, rx: 8, ry: 25, rot: 0.1 },
    { x: 790, y: 90, w: 15, h: 25, rx: 6, ry: 10, rot: 0 },
  ];

  shapes.forEach((s) => {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, s.w / 2, s.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
}
