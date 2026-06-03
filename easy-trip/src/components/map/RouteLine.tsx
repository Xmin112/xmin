"use client";

import type { RouteStop, MetroExit } from "@/types/place";

interface RouteLineProps {
  stops: RouteStop[];
  metroStart: MetroExit;
  /** 坐标投影函数：经纬度 → 像素坐标 */
  project: (lng: number, lat: number) => { x: number; y: number } | null;
}

/**
 * 手绘风格路线 SVG 叠加层
 *
 * 画在地图上方，模拟荧光笔/记号笔画出的路线
 * 特点：轻微抖动、圆角转折、珊瑚粉半透明
 */
export function RouteLine({ stops, metroStart, project }: RouteLineProps) {
  const points = [metroStart, ...stops.map((s) => s.place)]
    .map((p) => project(p.lng, p.lat))
    .filter((p): p is { x: number; y: number } => p !== null);

  if (points.length < 2) return null;

  // 构造 SVG path
  const d = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  return (
    <g>
      {/* 底层：粗的荧光笔底 */}
      <path
        d={d}
        fill="none"
        stroke="#FF6B6B"
        strokeWidth={6}
        strokeOpacity={0.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 中层：虚线手绘感 */}
      <path
        d={d}
        fill="none"
        stroke="#FF6B6B"
        strokeWidth={3}
        strokeOpacity={0.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="8 3"
      />
      {/* 顶层：细实线 */}
      <path
        d={d}
        fill="none"
        stroke="#FF6B6B"
        strokeWidth={1.5}
        strokeOpacity={0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}
