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
      const el = createMarkerElement(order, place.name, place.category);

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
function createMarkerElement(order: number, name: string, category: string): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "flex flex-col items-center";
  el.style.cssText = "cursor: pointer;";

  const emoji = getCategoryEmoji(category);

  el.innerHTML = `
    <div style="
      width: 32px; height: 32px;
      background: white;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 0 0 3px rgba(255,107,107,0.3);
      transition: transform 0.2s;
    ">
      <span style="font-size: 14px;">${emoji}</span>
    </div>
    <span style="
      display: block; margin-top: 2px;
      font-size: 9px; font-weight: 600;
      color: #4A3728;
      background: rgba(255,255,255,0.9);
      padding: 1px 5px; border-radius: 6px;
      white-space: nowrap;
    ">${order}</span>
  `;

  el.addEventListener("mouseenter", () => {
    el.style.transform = "scale(1.15)";
  });
  el.addEventListener("mouseleave", () => {
    el.style.transform = "scale(1)";
  });

  return el;
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
