"use client";

import { useState, useCallback } from "react";
import { GlobeScene } from "@/components/globe/GlobeScene";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { RouteMap } from "@/components/map/RouteMap";
import type { Route } from "@/types/place";
import type { GeoPoint } from "@/types/route";

type PageMode = "landing" | "entering" | "chat";

export default function Home() {
  const [mode, setMode] = useState<PageMode>("landing");
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [globeTarget, setGlobeTarget] = useState<GeoPoint | null>(null);

  const handleStart = useCallback(() => {
    setMode("entering");
    setTimeout(() => setMode("chat"), 2000);
  }, []);

  const handleRouteGenerated = useCallback((route: Route) => {
    setCurrentRoute(route);
    if (route.stops.length > 0) {
      setGlobeTarget({
        lat: route.stops[0].place.lat,
        lng: route.stops[0].place.lng,
      });
    }
  }, []);

  // ========== 首页 ==========
  if (mode === "landing" || mode === "entering") {
    return (
      <div className="relative h-full w-full bg-[#F5F0EC] overflow-hidden">
        {/* 背景柔和渐变 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FCFAF7] via-[#F5F0EC] to-[#EAE3D8] pointer-events-none" />

        {/* 地球 */}
        <div
          className={`absolute inset-0 transition-all duration-[2000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
            mode === "entering"
              ? "scale-[3] blur-lg opacity-0"
              : "scale-100 blur-0 opacity-100"
          }`}
        >
          <GlobeScene interactive={false} />
        </div>

        {/* 底部渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#F5F0EC] via-[#F5F0EC]/60 to-transparent pointer-events-none" />

        {/* 内容层 */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 delay-100 ${
            mode === "entering"
              ? "opacity-0 translate-y-8 pointer-events-none"
              : "opacity-100"
          }`}
        >
          {/* 品牌 */}
          <div className="text-center">
            <p className="text-[#B8A99A] text-xs tracking-[0.35em] uppercase mb-5">
              AI Travel Planner
            </p>
            <h1 className="text-6xl md:text-7xl font-bold text-[#2D221E] tracking-[-0.02em] leading-none">
              Easy Trip
            </h1>
          </div>

          {/* 按钮 — 参考 KidSuper 的 playful + Vita 的克制 */}
          <button
            onClick={handleStart}
            className="group relative mt-14 px-10 py-3.5 rounded-full bg-[#2D221E] text-white text-base font-medium
                       shadow-lg shadow-[#2D221E]/8
                       transition-all duration-500 ease-out
                       hover:scale-[1.03] hover:shadow-xl hover:shadow-[#2D221E]/12
                       active:scale-[0.97] cursor-pointer overflow-hidden"
          >
            <span className="relative z-10 transition-opacity duration-300 group-hover:opacity-0">
              开始旅程
            </span>
            <span className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300
                             bg-gradient-to-r from-[#FF6B6B] via-[#FF8C42] to-[#FFB347] bg-clip-text text-transparent">
              开始旅程
            </span>
          </button>

          {/* 底部说明 */}
          <p className="mt-8 text-[#B8A99A] text-sm tracking-wide">
            告诉 AI 你想去哪，它帮你规划最美路线
          </p>
        </div>

        {/* 底部指标点 */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2D221E]/30" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#2D221E]/10" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#2D221E]/10" />
        </div>
      </div>
    );
  }

  // ========== 聊天页 ==========
  return (
    <div className="h-full flex flex-col bg-[#F5F0EC]">
      {/* 导航栏 — iOS 玻璃 */}
      <header className="flex-shrink-0 bg-white/60 backdrop-blur-2xl border-b border-black/5 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setMode("landing");
              setCurrentRoute(null);
              setGlobeTarget(null);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-[#2D221E] tracking-tight">
            Easy Trip
          </span>
        </div>
        <span className="text-[10px] text-[#B8A99A] bg-black/5 px-2.5 py-0.5 rounded-full">
          Beta
        </span>
      </header>

      {/* 主区域 */}
      <main className="flex-1 flex min-h-0">
        {/* 聊天区 */}
        <div className="flex-1 min-w-0 flex flex-col lg:border-r border-black/5">
          <ChatContainer onRouteGenerated={handleRouteGenerated} />
        </div>

        {/* 右侧：地图/地球 */}
        <aside className="hidden lg:flex w-[42%] flex-col relative">
          <div className="w-full h-full">
            {currentRoute ? (
              <RouteMap route={currentRoute} />
            ) : (
              <div className="w-full h-full bg-white/30 relative">
                <GlobeScene targetLocation={globeTarget} compact />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
                  <p className="text-[#B8A99A] text-xs">
                    跟小E聊聊你想去哪 🗺️
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
