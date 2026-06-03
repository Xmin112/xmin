"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlobeScene, type ZoomLevel } from "@/components/globe/GlobeScene";
import { AppleSetup, type SetupStep } from "@/components/setup/AppleSetup";
import type { Route } from "@/types/place";
import type { GeoPoint } from "@/types/route";

// ─── 数据 ───────────────────────────────

const SETUP_STEPS: SetupStep[] = [
  { id: "destination", question: "你想去哪座城市？", placeholder: "例如：首尔、东京、巴黎...", hint: "输入城市名称，我们会自动识别" },
  { id: "companion", question: "和谁一起去？", placeholder: "一个人 / 情侣 / 闺蜜 / 家人...", hint: "路线风格会根据同行的人调整" },
  { id: "style", question: "这趟想怎么玩？", placeholder: "买买买 / 吃吃吃 / 看展 / 随缘晃..." },
];

function getAccentColor(location?: string): string {
  if (!location) return "#007AFF";
  const l = location.toLowerCase();
  if (l.includes("seoul") || l.includes("korea") || l.includes("首尔") || l.includes("韩国")) return "#FF5E7A";
  if (l.includes("tokyo") || l.includes("japan") || l.includes("东京") || l.includes("日本")) return "#E8394A";
  if (l.includes("paris") || l.includes("france") || l.includes("巴黎") || l.includes("法国")) return "#2D5BFF";
  if (l.includes("bangkok") || l.includes("thailand") || l.includes("曼谷") || l.includes("泰国")) return "#F0A500";
  if (l.includes("new york") || l.includes("纽约")) return "#4B6EF7";
  if (l.includes("london") || l.includes("伦敦")) return "#D01C1F";
  return "#007AFF";
}

