"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { RouteStop } from "@/types/place";

interface PoiMarkerProps {
  stops: RouteStop[];
  map: maplibregl.Map | null;
}

/** 在地图上添加手绘风格 POI 标记 */
export function PoiMarker({ stops, map }: PoiMarkerProps) {
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    // 清除旧标记
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // 添加新标记
    stops.forEach((stop) => {
      const { place, order } = stop;
      const el = createMarkerElement(order, place.category);

      const marker = new maplibregl.Marker({
        element: el,
        anchor: "center",
        offset: [0, -16],
      })
        .setLngLat([place.lng, place.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [stops, map]);

  return null;
}

/** 创建手绘风标记 DOM 元素 */
function createMarkerElement(order: number, category: string): HTMLDivElement {
  const outer = document.createElement("div");
  outer.style.cssText = "cursor: pointer; display: flex; flex-direction: column; align-items: center;";

  const emoji = getCategoryEmoji(category);

  // 内层 wrapper — hover 效果只作用在这里，不影响 MapLibre 的定位 transform
  outer.innerHTML = `
    <div class="marker-inner" style="
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    ">
      <div style="
        width: 34px; height: 34px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.18), 0 0 0 3px rgba(255,107,107,0.35);
      ">
        <span style="font-size: 15px; line-height: 1;">${emoji}</span>
      </div>
      <span style="
        display: block;
        margin-top: 3px;
        font-size: 9px;
        font-weight: 700;
        color: #4A3728;
        background: rgba(255,255,255,0.92);
        padding: 2px 6px;
        border-radius: 8px;
        white-space: nowrap;
        letter-spacing: 0.3px;
      ">${order}</span>
    </div>
  `;

  // 用 CSS :hover 而不是 JS 事件，避免覆盖 MapLibre transform
  const style = document.createElement("style");
  style.textContent = `
    .marker-inner:hover {
      transform: scale(1.2);
    }
  `;
  outer.appendChild(style);

  return outer;
}

/** 分类 → emoji 映射 */
function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    beauty: "💄",
    fashion: "👗",
    cafe: "☕",
    food: "🍽️",
    art: "🎨",
    shopping: "🛍️",
    culture: "🏛️",
  };
  return map[category] ?? "📍";
}
