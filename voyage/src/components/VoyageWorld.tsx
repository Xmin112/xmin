"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, Text, Html } from "@react-three/drei";
import * as THREE from "three";

// ─── 数据 ───────────────────────────────

interface Bld { id: string; x: number; z: number; w: number; d: number; h: number; name: string; type: "poi" | "hidden" | "normal"; desc: string }

const BUILDINGS: Bld[] = [
  { id: "cafe-onion", x: -5, z: -5, w: 5, d: 4, h: 6, name: "Cafe Onion 圣水店", type: "poi", desc: "圣水洞地标工业风咖啡馆，旧工厂改造，面包和咖啡都超赞。" },
  { id: "tamburins", x: 4, z: -4, w: 4.5, d: 3.5, h: 7.5, name: "Tamburins 旗舰店", type: "poi", desc: "韩国最火的香氛品牌，独栋建筑里摆满了艺术装置般的护肤品。" },
  { id: "daelim", x: 3, z: 6, w: 6, d: 5, h: 5.5, name: "大林仓库", type: "poi", desc: "废弃仓库改造的前卫艺术空间，常年举办各种展览和快闪活动。" },
  { id: "hidden-mural", x: 9, z: 11, w: 2.5, d: 2, h: 3, name: "隐藏壁画", type: "hidden", desc: "藏在巷子深处的街头壁画，是本地艺术家的秘密作品，只有沿着小巷走到底才能发现。" },
  ...Array.from({ length: 18 }, (_, i) => {
    const gx = (i % 6) - 2.5;
    const gz = Math.floor(i / 6) - 1;
    return {
      id: `b${i}`, x: gx * 3.2 + (Math.random() - 0.5) * 1.5, z: -10 + gz * 5 + (Math.random() - 0.5) * 2,
      w: 1.5 + Math.random() * 3, d: 2 + Math.random() * 3, h: 2 + Math.random() * 5,
      name: "", type: "normal" as const, desc: "",
    };
  }),
];

interface NPC { id: string; x: number; z: number; name: string; dialog: string[] }

const NPCS: NPC[] = [
  { id: "barista", x: -5, z: -2.5, name: "咖啡师小朴", dialog: ["欢迎！☕", "圣水洞以前是工业区，现在变成首尔最火的艺术街区了。", "往东边走走，有一条小巷子里藏着一幅很美很美的壁画…"] },
  { id: "artist", x: 3, z: 8.5, name: "艺术家智恩", dialog: ["大林仓库以前真的是仓库！", "我喜欢圣水洞这种新旧混合的感觉。", "三个主要地点都逛完了吗？去东边巷子看看？"] },
];

const ROADS: Array<[number, number, number, number, number, number]> = [
  [-13, 0, -2, 14, 0, -2], [-13, 0, -7, 14, 0, -7],
  [-13, 0, 3, 14, 0, 3], [-13, 0, 8, 14, 0, 8],
  [-6, 0, -14, -6, 0, 14], [-1, 0, -14, -1, 0, 14],
  [4, 0, -14, 4, 0, 14], [9, 0, -14, 9, 0, 14],
];

const TOTAL = 4; // 3 POIs + 1 hidden

// ─── 主场景 ──────────────────────────────

