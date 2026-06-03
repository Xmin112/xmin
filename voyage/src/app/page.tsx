"use client";

import { useState, useCallback, useRef } from "react";
import { GlobeScene } from "@/components/GlobeScene";
import { AppleSetup } from "@/components/AppleSetup";
import { VoyageWorld } from "@/components/VoyageWorld";
import type { ZoomLevel } from "@/components/GlobeScene";

type Phase = "idle" | "questions" | "flying" | "world";

const FLIGHT_SEQUENCE: ZoomLevel[] = ["world", "continent", "country", "city", "district"];
const FLIGHT_DELAYS = [0, 1800, 1600, 1500, 1300];

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("world");
  const [accentColor, setAccentColor] = useState("#007AFF");
  const flightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 开始问答
  const handleGlobeClick = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("questions");
  }, [phase]);

  // 问答完成 → 飞行
  const handleSetupComplete = useCallback((answers: Record<string, string>) => {
    const dest = answers.destination;
    if (dest.toLowerCase().includes("首尔") || dest.toLowerCase().includes("seoul")) {
      setAccentColor("#FF5E7A");
    }
    setPhase("flying");

    // 逐级飞行
    FLIGHT_SEQUENCE.forEach((level, i) => {
      flightTimer.current = setTimeout(() => {
        setZoomLevel(level);
      }, FLIGHT_DELAYS.slice(0, i + 1).reduce((a, b) => a + b, 0));
    });

    // 飞行完成后显示 2.5D 世界
    const totalFlight = FLIGHT_DELAYS.reduce((a, b) => a + b, 0) + 1200;
    flightTimer.current = setTimeout(() => {
      setPhase("world");
    }, totalFlight);
  }, []);

  return (
    <div className="relative h-full w-full bg-white overflow-hidden">
      {/* 光斑 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="light-blob w-[500px] h-[500px] -top-[200px] -right-[100px]"
          style={{ backgroundColor: accentColor }} />
        <div className="light-blob w-[350px] h-[350px] -bottom-[150px] -left-[80px]"
          style={{ backgroundColor: accentColor, opacity: 0.14 }} />
      </div>

      {/* ====== IDLE: 纯白 + 地球 ====== */}
      {(phase === "idle" || phase === "questions") && (
        <div className="absolute inset-0" onClick={phase === "idle" ? handleGlobeClick : undefined}>
          <GlobeScene zoomLevel={phase === "questions" ? "world" : zoomLevel} accentColor={accentColor} />
        </div>
      )}

      {/* ====== QUESTIONS ====== */}
      {phase === "questions" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <AppleSetup accentColor={accentColor} onComplete={handleSetupComplete} />
          </div>
        </div>
      )}

      {/* ====== FLYING ====== */}
      {phase === "flying" && (
        <>
          <div className="absolute inset-0">
            <GlobeScene zoomLevel={zoomLevel} accentColor={accentColor} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center animate-pulse-soft">
              <p className="text-[17px] text-[#86868B]">正在探索首尔…</p>
            </div>
          </div>
        </>
      )}

      {/* ====== WORLD: 2.5D 首尔 ====== */}
      {phase === "world" && (
        <VoyageWorld accentColor={accentColor} visible={phase === "world"} />
      )}

      {/* IDLE 时底部提示 */}
      {phase === "idle" && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
          <p className="text-[13px] text-[#AEAEB2] animate-pulse-soft">
            点击任意位置开始
          </p>
        </div>
      )}
    </div>
  );
}
