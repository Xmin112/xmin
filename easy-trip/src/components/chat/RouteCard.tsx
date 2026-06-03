"use client";

import type { Route } from "@/types/place";
import { Button } from "@/components/ui/Button";

interface RouteCardProps {
  route: Route;
}

/** 路线结果卡片 */
export function RouteCard({ route }: RouteCardProps) {
  return (
    <div className="mb-4">
      {/* 卡片本体 — 亮色底，从暗色 UI 跳出来 */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FDF8F0 0%, #F8F2E8 100%)",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        {/* 地图占位区 */}
        <div className="relative h-48 bg-[#F0EBE3] flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl mb-2">🗺️</p>
            <p className="text-sm text-[#C4956A] font-medium">
              路线地图将会显示在这里
            </p>
          </div>

          {/* 起点标签 */}
          <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-lg px-2.5 py-1 text-xs font-medium text-[#C4956A] shadow-sm">
            🚇 {route.metroStart.name}
          </div>
        </div>

        {/* 底部行程列表 */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-[#4A3728] mb-3">
            📍 {route.dayLabel}
          </h3>

          <div className="space-y-2">
            {route.stops.map((stop) => (
              <div
                key={stop.order}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-white/60"
              >
                {/* 序号 */}
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: "#FF6B6B" }}
                >
                  {stop.order}
                </span>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#4A3728]">
                      {stop.place.name}
                    </p>
                    {stop.place.source === "user" && (
                      <span className="text-[10px] bg-[#FF6B6B]/10 text-[#FF6B6B] px-1.5 py-0.5 rounded-full font-medium">
                        你指定
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8B7355] mt-0.5">
                    {stop.place.intro}
                  </p>
                  {stop.walkFromPrevMin !== undefined && stop.order > 1 && (
                    <p className="text-[10px] text-[#C4956A] mt-1">
                      🚶 从上站步行 {stop.walkFromPrevMin} 分钟
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 总计 */}
          <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between text-xs text-[#8B7355]">
            <span>🚶 总步行约 {route.totalWalkMinutes} 分钟</span>
            <Button variant="ghost" size="sm">
              📥 保存路线图
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