export default function Home() {
  const [phase, setPhase] = useState<"hero" | "loading" | "result">("hero");
  const [destination, setDestination] = useState<string | null>(null);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [globeTarget, setGlobeTarget] = useState<GeoPoint | null>(null);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("world");

  const accentColor = useMemo(() => getAccentColor(destination ?? undefined), [destination]);

  // Apple Setup 完成 → 飞向目的地
  const handleSetupComplete = useCallback(async (answers: Record<string, string>) => {
    const dest = answers.destination;
    setDestination(dest);
    setPhase("loading");

    // 地球飞行动画阶段
    setZoomLevel("country");
    await sleep(1800);
    setZoomLevel("city");
    await sleep(1500);

    // 调用 AI
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "user", content: `${dest}` },
            { role: "user", content: `和${answers.companion}一起去，想${answers.style}` },
          ],
        }),
      });
      const data = await res.json();

      if (data.route) {
        setCurrentRoute(data.route);
        if (data.route.stops.length > 0) {
          setGlobeTarget({
            lat: data.route.stops[0].place.lat,
            lng: data.route.stops[0].place.lng,
          });
        }
      }
    } catch {
      // demo route
      setCurrentRoute(getDemoRoute(dest, accentColor));
      setGlobeTarget(getDemoLocation(dest));
    }

    setZoomLevel("district");
    await sleep(500);
    setPhase("result");
  }, [accentColor]);

  const handleReset = useCallback(() => {
    setPhase("hero");
    setDestination(null);
    setCurrentRoute(null);
    setGlobeTarget(null);
    setZoomLevel("world");
  }, []);

  return (
    <div className="relative h-full w-full bg-white overflow-hidden">
      {/* ====== 地球背景 ====== */}
      <div className="absolute inset-0">
        <GlobeScene targetLocation={globeTarget} accentColor={accentColor} zoomLevel={zoomLevel} />
      </div>

      {/* ====== 彩色光斑 ====== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full -top-[250px] -right-[150px]"
          style={{ filter: "blur(100px)", opacity: 0.25 }}
          animate={{ backgroundColor: accentColor }}
          transition={{ duration: 2 }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full -bottom-[200px] -left-[100px]"
          style={{ filter: "blur(80px)", opacity: 0.18 }}
          animate={{ backgroundColor: accentColor }}
          transition={{ duration: 2, delay: 0.3 }}
        />
      </div>

      {/* ====== Section 1: Hero + Apple Setup ====== */}
      {phase === "hero" && (
        <div className="absolute inset-0 flex flex-col">
          {/* 顶部品牌 */}
          <header className="flex-shrink-0 px-6 py-4 flex items-center justify-between">
            <h1 className="text-sm font-semibold text-[#1D1D1F] tracking-tight">Easy Trip</h1>
            <span className="text-[11px] text-[#AEAEB2] bg-black/[0.04] px-2.5 py-0.5 rounded-full">Beta</span>
          </header>

          {/* Hero 标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-shrink-0 text-center pt-8 pb-4"
          >
            <h2 className="text-[32px] md:text-[40px] font-semibold text-[#1D1D1F] tracking-[-0.03em] leading-[1.15]">
              规划一次旅行
              <br />
              <span className="text-[#86868B]">不该花 30 分钟找路线</span>
            </h2>
            <p className="mt-3 text-[15px] text-[#86868B]">
              告诉 Easy Trip 你想去哪，自动生成最佳路线
            </p>
          </motion.div>

          {/* Apple Setup 问答 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex-1 flex items-start justify-center pt-4"
          >
            <div className="w-full max-w-lg bg-white/60 backdrop-blur-2xl rounded-[28px] border border-black/[0.06] shadow-2xl shadow-black/[0.04]">
              <AppleSetup steps={SETUP_STEPS} onComplete={handleSetupComplete} accentColor={accentColor} />
            </div>
          </motion.div>
        </div>
      )}

      {/* ====== Loading ====== */}
      {phase === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-transparent"
              style={{ borderTopColor: accentColor }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-[15px] text-[#86868B]">
              正在为{destination}规划最佳路线...
            </p>
          </motion.div>
        </div>
      )}

      {/* ====== Section 2+3+4: 路线结果 ====== */}
      {phase === "result" && currentRoute && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex flex-col"
          >
            {/* 导航 */}
            <header className="flex-shrink-0 px-5 py-3 flex items-center justify-between bg-white/50 backdrop-blur-2xl border-b border-black/[0.04] z-10">
              <button onClick={handleReset} className="flex items-center gap-2 text-[15px] text-[#007AFF] font-medium cursor-pointer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                重新规划
              </button>
              <h1 className="text-sm font-semibold text-[#1D1D1F]">{destination} · {currentRoute.dayLabel}</h1>
              <span className="text-[11px] text-[#007AFF] bg-[#007AFF]/8 px-2.5 py-0.5 rounded-full font-medium">路线已就绪</span>
            </header>

            <main className="flex-1 flex min-h-0 overflow-hidden">
              {/* 左：时间轴 */}
              <div className="w-[440px] flex-shrink-0 overflow-y-auto custom-scrollbar bg-white/40 backdrop-blur-xl border-r border-black/[0.04] p-6">
                <div className="relative pl-8 border-l-2 border-[#E5E5EA] space-y-8">
                  {currentRoute.stops.map((stop, i) => (
                    <motion.div
                      key={stop.order}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className="relative"
                    >
                      {/* 时间轴圆点 */}
                      <div
                        className="absolute -left-[33px] w-4 h-4 rounded-full border-[3px] border-white shadow-sm"
                        style={{ backgroundColor: accentColor }}
                      />

                      {/* 内容 */}
                      <div>
                        <p className="text-[11px] text-[#86868B] uppercase tracking-wide mb-1">
                          {i === 0 ? "从地铁口出发" : `步行 ${stop.walkFromPrevMin ?? "?"} 分钟`}
                        </p>
                        <h3 className="text-[17px] font-semibold text-[#1D1D1F]">{stop.place.name}</h3>
                        <p className="text-[14px] text-[#86868B] mt-0.5 leading-relaxed">{stop.place.intro}</p>
                        {i === 0 && currentRoute.metroStart && (
                          <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[#AEAEB2]">
                            <span>🚇</span>
                            <span>{currentRoute.metroStart.name}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* 总览 */}
                <div className="mt-8 pt-6 border-t border-[#E5E5EA]">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-3">
                      <p className="text-2xl font-semibold" style={{ color: accentColor }}>{currentRoute.stops.length}</p>
                      <p className="text-[11px] text-[#86868B] mt-0.5">个地点</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-3">
                      <p className="text-2xl font-semibold" style={{ color: accentColor }}>{currentRoute.totalWalkMinutes}</p>
                      <p className="text-[11px] text-[#86868B] mt-0.5">分钟步行</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-3">
                      <p className="text-2xl font-semibold" style={{ color: accentColor }}>{currentRoute.totalWalkMeters}m</p>
                      <p className="text-[11px] text-[#86868B] mt-0.5">总距离</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右：地图 */}
              <div className="flex-1 relative bg-[#F5F5F7]">
                <div className="absolute inset-0 flex items-center justify-center text-[#AEAEB2]">
                  <div className="text-center">
                    <p className="text-5xl mb-3">🗺️</p>
                    <p className="text-sm">路线地图</p>
                    <p className="text-xs mt-1">3D 地图组件加载中...</p>
                  </div>
                </div>
              </div>
            </main>

            {/* 导出按钮 */}
            <footer className="flex-shrink-0 px-5 py-3 flex items-center justify-center gap-4 bg-white/50 backdrop-blur-2xl border-t border-black/[0.04]">
              <button
                className="px-6 py-2.5 rounded-full text-white text-[14px] font-medium transition-all active:scale-95 cursor-pointer shadow-lg"
                style={{ backgroundColor: accentColor, boxShadow: `0 4px 20px ${accentColor}30` }}
              >
                导出旅行手账
              </button>
              <button className="px-6 py-2.5 rounded-full text-[14px] text-[#1D1D1F] font-medium bg-[#F5F5F7] hover:bg-[#EBEBED] transition-colors cursor-pointer">
                分享路线
              </button>
            </footer>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── 辅助 ───────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function getDemoLocation(dest: string): GeoPoint {
  const map: Record<string, GeoPoint> = {
    "首尔": { lat: 37.5665, lng: 126.978 },
    "东京": { lat: 35.6762, lng: 139.6503 },
    "巴黎": { lat: 48.8566, lng: 2.3522 },
    "曼谷": { lat: 13.7563, lng: 100.5018 },
    "伦敦": { lat: 51.5074, lng: -0.1278 },
    "纽约": { lat: 40.7128, lng: -74.006 },
  };
  return map[dest] ?? { lat: 37.5665, lng: 126.978 };
}

function getDemoRoute(dest: string, accentColor: string): Route {
  return {
    dayLabel: `${dest}精选路线`,
    metroStart: { name: "地铁站 3号出口", stationName: "地铁站", exitNumber: "3", lat: 37.557, lng: 126.924 },
    stops: [
      { order: 1, place: { name: "热门咖啡馆 A", lat: 37.558, lng: 126.925, category: "cafe", intro: "本地最火的早午餐店，拍照超出片", source: "search" } },
      { order: 2, place: { name: "设计师集合店 B", lat: 37.556, lng: 126.927, category: "fashion", intro: "韩国新锐设计师品牌聚集地", source: "search" } },
      { order: 3, place: { name: "小众美术馆 C", lat: 37.555, lng: 126.929, category: "art", intro: "免费展览 + 绝美天台", source: "search" } },
      { order: 4, place: { name: "传统市场 D", lat: 37.553, lng: 126.931, category: "food", intro: "本地人最爱的街头美食天堂", source: "search" } },
    ],
    totalWalkMeters: 1200,
    totalWalkMinutes: 18,
  };
}
