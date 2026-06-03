"use client";

import { useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import * as THREE from "three";

// ═══════════════════════════════════════════
//  VISUAL REDESIGN: Warm diorama world
//  Ref: Animal Crossing + Cozy Grove + Monument Valley
// ═══════════════════════════════════════════

interface Bld {
  id: string; x: number; z: number; w: number; d: number; h: number;
  name: string; type: "poi" | "hidden" | "normal"; desc: string;
  wallColor: string; roofColor: string;
}

interface NPC { id: string; x: number; z: number; name: string; dialog: string[]; color: string }

const ACCENT = "#FF5E7A";

const BUILDINGS: Bld[] = [
  {
    id: "cafe-onion", x: -6, z: -5, w: 4.5, d: 4, h: 5,
    name: "Cafe Onion", type: "poi",
    desc: "旧工厂改造的工业风咖啡馆，圣水洞的地标。面包香气从红砖墙的缝隙里飘出来。",
    wallColor: "#D4A88C", roofColor: "#8B5E3C",
  },
  {
    id: "tamburins", x: 5, z: -4, w: 4, d: 3.5, h: 6.5,
    name: "Tamburins", type: "poi",
    desc: "韩国最火的香氛品牌。独栋白楼，每层都是不同的嗅觉体验。",
    wallColor: "#E8E0D8", roofColor: "#C4A882",
  },
  {
    id: "daelim", x: 4, z: 7, w: 5.5, d: 5, h: 6,
    name: "大林仓库", type: "poi",
    desc: "废弃仓库改造的前卫艺术空间。混凝土墙面上是不断更换的展览海报。",
    wallColor: "#C8C0B8", roofColor: "#7A7068",
  },
  {
    id: "hidden-mural", x: 9, z: 12, w: 2, d: 1.8, h: 2.8,
    name: "秘密壁画", type: "hidden",
    desc: "藏在巷子尽头的街头壁画。只有沿着窄巷走到底才能发现——一面墙上开满了手绘的花朵。",
    wallColor: "#F5E6D0", roofColor: "#E8C878",
  },
  // 普通建筑 — 暖色调
  ...[...Array(22)].map((_, i) => {
    const gx = (i % 6) - 2.5;
    const gz = Math.floor(i / 6) - 1.5;
    const warmColors = ["#E8DED0", "#EDE3D5", "#E5D8C8", "#F0E8DC", "#E2D5C3", "#EBE0D2"];
    const roofColors = ["#A89880", "#B5A590", "#9E8E78", "#B0A088", "#A5957D"];
    return {
      id: `b${i}`, x: gx * 3.4 + (Math.random() - 0.5) * 1.2,
      z: -11 + gz * 5.5 + (Math.random() - 0.5) * 1.8,
      w: 1.5 + Math.random() * 2.5, d: 2 + Math.random() * 2.5, h: 1.8 + Math.random() * 4.5,
      name: "", type: "normal" as const, desc: "",
      wallColor: warmColors[Math.floor(Math.random() * warmColors.length)],
      roofColor: roofColors[Math.floor(Math.random() * roofColors.length)],
    };
  }),
];

const NPCS: NPC[] = [
  { id: "barista", x: -6, z: -2, name: "小朴", dialog: ["欢迎！☕ 今天的豆子是埃塞俄比亚的。", "圣水洞以前全是工厂，现在变成艺术家和咖啡师的乐园了。", "往东一直走，有一条小巷子……尽头的墙上开满了花"], color: "#8B6B4A" },
  { id: "artist", x: 4, z: 10, name: "智恩", dialog: ["大林仓库以前真的堆满了货物！", "我喜欢这里——旧的砖墙和新的艺术混在一起，每一天都不一样。", "三个主要地点都逛过了吗？去东边巷子看看？"], color: "#6B5B4A" },
];

const TREES = [
  { x: -10, z: -10 }, { x: -10, z: -6 }, { x: -10, z: 10 }, { x: 10, z: -8 },
  { x: 10, z: 3 }, { x: -6, z: 13 }, { x: 0, z: 14 }, { x: -3, z: -14 },
  { x: -8, z: 6 }, { x: 10, z: -12 }, { x: -11, z: 2 }, { x: 11, z: 8 },
  { x: 7, z: -13 }, { x: -4, z: 11 },
];

const TOTAL = 4;

// ═══════════════════════════════════════════

function Scene() {
  const charRef = useRef<THREE.Group>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<{ npc: string; text: string } | null>(null);
  const [poiInfo, setPoiInfo] = useState<Bld | null>(null);
  const [earnedStamp, setEarnedStamp] = useState(false);
  const targetRef = useRef<THREE.Vector3 | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [charPos] = useState({ x: -9, z: -13 });

  const discover = useCallback((id: string) => {
    setDiscovered(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev); next.add(id);
      if (next.size >= TOTAL && !earnedStamp) setTimeout(() => setEarnedStamp(true), 700);
      return next;
    });
  }, [earnedStamp]);

  const count = discovered.size;

  useFrame((_, delta) => {
    if (!charRef.current || !targetRef.current) return;
    const p = charRef.current.position;
    const t = targetRef.current;
    const dx = t.x - p.x; const dz = t.z - p.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 0.25) { targetRef.current = null; p.y = 0; return; }
    const spd = 4 * delta;
    p.x += (dx / dist) * spd;
    p.z += (dz / dist) * spd;
    p.y = Math.abs(Math.sin(Date.now() * 0.013)) * 0.08;
    charRef.current.rotation.y = Math.atan2(dx, dz);
  });

  const moveTo = (x: number, z: number) => { targetRef.current = new THREE.Vector3(x, 0, z); };

  const enterBuilding = (b: Bld) => {
    moveTo(b.x, b.z + b.d / 2 + 0.5);
    setTimeout(() => { discover(b.id); setShowHint(false); setPoiInfo(b); }, 1400);
  };

  return (
    <group>
      {/* ═══ LIGHTING: Golden hour warm ═══ */}
      <ambientLight intensity={0.55} color="#FFF5EC" />
      <directionalLight position={[20, 30, 15]} intensity={1.5} color="#FFE4CC"
        castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-25} shadow-camera-right={25}
        shadow-camera-top={25} shadow-camera-bottom={-25} />
      <hemisphereLight args={["#FFECD2", "#C8B898", 0.5]} />
      {/* 补光 — 柔化阴影 */}
      <directionalLight position={[-10, 5, -10]} intensity={0.3} color="#FFECD2" />

      {/* ═══ GROUND ═══ */}
      {/* 主地面 — 暖米色 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
        <planeGeometry args={[55, 55]} />
        <meshStandardMaterial color="#F5EDE0" roughness={0.85} />
      </mesh>
      {/* 人行道区域 — 稍亮 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6, -0.06, -2]} receiveShadow>
        <planeGeometry args={[3, 12]} />
        <meshStandardMaterial color="#F8F2E8" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4, -0.06, -2]} receiveShadow>
        <planeGeometry args={[3, 14]} />
        <meshStandardMaterial color="#F8F2E8" roughness={0.8} />
      </mesh>

      {/* ═══ ROADS: subtle darker paths ═══ */}
      {[
        { x: -3, z: -2, w: 1.2, d: 30 },
        { x: 1, z: -2, w: 1.2, d: 30 },
        { x: -9, z: -7, w: 30, d: 1 },
        { x: -9, z: 3, w: 30, d: 1 },
        { x: -9, z: 8, w: 30, d: 1 },
      ].map((r, i) => (
        <mesh key={`road${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[r.x, -0.04, r.z]} receiveShadow>
          <planeGeometry args={[r.w, r.d]} />
          <meshStandardMaterial color="#EBE0D0" roughness={0.9} />
        </mesh>
      ))}

      {/* ═══ TREES ═══ */}
      {TREES.map((t, i) => (
        <group key={`tree${i}`} position={[t.x, 0, t.z]}>
          {/* 树干 */}
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.18, 1.2, 8]} />
            <meshStandardMaterial color="#A08568" roughness={0.7} />
          </mesh>
          {/* 树冠 — 分层 */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <sphereGeometry args={[0.7, 12, 10]} />
            <meshStandardMaterial color="#8DB580" roughness={0.6} />
          </mesh>
          <mesh position={[0.3, 1.2, 0.2]}>
            <sphereGeometry args={[0.45, 10, 8]} />
            <meshStandardMaterial color="#7CA870" roughness={0.6} />
          </mesh>
          <mesh position={[-0.25, 1.3, -0.15]}>
            <sphereGeometry args={[0.4, 10, 8]} />
            <meshStandardMaterial color="#9DC890" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* ═══ BUSHES ═══ */}
      {[...Array(12)].map((_, i) => (
        <mesh key={`bush${i}`} position={[-9 + i * 1.8, 0.25, -13.5 + (i % 3) * 5]} castShadow>
          <sphereGeometry args={[0.35 + Math.random() * 0.2, 8, 6]} />
          <meshStandardMaterial color={i % 3 === 0 ? "#A8C898" : "#8DB580"} roughness={0.55} />
        </mesh>
      ))}

      {/* ═══ BUILDINGS ═══ */}
      {BUILDINGS.map((b) => (
        <group key={b.id}>
          {/* 主体 */}
          <mesh position={[b.x, b.h / 2, b.z]} castShadow receiveShadow
            onClick={() => b.type !== "normal" && enterBuilding(b)}>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial
              color={b.wallColor} roughness={0.55} metalness={0.02} />
          </mesh>
          {/* 窗户纹理 — 小方块阵列 */}
          {b.type !== "hidden" && b.h > 3 && (
            <>
              {[0.3, 0.55, 0.8].map((frac, wi) => (
                <group key={`w${wi}`}>
                  <mesh position={[b.x, b.h * frac, b.z + b.d / 2 + 0.01]}>
                    <planeGeometry args={[b.w * 0.6, 0.25]} />
                    <meshStandardMaterial color="#CFC5B5" roughness={0.4} side={THREE.DoubleSide} />
                  </mesh>
                  {b.w > 3 && (
                    <mesh position={[b.x + b.w * 0.25, b.h * frac, b.z + b.d / 2 + 0.01]}>
                      <planeGeometry args={[0.25, 0.25]} />
                      <meshStandardMaterial color="#D8D0C0" roughness={0.4} side={THREE.DoubleSide} />
                    </mesh>
                  )}
                </group>
              ))}
            </>
          )}
          {/* 屋顶 */}
          <mesh position={[b.x, b.h + 0.25, b.z]} castShadow>
            <boxGeometry args={[b.w + 0.3, 0.5, b.d + 0.3]} />
            <meshStandardMaterial color={b.roofColor} roughness={0.5} />
          </mesh>
          {/* 三角屋顶（部分建筑）*/}
          {b.type === "poi" && (
            <mesh position={[b.x, b.h + 0.7, b.z]} rotation={[0, Math.PI / 4, 0]} castShadow>
              <coneGeometry args={[b.w * 0.55, 0.8, 4]} />
              <meshStandardMaterial color={b.roofColor} roughness={0.4} />
            </mesh>
          )}
          {/* POI 标记 — 小旗帜 */}
          {b.type === "poi" && (
            <group position={[b.x, b.h + 1.2, b.z]}>
              <mesh>
                <cylinderGeometry args={[0.06, 0.06, 1.2, 8]} />
                <meshStandardMaterial color="#5C4A3A" roughness={0.4} />
              </mesh>
              <mesh position={[0.25, 0.4, 0]} rotation={[0, 0, 0.15]}>
                <planeGeometry args={[0.5, 0.35]} />
                <meshStandardMaterial color={ACCENT} roughness={0.3} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )}
          {/* 店名 */}
          {b.name && (
            <Text position={[b.x, b.h + 2.1, b.z]} fontSize={0.55} color="#4A3A2A"
              anchorX="center" anchorY="middle" font={undefined} outlineWidth={0.03} outlineColor="#FFF8F0">
              {b.name}
            </Text>
          )}
          {/* 已发现 ✓ */}
          {discovered.has(b.id) && (
            <Text position={[b.x, b.h + 2.7, b.z]} fontSize={0.4} color={ACCENT}
              anchorX="center" anchorY="middle">
              ✓ 已发现
            </Text>
          )}
          {/* 隐藏建筑 — 微光粒子 */}
          {b.type === "hidden" && !discovered.has(b.id) && (
            <pointLight position={[b.x, b.h + 1, b.z]} color="#FFD93D" intensity={0.6} distance={3} />
          )}
        </group>
      ))}

      {/* ═══ NPCs ═══ */}
      {NPCS.map((npc) => (
        <group key={npc.id} onClick={() => {
          const t = npc.dialog[Math.floor(Math.random() * npc.dialog.length)];
          setDialog({ npc: npc.name, text: t });
        }}>
          {/* 身体 */}
          <mesh position={[npc.x, 0.45, npc.z]} castShadow>
            <capsuleGeometry args={[0.3, 0.7, 8, 12]} />
            <meshStandardMaterial color={npc.color} roughness={0.5} />
          </mesh>
          {/* 头 */}
          <mesh position={[npc.x, 1.05, npc.z]}>
            <sphereGeometry args={[0.28, 14, 14]} />
            <meshStandardMaterial color="#FFE8D6" roughness={0.45} />
          </mesh>
          {/* 对话气泡 */}
          <mesh position={[npc.x, 1.6, npc.z]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color={ACCENT} />
          </mesh>
          <Text position={[npc.x, 1.95, npc.z]} fontSize={0.4} color="#4A3A2A"
            anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#FFF8F0">
            {npc.name}
          </Text>
        </group>
      ))}

      {/* ═══ PLAYER CHARACTER ═══ */}
      <group ref={charRef} position={[charPos.x, 0, charPos.z]}>
        {/* 阴影 */}
        <mesh position={[0, -0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.16, 16]} />
          <meshBasicMaterial color="#000" transparent opacity={0.1} />
        </mesh>
        {/* 身体 */}
        <mesh position={[0, 0.18, 0]} castShadow>
          <capsuleGeometry args={[0.18, 0.5, 8, 12]} />
          <meshStandardMaterial color="#FFFDF8" roughness={0.35} />
        </mesh>
        {/* 小背包 */}
        <mesh position={[0, 0.3, -0.14]}>
          <boxGeometry args={[0.22, 0.25, 0.12]} />
          <meshStandardMaterial color="#D4A88C" roughness={0.4} />
        </mesh>
        {/* 头 */}
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.22, 14, 14]} />
          <meshStandardMaterial color="#FFE8D6" roughness={0.4} />
        </mesh>
        {/* 帽子 */}
        <mesh position={[0, 0.85, 0.02]}>
          <cylinderGeometry args={[0.22, 0.25, 0.07, 14]} />
          <meshStandardMaterial color={ACCENT} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.92, 0.02]}>
          <cylinderGeometry args={[0.2, 0.22, 0.04, 14]} />
          <meshStandardMaterial color={ACCENT} roughness={0.3} />
        </mesh>
        {/* 标签 */}
        <Html position={[0, 1.3, 0]} center className="pointer-events-none select-none">
          <div className="text-[9px] text-[#A08070] whitespace-nowrap bg-[#FFF8F0]/70 px-1.5 py-0.5 rounded-full font-medium">你</div>
        </Html>
      </group>

      {/* ═══ UI OVERLAYS ═══ */}

      {/* 探索计数 */}
      <Html fullscreen className="pointer-events-none">
        <div className="absolute top-5 left-1/2 -translate-x-1/2">
          <div className="bg-[#FFFDF5]/75 backdrop-blur-md border border-[#E0D5C5] rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm">
            <span className="text-sm">{count >= TOTAL ? "🏅" : "🧭"}</span>
            <span className="text-[#4A3A2A] text-[13px] font-medium">{count}/{TOTAL} 已探索</span>
          </div>
        </div>
      </Html>

      {/* 提示 */}
      {showHint && count === 0 && (
        <Html fullscreen className="pointer-events-none">
          <div className="absolute top-24 left-1/2 -translate-x-1/2">
            <div className="bg-[#FFFDF5]/80 backdrop-blur-md border border-[#E0D5C5] rounded-full px-4 py-2 shadow-sm animate-pulse-soft">
              <span className="text-[13px] text-[#8B7A68]">👆 点击彩色建筑或棕色小人来探索圣水洞</span>
            </div>
          </div>
        </Html>
      )}

      {/* 对话框 */}
      {dialog && (
        <Html fullscreen className="pointer-events-none">
          <div className="absolute inset-0 flex items-end justify-center pb-28" onClick={() => setDialog(null)}>
            <div className="pointer-events-auto bg-[#FFFDF5]/90 backdrop-blur-xl border border-[#E0D5C5] rounded-2xl p-5 max-w-sm w-full mx-4 shadow-lg"
              onClick={e => e.stopPropagation()}>
              <p className="text-[12px] font-semibold text-[#FF5E7A] mb-2">{dialog.npc}</p>
              <p className="text-[14px] text-[#4A3A2A] leading-relaxed whitespace-pre-wrap">{dialog.text}</p>
              <p className="text-[11px] text-[#B8A898] mt-3">点击关闭</p>
            </div>
          </div>
        </Html>
      )}

      {/* POI 信息卡 */}
      {poiInfo && (
        <Html fullscreen className="pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center bg-[#F5EDE0]/30 backdrop-blur-[2px]" onClick={() => setPoiInfo(null)}>
            <div className="pointer-events-auto bg-[#FFFDF5]/92 backdrop-blur-xl border border-[#E0D5C5] rounded-2xl p-6 max-w-xs w-full mx-4 shadow-xl text-center"
              onClick={e => e.stopPropagation()}>
              <div className="text-4xl mb-3">
                {poiInfo.id === "cafe-onion" ? "☕" : poiInfo.id === "tamburins" ? "💄" : poiInfo.id === "daelim" ? "🎨" : "🌸"}
              </div>
              <h3 className="text-[17px] font-semibold text-[#4A3A2A]">{poiInfo.name}</h3>
              <p className="text-[13px] text-[#8B7A68] mt-2 leading-relaxed">{poiInfo.desc}</p>
              <div className="mt-4 text-[12px] font-medium text-[#FF5E7A]">✓ 已发现</div>
              <p className="text-[11px] text-[#B8A898] mt-3">点击关闭</p>
            </div>
          </div>
        </Html>
      )}

      {/* 印章 */}
      {earnedStamp && (
        <Html fullscreen className="pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center bg-[#F5EDE0]/50 backdrop-blur-sm" onClick={() => setEarnedStamp(false)}>
            <div className="pointer-events-auto text-center animate-fade-up bg-[#FFFDF5]/95 backdrop-blur-xl border-2 border-[#FFD93D] rounded-3xl p-8 shadow-2xl">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FFF8E0] to-[#FFE0B0] flex items-center justify-center shadow-inner"
                style={{ border: "3px solid #FFD93D" }}>
                <span className="text-4xl">🏅</span>
              </div>
              <h2 className="text-[20px] font-semibold text-[#4A3A2A]">获得旅行印章！</h2>
              <p className="text-[14px] text-[#8B7A68] mt-1">「圣水洞探索者」</p>
              <p className="text-[12px] text-[#B8A898] mt-2">集齐了圣水洞全部 {TOTAL} 个探索地点</p>
              <button onClick={() => setEarnedStamp(false)}
                className="mt-6 px-8 py-2.5 rounded-full text-white text-[14px] font-medium cursor-pointer shadow-lg transition-transform active:scale-95"
                style={{ backgroundColor: "#FF5E7A" }}>
                太棒了！
              </button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// ═══════════════════════════════════════════

export function VoyageWorld({ visible }: { accentColor: string; visible: boolean }) {
  return (
    <div className="w-full h-full" style={{ opacity: visible ? 1 : 0, transition: "opacity 1s" }}>
      <Canvas gl={{ antialias: true, alpha: true }} orthographic
        camera={{ position: [10, 20, 14], zoom: 20, near: 0.1, far: 100 }}
        onCreated={({ camera, gl }) => {
          camera.lookAt(1, 0, 2);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
        }}>
        <Scene />
      </Canvas>
    </div>
  );
}
