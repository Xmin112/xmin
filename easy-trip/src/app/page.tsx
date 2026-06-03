"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { GlobeScene } from "@/components/globe/GlobeScene";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { RouteMap } from "@/components/map/RouteMap";
import type { Route } from "@/types/place";
import type { GeoPoint } from "@/types/route";

type PageMode = "landing" | "chat";

export default function Home() {
  const [mode, setMode] = useState<PageMode>("landing");
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [globeTarget, setGlobeTarget] = useState<GeoPoint | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 进入聊天
  const handleStart = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setMode("chat");
      setIsTransitioning(false);
    }, 1800);
  }, []);

  // 路线生成 → 地球飞到目的地
  const handleRouteGenerated = useCallback((route: Route) => {
    setCurrentRoute(route);
    // 用第一个地点的坐标
    if (route.stops.length > 0) {
      const first = route.stops[0].place;
      setGlobeTarget({ lat: first.lat, lng: first.lng });
    }
  }, []);

  // 首页 → 全屏地球
  if (mode === "landing") {
    return (
      <div className="relative h-full w-full bg-[#050510] overflow-hidden">
        {/* 地球 */}
        <div
          className={`absolute inset-0 transition-transform duration-[1800ms] ease-in-out ${
            isTransitioning ? "scale-[2.5]" : "scale-100"
          }`}
        >
          <GlobeScene interactive={false} zoom={2.5} />
        </div>

        {/* 渐变遮罩 — 底部变暗 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent pointer-events-none" />

        {/* 中间内容 */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${
            isTransitioning
              ? "opacity-0 translate-y-10 pointer-events-none"
              : "opacity-100"
          }`}
        >
          {/* 标题 */}
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-3">
            Easy Trip
          </h1>
          <p className="text-lg md:text-xl text-white/50 mb-12 tracking-wide">
            AI 旅行路线规划师
          </p>

          {/* 开始按钮 */}
          <button
            onClick={handleStart}
            className="group relative px-10 py-4 rounded-full bg-white text-[#050510] text-lg font-semibold overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] active:scale-95 cursor-pointer"
          >
            <span className="relative z-10">开始旅程</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B6B] via-[#FFB347] to-[#4ECDC4] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="absolute inset-0 flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
              Let&apos;s Go ✨
            </span>
          </button>
        </div>

        {/* 底部提示 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <p className="text-white/20 text-xs animate-pulse">
            点击按钮开始你的旅行规划
          </p>
        </div>
      </div>
    );
  }

  // 聊天页
  return (
    <div className="h-full flex flex-col bg-[#050510]">
      {/* 顶部导航 */}
      <header className="flex-shrink-0 bg-black/40 backdrop-blur-xl border-b border-white/5 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🌍</span>
          <span className="text-sm font-semibold text-white tracking-tight">
            Easy Trip
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
            Beta
          </span>
          <button
            onClick={() => {
              setMode("landing");
              setCurrentRoute(null);
              setGlobeTarget(null);
            }}
            className="text-white/40 hover:text-white/80 text-xs transition-colors cursor-pointer"
          >
            回首页
          </button>
        </div>
      </header>

      {/* 主区域 */}
      <main className="flex-1 flex min-h-0">
        {/* 左栏：聊天 */}
        <div className="flex-1 min-w-0 flex flex-col lg:border-r border-white/5">
          <ChatContainer onRouteGenerated={handleRouteGenerated} />
        </div>

        {/* 右栏：地图/地球 */}
        <aside className="hidden lg:flex w-[40%] flex-col relative overflow-hidden">
          {currentRoute ? (
            <div className="w-full h-full">
              <RouteMap route={currentRoute} />
            </div>
          ) : (
            <div className="w-full h-full relative">
              <GlobeScene
                targetLocation={globeTarget}
                compact
                zoom={1.8}
              />
              {/* 空状态提示 */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                <p className="text-white/20 text-xs">
                  跟小E聊聊你想去哪 🗺️
                </p>
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
