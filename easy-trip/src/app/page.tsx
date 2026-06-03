"use client";

import { useState, useCallback } from "react";
import type { Route } from "@/types/place";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { RouteMap } from "@/components/map/RouteMap";

export default function Home() {
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);

  const handleRouteGenerated = useCallback((route: Route) => {
    setCurrentRoute(route);
  }, []);

  return (
    <div className="h-full flex flex-col relative z-[1]">
      {/* 顶部导航 */}
      <header className="flex-shrink-0 glass border-b border-white/5 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🏝️</span>
          <span className="text-sm font-semibold text-text-primary tracking-tight">
            Easy Trip
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-text-muted bg-white/[0.04] px-2 py-0.5 rounded-full">
            Beta
          </span>
        </div>
      </header>

      {/* 主区域 — Bento Grid 双栏 */}
      <main className="flex-1 flex min-h-0">
        {/* 左栏：聊天区 */}
        <div className="flex-1 min-w-0 flex flex-col lg:border-r border-white/5">
          <ChatContainer onRouteGenerated={handleRouteGenerated} />
        </div>

        {/* 右栏：地图 */}
        <aside className="hidden lg:flex w-[40%] flex-col p-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] via-transparent to-accent-purple/[0.03]" />

          <div className="relative z-[1] w-full h-full rounded-2xl overflow-hidden glass">
            {currentRoute ? (
              <RouteMap route={currentRoute} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center max-w-xs px-6">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-2xl glass-elevated flex items-center justify-center">
                    <span className="text-3xl">🗺️</span>
                  </div>
                  <h2 className="text-base font-semibold text-text-primary mb-2">
                    路线将会画在这里
                  </h2>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    跟小E聊完行程，手绘风格的路线图会自动出现在右边
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
