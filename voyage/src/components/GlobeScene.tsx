"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

export type ZoomLevel = "world" | "continent" | "country" | "city" | "district";

interface Props {
  zoomLevel: ZoomLevel;
  accentColor: string;
  onFlightComplete?: () => void;
}

const DISTANCES: Record<ZoomLevel, number> = {
  world: 2.8, continent: 2.0, country: 1.5, city: 1.15, district: 1.03,
};

const SEOUL = { lat: 37.5665, lng: 126.978 };

export function GlobeScene({ zoomLevel, accentColor, onFlightComplete }: Props) {
  return (
    <Canvas camera={{ position: [0, 0.3, DISTANCES.world], fov: 35 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <Environment preset="studio" environmentIntensity={0.3} />
      <ambientLight intensity={1.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.0} />
      <pointLight position={[-3, 1, -2]} intensity={0.6} color={accentColor} />
      <GlobeMesh zoomLevel={zoomLevel} accentColor={accentColor} onFlightComplete={onFlightComplete} />
    </Canvas>
  );
}

function latLngToVec3(lat: number, lng: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = lng * (Math.PI / 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function GlobeMesh({ zoomLevel, accentColor, onFlightComplete }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const flying = useRef(false);

  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 512;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, 1024, 512);
    ctx.fillStyle = "rgba(200,200,210,0.45)";
    ctx.strokeStyle = "rgba(180,180,190,0.25)";
    ctx.lineWidth = 0.5;
    const shapes = [
      [150,80,180,130,60,50,-0.2],[120,60,140,80,50,35,-0.1],[200,280,60,120,25,50,0.15],
      [480,70,120,80,50,35,0.1],[500,200,100,180,40,80,0],[620,60,250,140,100,60,0.05],
      [680,180,120,80,50,35,-0.1],[740,240,40,30,15,12,0.3],[750,320,70,50,30,20,0.2],
      [640,100,160,100,70,45,-0.05],[810,100,18,60,8,25,0.1],[790,90,15,25,6,10,0],
    ];
    shapes.forEach(([x,y,w,h,rx,ry,rot]) => {
      ctx.save(); ctx.translate(x,y); ctx.rotate(rot as number);
      ctx.beginPath(); ctx.ellipse(0,0,(w as number)/2,(h as number)/2,0,0,Math.PI*2);
      ctx.fill(); ctx.stroke(); ctx.restore();
    });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  useEffect(() => {
    if (zoomLevel === "world" || flying.current) return;
    flying.current = true;

    const target = zoomLevel === "district"
      ? latLngToVec3(SEOUL.lat, SEOUL.lng, DISTANCES[zoomLevel])
      : zoomLevel === "city"
        ? latLngToVec3(SEOUL.lat, SEOUL.lng, DISTANCES[zoomLevel])
        : new THREE.Vector3(0, 0.15, DISTANCES[zoomLevel]);

    const start = camera.position.clone();
    const startTime = Date.now();
    const duration = 1500 + (zoomLevel === "continent" ? 300 : 0);

    function animate() {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(start, target, ease);
      camera.lookAt(0, 0, 0);
      if (t < 1) { requestAnimationFrame(animate); }
      else if (zoomLevel === "district" && onFlightComplete) { onFlightComplete(); }
    }
    animate();
  }, [zoomLevel, camera, onFlightComplete]);

  useFrame((_, delta) => {
    if (meshRef.current && zoomLevel === "world") {
      meshRef.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 100, 100]} />
        <meshPhysicalMaterial map={texture} roughness={0.35} metalness={0.05}
          clearcoat={0.1} clearcoatRoughness={0.4} transparent opacity={0.92} color="#FAFAFA" />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.02, 64, 64]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.04, 64, 64]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.03} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