function Scene({ accentColor }: { accentColor: string }) {
  const charRef = useRef<THREE.Group>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<{ npc: string; text: string } | null>(null);
  const [poiInfo, setPoiInfo] = useState<Bld | null>(null);
  const [earnedStamp, setEarnedStamp] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const targetRef = useRef<THREE.Vector3 | null>(null);
  const [charPos] = useState({ x: -8, z: -12 });

  const discover = useCallback((id: string) => {
    setDiscovered(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev); next.add(id);
      if (next.size >= TOTAL && !earnedStamp) {
        setTimeout(() => setEarnedStamp(true), 600);
      }
      return next;
    });
  }, [earnedStamp]);

  const count = discovered.size;

  // 角色移动
  useFrame((_, delta) => {
    if (!charRef.current || !targetRef.current) return;
    const p = charRef.current.position;
    const t = targetRef.current;
    const dx = t.x - p.x; const dz = t.z - p.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 0.2) { targetRef.current = null; charRef.current.position.y = 0; return; }
    const spd = 4.5 * delta;
    p.x += (dx / dist) * spd;
    p.z += (dz / dist) * spd;
    p.y = Math.abs(Math.sin(Date.now() * 0.012)) * 0.1;
    charRef.current.rotation.y = Math.atan2(dx, dz);
  });

  const moveTo = (x: number, z: number) => { targetRef.current = new THREE.Vector3(x, 0, z); };

  // 进入建筑
  const enterBuilding = (b: Bld) => {
    const doorZ = b.z + b.d / 2 + 0.5;
    moveTo(b.x, doorZ);
    setTimeout(() => {
      discover(b.id);
      setShowHint(false);
      if (b.type === "hidden") {
        setDialog({ npc: "✨ 发现隐藏地点！", text: b.desc + "\n\n你获得了一枚记忆碎片。" });
      } else {
        setPoiInfo(b);
      }
    }, 1400);
  };

  // 对话 NPC
  const talkToNPC = (npc: NPC) => {
    const text = npc.dialog[Math.floor(Math.random() * npc.dialog.length)];
    setDialog({ npc: npc.name, text });
  };

  return (
    <group>
      <ambientLight intensity={0.75} />
      <directionalLight position={[15, 22, 10]} intensity={1.3} color="#FFF8F0" />
      <hemisphereLight args={["#E8F0FF", "#FFF8F0", 0.45]} />

      {/* 地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#FAF9F6" roughness={0.9} />
      </mesh>

      {/* 道路 */}
      {ROADS.map((r, i) => (
        <Line key={`r${i}`} points={[[r[0], 0.02, r[2]], [r[3], 0.02, r[5]]]} color="#E0DDD6" lineWidth={0.6} transparent opacity={0.5} />
      ))}

      {/* 建筑 */}
      {BUILDINGS.map((b) => (
        <group key={b.id}>
          <mesh position={[b.x, b.h / 2, b.z]} castShadow
            onClick={() => b.type !== "normal" && enterBuilding(b)}>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial
              color={b.type === "hidden" && !discovered.has(b.id) ? "#FFF8EE" : b.type === "poi" ? "#F6F1EC" : "#F2F0ED"}
              roughness={0.6} metalness={0.02}
              emissive={b.type === "hidden" && !discovered.has(b.id) ? "#FFD93D" : "#000000"}
              emissiveIntensity={b.type === "hidden" && !discovered.has(b.id) ? 0.12 : 0} />
          </mesh>
          {(b.type === "poi" || b.type === "hidden") && (
            <mesh position={[b.x, b.h + 0.3, b.z]}>
              <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
              <meshStandardMaterial color={b.type === "hidden" ? "#FFD93D" : accentColor} roughness={0.3} />
            </mesh>
          )}
          {b.name && (
            <Text position={[b.x, b.h + 1.3, b.z]} fontSize={0.65} color="#1D1D1F" anchorX="center" anchorY="middle">
              {b.name}
            </Text>
          )}
          {b.type === "poi" && discovered.has(b.id) && (
            <Text position={[b.x, b.h + 2.2, b.z]} fontSize={0.5} color={accentColor} anchorX="center" anchorY="middle">
              ✓ 已发现
            </Text>
          )}
        </group>
      ))}

      {/* NPC */}
      {NPCS.map((npc) => (
        <group key={npc.id}>
          <mesh position={[npc.x, 0.5, npc.z]} onClick={() => talkToNPC(npc)}>
            <capsuleGeometry args={[0.35, 0.8, 8, 16]} />
            <meshStandardMaterial color="#FFE0D0" roughness={0.5} />
          </mesh>
          <mesh position={[npc.x, 1.15, npc.z]} onClick={() => talkToNPC(npc)}>
            <sphereGeometry args={[0.32, 16, 16]} />
            <meshStandardMaterial color="#FFE0D0" roughness={0.5} />
          </mesh>
          <mesh position={[npc.x, 1.7, npc.z]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>
          <Text position={[npc.x, 2.1, npc.z]} fontSize={0.45} color="#1D1D1F" anchorX="center" anchorY="middle">
            {npc.name}
          </Text>
        </group>
      ))}

      {/* 角色 */}
      <group ref={charRef} position={[charPos.x, 0, charPos.z]}>
        <mesh position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.18, 16]} />
          <meshBasicMaterial color="#000" transparent opacity={0.12} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.2, 0.26, 0.65, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <sphereGeometry args={[0.24, 16, 16]} />
          <meshStandardMaterial color="#FFE0D0" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.98, 0]}>
          <cylinderGeometry args={[0.26, 0.28, 0.1, 16]} />
          <meshStandardMaterial color={accentColor} roughness={0.3} />
        </mesh>
        <Html position={[0, 1.4, 0]} center className="pointer-events-none">
          <div className="text-[10px] text-[#AEAEB2] whitespace-nowrap bg-white/60 px-1.5 py-0.5 rounded-full">你</div>
        </Html>
      </group>

      {/* UI: 对话框 */}
      {dialog && (
        <Html fullscreen className="pointer-events-none">
          <div className="absolute inset-0 flex items-end justify-center pb-28" onClick={() => setDialog(null)}>
            <div className="pointer-events-auto glass-panel rounded-2xl p-5 max-w-sm w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
              <p className="text-[13px] font-semibold text-[#FF5E7A] mb-2">{dialog.npc}</p>
              <p className="text-[15px] text-[#1D1D1F] leading-relaxed whitespace-pre-wrap">{dialog.text}</p>
              <p className="text-[11px] text-[#AEAEB2] mt-3">点击关闭</p>
            </div>
          </div>
        </Html>
      )}

      {/* UI: POI 信息卡 */}
      {poiInfo && (
        <Html fullscreen className="pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm" onClick={() => setPoiInfo(null)}>
            <div className="pointer-events-auto glass-panel rounded-2xl p-6 max-w-xs w-full mx-4 shadow-xl text-center" onClick={e => e.stopPropagation()}>
              <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: accentColor + "15" }}>
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-[17px] font-semibold text-[#1D1D1F]">{poiInfo.name}</h3>
              <p className="text-[14px] text-[#86868B] mt-2 leading-relaxed">{poiInfo.desc}</p>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[13px] font-medium" style={{ color: accentColor }}>
                <span>✓</span><span>已发现</span>
              </div>
              <p className="text-[11px] text-[#AEAEB2] mt-3">点击关闭</p>
            </div>
          </div>
        </Html>
      )}

      {/* UI: 印章 */}
      {earnedStamp && (
        <Html fullscreen className="pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm" onClick={() => setEarnedStamp(false)}>
            <div className="pointer-events-auto text-center animate-fade-up">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg bg-white" style={{ border: `3px solid ${accentColor}` }}>
                <span className="text-4xl">🏅</span>
              </div>
              <h2 className="text-[20px] font-semibold text-[#1D1D1F]">获得旅行印章！</h2>
              <p className="text-[15px] text-[#86868B] mt-1">「圣水洞探索者」</p>
              <p className="text-[13px] text-[#AEAEB2] mt-2">集齐了圣水洞全部 {TOTAL} 个探索地点</p>
              <button onClick={() => setEarnedStamp(false)} className="mt-6 px-8 py-2.5 rounded-full text-white text-[14px] font-medium cursor-pointer shadow-lg" style={{ backgroundColor: accentColor }}>
                太棒了！
              </button>
            </div>
          </div>
        </Html>
      )}

      {/* UI: 提示 */}
      {showHint && count === 0 && (
        <Html fullscreen className="pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2">
            <div className="glass-panel rounded-full px-4 py-2 text-[13px] text-[#86868B] animate-pulse-soft">
              👆 点击建筑物或人物来探索圣水洞
            </div>
          </div>
        </Html>
      )}

      {/* UI: 探索计数 */}
      <Html fullscreen className="pointer-events-none">
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="glass-panel rounded-full px-4 py-1.5 flex items-center gap-2 text-[13px]">
            <span className="text-[#FFD93D]">{count >= TOTAL ? "🏅" : "★"}</span>
            <span className="text-[#1D1D1F] font-medium">{count}/{TOTAL}</span>
            <span className="text-[#AEAEB2]">已探索</span>
          </div>
        </div>
      </Html>
    </group>
  );
}

// ─── 导出 ────────────────────────────────

export function VoyageWorld({ accentColor, visible }: { accentColor: string; visible: boolean }) {
  return (
    <div className="w-full h-full" style={{ opacity: visible ? 1 : 0, transition: "opacity 800ms" }}>
      <Canvas gl={{ antialias: true, alpha: true }} orthographic
        camera={{ position: [10, 19, 13], zoom: 21, near: 0.1, far: 100 }}
        onCreated={({ camera }) => { camera.lookAt(0, 0, 0); }}>
        <Scene accentColor={accentColor} />
      </Canvas>
    </div>
  );
}
