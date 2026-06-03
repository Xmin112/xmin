"use client";

import { useState, useCallback, useMemo } from "react";
import { GlobeScene } from "@/components/globe/GlobeScene";
import { ChatPanel } from "@/components/chat/ChatPanel";
import type { Route } from "@/types/place";
import type { GeoPoint } from "@/types/route";

type PageMode = "landing" | "entering" | "chat";

/** 根据国家/城市返回主题色 */
function getAccentColor(location?: string): string {
  if (!location) return "#FF6B6B";
  const l = location.toLowerCase();
  if (l.includes("首尔") || l.includes("seoul") || l.includes("韩国") || l.includes("korea")) return "#FF6B8A";
  if (l.includes("东京") || l.includes("tokyo") || l.includes("日本") || l.includes("japan")) return "#E85D75";
  if (l.includes("巴黎") || l.includes("paris") || l.includes("法国") || l.includes("france")) return "#4B7BEC";
  if (l.includes("曼谷") || l.includes("bangkok") || l.includes("泰国") || l.includes("thailand")) return "#F5A623";
  if (l.includes("纽约") || l.includes("new york") || l.includes("美国") || l.includes("usa")) return "#5C7CFA";
  if (l.includes("伦敦") || l.includes("london") || l.includes("英国") || l.includes("uk")) return "#E03131";
  if (l.includes("新加坡") || l.includes("singapore")) return "#E94E77";
  if (l.includes("上海") || l.includes("北京") || l.includes("中国") || l.includes("china")) return "#E74C3C";
  return "#FF6B6B";
}

export default function Home() {
  const [mode, setMode] = useState<PageMode>("landing");
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [globeTarget, setGlobeTarget] = useState<GeoPoint | null>(null);
  const [destination, setDestination] = useState<string | null>(null);

  const accentColor = useMemo(() => getAccentColor(destination ?? undefined), [destination]);

  const handleStart = useCallback(() => {
    setMode("entering");
    setTimeout(() => setMode("chat"), 2200);
  }, []);

  const handleRouteGenerated = useCallback((route: Route, dest?: string) => {
    setCurrentRoute(route);
    if (dest) setDestination(dest);
    if (route.stops.length > 0) {
      setGlobeTarget({ lat: route.stops[0].place.lat, lng: route.stops[0].place.lng });
    }
  }, []);

  const handleBack = useCallback(() => {
    setMode("landing");
    setCurrentRoute(null);
    setGlobeTarget(null);
    setDestination(null);
  }, []);

  return (
    <div className="relative h-full w-full bg-white overflow-hidden">
      {/* ====== 地球背景（始终可见） ====== */}
      <div
        className={`absolute inset-0 transition-all duration-[2200ms] ease-in-out ${
          mode === "entering"
            ? "scale-[1.4] brightness-110"
            : "scale-100 brightness-100"
        }`}
      >
        <GlobeScene targetLocation={globeTarget} accentColor={accentColor} />
      </div>

      {/* ====== 彩色光斑 ====== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 上方光斑 */}
        <div
          className="light-blob w-[500px] h-[500px] -top-[200px] -right-[100px]"
          style={{ backgroundColor: accentColor }}
        />
        {/* 下方光斑 */}
        <div
          className="light-blob w-[400px] h-[400px] -bottom-[150px] -left-[100px]"
          style={{
            backgroundColor: accentColor,
            opacity: 0.3,
            transitionDelay: "0.5s",
          }}
        />
        {/* 中间辅助光 */}
        <div
          className="light-blob w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            backgroundColor: accentColor,
            opacity: 0.15,
            filter: "blur(120px)",
          }}
        />
      </div>

      {/* ====== 首页层 ====== */}
      {(mode === "landing" || mode === "entering") && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${
            mode === "entering" ? "opacity-0 translate-y-6 pointer-events-none" : "opacity-100"
          }`}
        >
          <p className="text-[#86868B] text-xs tracking-[0.3em] uppercase mb-4">
            AI Travel Planner
          </p>
          <h1 className="text-6xl md:text-7xl font-bold text-[#1D1D1F] tracking-[-0.03em] mb-16">
            Easy Trip
          </h1>

          <button
            onClick={handleStart}
            className="px-10 py-3.5 rounded-full bg-[#1D1D1F] text-white text-base font-medium
                       transition-all duration-500 hover:scale-[1.03] active:scale-[0.97]
                       shadow-lg shadow-black/10 cursor-pointer"
          >
            开始旅程
          </button>
        </div>
      )}

      {/* ====== 聊天层（毛玻璃叠加在地球上） ====== */}
      {mode === "chat" && (
        <div className="absolute inset-0 flex flex-col">
          {/* 顶部导航 — 毛玻璃 */}
          <header className="flex-shrink-0 apple-glass px-5 py-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <span className="text-sm font-semibold text-[#1D1D1F]">Easy Trip</span>
            </div>
            <span className="text-[10px] text-[#AEAEB2] bg-black/5 px-2 py-0.5 rounded-full">Beta</span>
          </header>

          {/* 主区域 */}
          <main className="flex-1 flex min-h-0">
            {/* 聊天面板 — 毛玻璃悬浮 */}
            <div className="flex-1 min-w-0 flex flex-col lg:mr-[42%]">
              <div className="flex-1 mx-3 my-3 lg:mx-6 lg:my-4 apple-glass-strong rounded-[24px] overflow-hidden shadow-2xl shadow-black/5 flex flex-col">
                <ChatPanel onRouteGenerated={handleRouteGenerated} accentColor={accentColor} />
              </div>
            </div>

            {/* 右侧地球区域（桌面端透出） */}
            <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-[42%] pointer-events-none" />
          </main>
        </div>
      )}
    </div>
  );
}
