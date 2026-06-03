"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  accentColor: string;
  visible: boolean;
}

function generateSeoulBuildings() {
  const buildings: Array<{
    x: number; z: number; w: number; d: number; h: number;
    isPOI?: boolean; poiIndex?: number;
  }> = [];
  for (let i = 0; i < 30; i++) {
    const z = -15 + i * 1.2;
    const off = Math.sin(i * 0.7) * 3;
    buildings.push({ x: -6 + off + (Math.random() - 0.5) * 2, z, w: 1.5 + Math.random() * 4, d: 2 + Math.random() * 4, h: 2 + Math.random() * 8 });
    buildings.push({ x: 6 + off + (Math.random() - 0.5) * 2, z, w: 1.5 + Math.random() * 4, d: 2 + Math.random() * 4, h: 2 + Math.random() * 8 });
  }
  for (let i = 0; i < 15; i++) {
    const x = -10 + i * 1.8;
    buildings.push({ x, z: -3 + (Math.random() - 0.5) * 8, w: 2 + Math.random() * 3, d: 2 + Math.random() * 3, h: 2 + Math.random() * 6 });
  }
  const pois: Array<[number, number, number, number, number]> = [
    [-5, -12, 3, 3, 6.5], [3, -6, 3.5, 3, 7], [-2, 2, 3, 3.5, 6], [4, 10, 3.5, 3.5, 7.5],
  ];
  pois.forEach((p, i) => {
    buildings.push({ x: p[0], z: p[1], w: p[2], d: p[3], h: p[4], isPOI: true, poiIndex: i + 1 });
  });
  return buildings;
}

const BUILDINGS = generateSeoulBuildings();

// 道路：用线段
const ROADS: Array<[number, number, number, number, number, number]> = [
  [-8, 0.01, -20, -8, 0.01, 20], [-4, 0.01, -20, -4, 0.01, 20],
  [0, 0.01, -20, 0, 0.01, 20], [4, 0.01, -20, 4, 0.01, 20],
  [8, 0.01, -20, 8, 0.01, 20],
  [-15, 0.01, -14, 15, 0.01, -14], [-15, 0.01, -9, 15, 0.01, -9],
  [-15, 0.01, -4, 15, 0.01, -4], [-15, 0.01, 1, 15, 0.01, 1],
  [-15, 0.01, 6, 15, 0.01, 6], [-15, 0.01, 11, 15, 0.01, 11],
];

// 路线：串联 POI
const ROUTE_POINTS: [number, number, number][] = [
  [-5, 0.12, -12], [3, 0.12, -6], [-2, 0.12, 2], [4, 0.12, 10],
];

function WorldScene({ accentColor, visible }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const poppedRef = useRef(false);

  useEffect(() => {
    if (!visible || poppedRef.current || !groupRef.current) return;
    poppedRef.current = true;
    const children = Array.from(groupRef.current.children) as THREE.Mesh[];
    children.forEach(c => { c.scale.set(1, 0, 1); c.visible = true; });
    children.forEach((child, i) => {
      setTimeout(() => {
        const start = Date.now();
        const pop = () => {
          const t = Math.min((Date.now() - start) / 500, 1);
          const c1 = 1.70158; const c3 = c1 + 1;
          child.scale.set(1, Math.max(0, 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)), 1);
          if (t < 1) requestAnimationFrame(pop);
        };
        pop();
      }, i * 30);
    });
  }, [visible]);

  return (
    <group>
      <ambientLight intensity={0.7} />
      <directionalLight position={[15, 20, 10]} intensity={1.2} color="#FFF8F0" />
      <hemisphereLight args={["#E8F0FF", "#FFF8F0", 0.4]} />

      {/* 地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#FAF9F6" roughness={0.9} />
      </mesh>

      {/* 道路 */}
      {ROADS.map((r, i) => (
        <Line key={`r${i}`} points={[[r[0], r[1], r[2]], [r[3], r[4], r[5]]]}
          color="#E0DDD6" lineWidth={0.6} transparent opacity={0.5} />
      ))}

      {/* 建筑 */}
      <group ref={groupRef}>
        {BUILDINGS.map((b, i) => (
          <group key={i} position={[b.x, b.h / 2, b.z]} visible={false}>
            <mesh castShadow>
              <boxGeometry args={[b.w, b.h, b.d]} />
              <meshStandardMaterial color={b.isPOI ? "#F5F0EC" : "#F2F0ED"} roughness={0.65} metalness={0.02} />
            </mesh>
            {b.isPOI && (
              <mesh position={[0, b.h / 2 + 0.3, 0]}>
                <cylinderGeometry args={[0.7, 0.7, 0.12, 32]} />
                <meshStandardMaterial color={accentColor} roughness={0.3} metalness={0.1} />
              </mesh>
            )}
            {b.isPOI && b.poiIndex && (
              <mesh position={[0, b.h + 1.5, 0]}>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshBasicMaterial color={accentColor} />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {/* 金色路线 */}
      <Line points={ROUTE_POINTS} color="#F5A623" lineWidth={2} transparent opacity={0.8} />
      <Line points={ROUTE_POINTS.map(p => [p[0], p[1] + 0.05, p[2]] as [number, number, number])}
        color="#FFD93D" lineWidth={1} transparent opacity={0.3} />

      {/* 起点星 */}
      <mesh position={[-5, 1.2, -12]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color="#FFD93D" />
      </mesh>
    </group>
  );
}

export function VoyageWorld({ accentColor, visible }: Props) {
  return (
    <div className="w-full h-full" style={{ opacity: visible ? 1 : 0, transition: "opacity 800ms" }}>
      <Canvas gl={{ antialias: true, alpha: true }} orthographic
        camera={{ position: [8, 14, 10], zoom: 25, near: 0.1, far: 100 }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0, 0);
          (camera as THREE.OrthographicCamera).updateProjectionMatrix();
        }}>
        <WorldScene accentColor={accentColor} visible={visible} />
      </Canvas>
    </div>
  );
}
