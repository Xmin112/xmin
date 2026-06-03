"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import type { GeoPoint } from "@/types/route";

export type ZoomLevel = "world" | "country" | "city" | "district";

interface GlobeSceneProps {
  targetLocation?: GeoPoint | null;
  accentColor?: string;
  zoomLevel?: ZoomLevel;
}

const ZOOM_DISTANCES: Record<ZoomLevel, number> = {
  world: 2.8,
  country: 1.8,
  city: 1.2,
  district: 1.02,
};

export function GlobeScene({ targetLocation, accentColor = "#86868B", zoomLevel = "world" }: GlobeSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.3, ZOOM_DISTANCES.world], fov: 35 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      style={{ background: "transparent" }}
    >
      <Environment preset="studio" environmentIntensity={0.4} />
      <ambientLight intensity={1.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.0} />
      <pointLight position={[-3, 1, -2]} intensity={0.6} color={accentColor} />

      {/* 体积光模拟 — 彩色球体光源 */}
      <mesh position={[2, 1.5, -2]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.15} />
      </mesh>

      <GlobeMesh targetLocation={targetLocation} accentColor={accentColor} zoomLevel={zoomLevel} />
    </Canvas>
  );
}

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
  zoomLevel,
}: {
  targetLocation?: GeoPoint | null;
  accentColor: string;
  zoomLevel: ZoomLevel;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cityGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const prevZoom = useRef<ZoomLevel>("world");

  // 磨砂玻璃地球纹理
  const earthTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // 透明底色
    ctx.clearRect(0, 0, 1024, 512);

    // 浅灰大陆 — 微妙、半透明感
    ctx.fillStyle = "rgba(200,200,210,0.5)";
    ctx.strokeStyle = "rgba(180,180,190,0.3)";
    ctx.lineWidth = 0.5;

    drawContinents(ctx);

    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  // 城市建筑
  const cityBuildings = useMemo(() => {
    if (!targetLocation) return null;
    const { lat, lng } = targetLocation;
    const pos = latLngToVec3(lat, lng, 1.01);
    const normal = pos.clone().normalize();

    const buildings: Array<{ w: number; h: number; d: number; offset: THREE.Vector3 }> = [];
    const perpX = new THREE.Vector3(-normal.z, 0, normal.x).normalize();
    const perpY = new THREE.Vector3().crossVectors(normal, perpX).normalize();

    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.004 + Math.random() * 0.03;
      const offset = perpX.clone().multiplyScalar(Math.cos(angle) * dist)
        .add(perpY.clone().multiplyScalar(Math.sin(angle) * dist));
      buildings.push({
        w: 0.0015 + Math.random() * 0.005,
        h: 0.004 + Math.random() * 0.025,
        d: 0.0015 + Math.random() * 0.005,
        offset,
      });
    }
    return { pos, normal, buildings };
  }, [targetLocation]);

  // 相机飞行
  useEffect(() => {
    const targetDist = ZOOM_DISTANCES[zoomLevel];
    let targetPos: THREE.Vector3;

    if (zoomLevel !== "world" && targetLocation) {
      targetPos = latLngToVec3(targetLocation.lat, targetLocation.lng, targetDist);
    } else {
      targetPos = new THREE.Vector3(0, 0.3, targetDist);
    }

    const startPos = camera.position.clone();
    const startTime = Date.now();
    const duration = prevZoom.current === "world" && zoomLevel !== "world" ? 2500 : 1200;
    prevZoom.current = zoomLevel;

    function animate() {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic

      camera.position.lerpVectors(startPos, targetPos, ease);
      camera.lookAt(0, 0, 0);

      if (t < 1) requestAnimationFrame(animate);
    }
    animate();
  }, [zoomLevel, targetLocation, camera]);

  // 建筑弹出
  useEffect(() => {
    if (!cityGroupRef.current || !cityBuildings) return;
    const children = cityGroupRef.current.children;
    children.forEach((child) => { child.scale.set(1, 0, 1); });
    children.forEach((child, i) => {
      const delay = i * 35;
      setTimeout(() => {
        const start = Date.now();
        function pop() {
          const elapsed = Date.now() - start;
          const t = Math.min(elapsed / 500, 1);
          const c1 = 1.70158; const c3 = c1 + 1;
          const e = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
          child.scale.set(1, Math.max(0, e), 1);
          if (t < 1) requestAnimationFrame(pop);
        }
        pop();
      }, delay);
    });
  }, [cityBuildings]);

  // 自转
  useFrame((_, delta) => {
    if (meshRef.current && !targetLocation) {
      meshRef.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <group>
      {/* 地球球体 — 磨砂玻璃 */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 100, 100]} />
        <meshPhysicalMaterial
          map={earthTexture}
          roughness={0.35}
          metalness={0.05}
          clearcoat={0.1}
          clearcoatRoughness={0.4}
          transparent
          opacity={0.92}
          color={"#FAFAFA"}
        />
      </mesh>

      {/* 大气光晕 */}
      <mesh>
        <sphereGeometry args={[1.02, 64, 64]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

      {/* 外层发光环 */}
      <mesh>
        <sphereGeometry args={[1.04, 64, 64]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>

      {/* 城市建筑 */}
      {cityBuildings && zoomLevel === "district" && (
        <group
          ref={cityGroupRef}
          position={cityBuildings.pos.toArray()}
          quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), cityBuildings.normal)}
        >
          {cityBuildings.buildings.map((b, i) => (
            <mesh key={i} position={b.offset.toArray()}>
              <boxGeometry args={[b.w, b.h, b.d]} />
              <meshStandardMaterial color={accentColor} roughness={0.25} metalness={0.2} transparent opacity={0.9} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

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
    ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot);
    ctx.beginPath(); ctx.ellipse(0, 0, s.w / 2, s.h / 2, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke(); ctx.restore();
  });
}
