"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Route, RouteStop } from "@/types/place";
import type { GeoPoint } from "@/types/route";
import { RouteLine } from "./RouteLine";
import { PoiMarker } from "./PoiMarker";

interface RouteMapProps {
  route: Route | null;
}

/** 使用 MapLibre GL 渲染手绘风路线地图 */
export function RouteMap({ route }: RouteMapProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [projectFn, setProjectFn] = useState<
    ((lng: number, lat: number) => { x: number; y: number }) | null
  >(null);

  // 初始化地图
  useEffect(() => {
    if (!containerRef.current || initialized.current) return;
    initialized.current = true;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getHanddrawnStyle(),
      center: [126.9237, 37.5572],
      zoom: 14,
      attributionControl: false,
      interactive: true,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "bottom-right"
    );

    // 地图加载完成后，提供 project 函数
    map.on("load", () => {
      setProjectFn(() => (lng: number, lat: number) => {
        const pt = map.project([lng, lat]);
        return { x: pt.x, y: pt.y };
      });
    });

    // 地图移动/缩放时更新 project 函数引用
    map.on("move", () => {
      setProjectFn(() => (lng: number, lat: number) => {
        const pt = map.project([lng, lat]);
        return { x: pt.x, y: pt.y };
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      initialized.current = false;
      setProjectFn(null);
    };
  }, []);

  // 路线变化时飞到路线区域
  useEffect(() => {
    if (!route || !mapRef.current) return;

    const map = mapRef.current;
    const allPoints: Array<[number, number]> = [
      [route.metroStart.lng, route.metroStart.lat],
      ...route.stops.map((s) => [s.place.lng, s.place.lat] as [number, number]),
    ];

    const bounds = new maplibregl.LngLatBounds();
    allPoints.forEach((p) => bounds.extend(p));

    map.fitBounds(bounds, { padding: 80, maxZoom: 16, duration: 1200 });
  }, [route]);

  // 获取 SVG overlay 尺寸
  const [svgSize, setSvgSize] = useState({ w: 800, h: 600 });
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSvgSize({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });
    observer.observe(overlayRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={overlayRef} className="relative w-full h-full">
      {/* MapLibre 地图 */}
      <div ref={containerRef} className="w-full h-full" />

      {/* SVG 路线覆盖层 */}
      {route && projectFn && (
        <svg
          className="absolute inset-0 pointer-events-none"
          width={svgSize.w}
          height={svgSize.h}
          viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
        >
          <RouteLine
            stops={route.stops}
            metroStart={route.metroStart}
            project={projectFn}
          />
        </svg>
      )}

      {/* MapLibre 原生 POI 标记 */}
      {route && mapRef.current && (
        <PoiMarker stops={route.stops} map={mapRef.current} />
      )}
    </div>
  );
}

/** 手绘风格底图样式 */
function getHanddrawnStyle(): maplibregl.StyleSpecification {
  return {
    version: 8,
    name: "Easy Trip Handdrawn",
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap",
      },
    },
    layers: [
      {
        id: "osm-tiles",
        type: "raster",
        source: "osm",
        paint: {
          // 降低饱和度 + 提亮 → 暖色手绘底图感
          "raster-saturation": -0.9,
          "raster-contrast": 0.2,
          "raster-brightness-min": 0.15,
          "raster-brightness-max": 0.5,
        },
      },
    ],
  };
}
