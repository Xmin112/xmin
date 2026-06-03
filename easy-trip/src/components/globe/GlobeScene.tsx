"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { GeoPoint } from "@/types/route";

interface GlobeSceneProps {
  targetLocation?: GeoPoint | null;
  /** 目的地国家主题色 */
  accentColor?: string;
}

export function GlobeScene({ targetLocation, accentColor = "#FF6B6B" }: GlobeSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 2.6], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={1.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-3, 1, -3]} intensity={0.5} color={accentColor} />

      <GlobeMesh targetLocation={targetLocation} accentColor={accentColor} />
    </Canvas>
  );
}

/** lat/lng → 3D 球面坐标 */
function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = lng * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function GlobeMesh({
  targetLocation,
  accentColor,
}: {
  targetLocation?: GeoPoint | null;
  accentColor: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const cityGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const prevTarget = useRef<string | null>(null);

  // 白色地球纹理
  const earthTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // 纯白底
    ctx.fillStyle = "#FAFAFA";
    ctx.fillRect(0, 0, 1024, 512);

    // 浅灰大陆
    ctx.fillStyle = "#E8E8ED";
    ctx.strokeStyle = "#DCDCE0";
    ctx.lineWidth = 0.8;

    drawContinents(ctx);

    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  // 城市 3D 模型
  const cityBuildings = useMemo(() => {
    if (!targetLocation) return null;

    const { lat, lng } = targetLocation;
    const pos = latLngToVec3(lat, lng, 1.015);
    const normal = pos.clone().normalize();

    // 随机生成建筑群
    const buildings: Array<{ w: number; h: number; d: number; offset: THREE.Vector3 }> = [];
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.008 + Math.random() * 0.035;
      const perpX = new THREE.Vector3(-normal.z, 0, normal.x).normalize();
      const perpY = new THREE.Vector3().crossVectors(normal, perpX).normalize();

      const offset = perpX
        .clone()
        .multiplyScalar(Math.cos(angle) * dist)
        .add(perpY.clone().multiplyScalar(Math.sin(angle) * dist));

      buildings.push({
        w: 0.002 + Math.random() * 0.006,
        h: 0.005 + Math.random() * 0.03,
        d: 0.002 + Math.random() * 0.006,
        offset,
      });
    }

    return { pos, normal, buildings };
  }, [targetLocation]);

  // 相机飞到目标
  useEffect(() => {
    if (!targetLocation || !groupRef.current) return;

    const key = `${targetLocation.lat},${targetLocation.lng}`;
    // 避免重复飞行
    if (prevTarget.current === key) return;
    prevTarget.current = key;

    const targetPos = latLngToVec3(targetLocation.lat, targetLocation.lng, 1.6);
    const startPos = camera.position.clone();
    const startTime = Date.now();
    const duration = 2000;

    function animate() {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      camera.position.lerpVectors(startPos, targetPos, ease);
      camera.lookAt(0, 0, 0);

      if (t < 1) requestAnimationFrame(animate);
    }
    animate();
  }, [targetLocation, camera]);

  // 建筑浮现动画
  useEffect(() => {
    if (!cityGroupRef.current || !cityBuildings) return;

    // 重置：所有建筑 scaleY = 0
    cityGroupRef.current.children.forEach((child) => {
      child.scale.set(1, 0, 1);
    });

    // 依次弹出
    const children = cityGroupRef.current.children;
    children.forEach((child, i) => {
      const delay = i * 40;
      const startTime = Date.now() + delay;
      const duration = 600;

      function popUp() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        // easeOutBack
        const c1 = 1.70158;
        const c3 = c1 + 1;
        const ease = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);

        child.scale.set(1, ease, 1);

        if (t < 1) requestAnimationFrame(popUp);
      }

      setTimeout(popUp, delay);
    });
  }, [cityBuildings]);

  // 地球自转
  useFrame((_, delta) => {
    if (meshRef.current && !targetLocation) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 地球球体 */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 80, 80]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.55}
          metalness={0.02}
        />
      </mesh>

      {/* 大气光晕 */}
      <mesh>
        <sphereGeometry args={[1.025, 64, 64]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 城市 3D 建筑群 */}
      {cityBuildings && (
        <group
          ref={cityGroupRef}
          position={cityBuildings.pos.toArray()}
          quaternion={
            new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              cityBuildings.normal
            )
          }
        >
          {cityBuildings.buildings.map((b, i) => (
            <mesh key={i} position={b.offset.toArray()}>
              <boxGeometry args={[b.w, b.h, b.d]} />
              <meshStandardMaterial
                color={accentColor}
                roughness={0.3}
                metalness={0.15}
                transparent
                opacity={0.85}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

/** 简化的世界大陆 */
function drawContinents(ctx: CanvasRenderingContext2D) {
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
