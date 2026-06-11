"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { PlanResponse, RouteTheme } from "@/core/types";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const THEMES: { value: RouteTheme; label: string }[] = [
  { value: "买衣服", label: "买衣服" },
  { value: "吃东西", label: "吃东西" },
  { value: "探店", label: "探店" },
  { value: "咖啡", label: "咖啡" },
];

export default function HomePage() {
  const [district] = useState("seongsu");
  const [theme, setTheme] = useState<RouteTheme>("买衣服");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // ── Lenis 平滑滚动 ──
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // 同步 ScrollTrigger
    lenis.on("scroll", () => ScrollTrigger.update());
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(() => {});
    };
  }, []);

  // ── 入场动画 ──
  useEffect(() => {
    if (generated) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-word", {
        y: 80, opacity: 0, duration: 1, stagger: 0.15, ease: "power4.out", delay: 0.2,
      });
      gsap.from(".hero-sub", {
        y: 30, opacity: 0, duration: 0.9, ease: "power3.out", delay: 0.8,
      });
      gsap.from(".input-shell", {
        y: 50, opacity: 0, duration: 1, ease: "power3.out", delay: 1.1,
      });
    });
    return () => ctx.revert();
  }, [generated]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ district, theme }),
      });
      const data = (await res.json()) as PlanResponse;
      if (data.success && data.route) {
        setResult(data);
        setGenerated(true);
      } else {
        setError(data.error ?? "生成失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }, [district, theme]);

  // ── 生成后折叠 Hero ──
  useEffect(() => {
    if (!generated) return;

    const ctx = gsap.context(() => {
      // 折叠 Hero
      gsap.to(".hero-section", {
        height: "auto",
        paddingTop: "2rem",
        paddingBottom: "1.5rem",
        duration: 1.2,
        ease: "power4.inOut",
      });
      gsap.to(".hero-title-lg", {
        fontSize: "1.25rem",
        lineHeight: "1.2",
        duration: 1.2,
        ease: "power4.inOut",
      });
      gsap.to(".hero-sub", {
        height: 0, opacity: 0, marginTop: 0, duration: 0.6, ease: "power3.in",
      });
      // 折叠 Input → 窄条
      gsap.to(".input-shell", {
        scale: 0.92, y: -10, duration: 1, ease: "power4.inOut",
      });

      // Overlay
      gsap.fromTo(".overlay", { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.3 });

      // Stops 依次入场
      gsap.fromTo(".stop-section", { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, delay: 0.6, ease: "power3.out" },
      );
    });

    // ScrollTrigger: 每个 stop-section 进入视口时触发 stagger 内部元素
    const stops = document.querySelectorAll(".stop-section");
    stops.forEach((stop) => {
      ScrollTrigger.create({
        trigger: stop,
        start: "top 80%",
        onEnter: () => {
          gsap.fromTo(
            stop.querySelectorAll(".stop-inner > *"),
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: "power3.out" },
          );
        },
        once: true,
      });
    });

    // 滚动到第一个 stop
    setTimeout(() => {
      const first = document.querySelector(".stops-container");
      if (first) {
        const top = first.getBoundingClientRect().top + window.scrollY - 80;
        lenisRef.current?.scrollTo(top, { duration: 1.5, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
      }
    }, 800);

    return () => ctx.revert();
  }, [generated]);

  return (
    <main className="bg-[#FAFAFA] text-[#1A1A1A]">
      {/* ── Overlay ── */}
      <div ref={overlayRef} className="overlay fixed inset-0 pointer-events-none z-40 opacity-0">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#FAFAFA] to-transparent" />
      </div>

      {/* ── Hero Section ── */}
      <section className="hero-section px-6 pt-32 pb-10 md:pt-48 md:pb-12 transition-none">
        <div ref={heroRef} className="mx-auto max-w-[720px]">
          {/* Eyebrow */}
          <p className="hero-word text-[10px] uppercase tracking-[0.3em] font-medium text-[#8E8E93] mb-8">
            Voyage
          </p>

          {/* 大标题 —— 按词拆开做 stagger */}
          <h1 className="hero-title-lg text-[56px] leading-[1.05] font-light tracking-[-0.03em] md:text-[80px]">
            <span className="hero-word inline-block">在出发之前，</span>{" "}
            <span className="hero-word inline-block">先去一次。</span>
          </h1>

          <p className="hero-sub mt-6 text-[15px] text-[#8E8E93] leading-relaxed max-w-[380px]">
            输入你想去的地方。剩下的路线，我们来。
          </p>

          {/* Input */}
          <div ref={inputRef} className="mt-12">
            <div className="input-shell bg-white ring-1 ring-black/[0.06] rounded-[2rem] p-6 md:p-8">
              {/* 地点 */}
              <div className="flex items-center justify-between mb-7">
                <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#8E8E93]">
                  地点
                </span>
                <span className="text-sm text-[#1A1A1A]">首尔 · 圣水洞</span>
              </div>

              {/* 主题选择 */}
              <div className="flex flex-wrap gap-2 mb-8">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium
                      transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                      active:scale-[0.97]
                      ${theme === t.value
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-black/[0.03] text-[#8E8E93] hover:bg-black/[0.06] hover:text-[#1A1A1A]"
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={handleSubmit}
                disabled={loading || generated}
                className="group w-full rounded-full bg-[#1A1A1A] text-white px-6 py-3.5 text-sm font-medium
                  hover:bg-[#252525] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                  flex items-center justify-center gap-2"
              >
                <span>{loading ? "生成中…" : generated ? "已生成" : "生成路线"}</span>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10
                  group-hover:translate-x-0.5 transition-transform duration-300">
                  →
                </span>
              </button>

              {error && (
                <p className="mt-4 text-sm text-[#FF3B30] text-center">{error}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Route Result ── */}
      {result?.route && (
        <div className="stops-container">
          {/* 概览条 */}
          <div className="stop-section px-6 pb-20 md:pb-28">
            <div className="mx-auto max-w-[720px]">
              <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-[#8E8E93] mb-8">
                {result.route.title} · {result.route.stops.length} 站
              </p>
              <p className="text-sm text-[#8E8E93] leading-relaxed">
                {result.route.narrative}
              </p>
            </div>
          </div>

          {/* 每个停靠点 —— 大块展示 */}
          {result.route.stops.map((stop, i) => {
            const isDark = i % 2 === 1;
            return (
              <section
                key={stop.poi.id}
                className={`stop-section min-h-[85dvh] flex items-center
                  ${isDark ? "bg-[#0A0A0A] text-white" : "bg-[#FAFAFA] text-[#1A1A1A]"}`}
              >
                <div className="w-full px-6 py-24 md:py-32">
                  <div className="stop-inner mx-auto max-w-[720px]">
                    {/* 序号 */}
                    <p className={`text-[10px] uppercase tracking-[0.3em] font-medium mb-8
                      ${isDark ? "text-white/30" : "text-[#C7C7CC]"}`}>
                      {String(i + 1).padStart(2, "0")} / {result.route!.stops.length}
                    </p>

                    {/* 店名 —— 超大 */}
                    <h2 className={`text-[40px] leading-[1.08] font-light tracking-[-0.02em] mb-6
                      md:text-[64px] ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>
                      {stop.poi.name}
                    </h2>

                    {/* 分类标签 */}
                    <div className="flex items-center gap-3 mb-8">
                      <span className={`text-xs px-3 py-1 rounded-full
                        ${isDark ? "bg-white/10 text-white/60" : "bg-black/[0.04] text-[#8E8E93]"}`}>
                        {stop.poi.subcategory}
                      </span>
                      <span className={`text-xs ${isDark ? "text-white/30" : "text-[#C7C7CC]"}`}>
                        {stop.poi.nameKo}
                      </span>
                    </div>

                    {/* 描述 */}
                    <p className={`text-base leading-[1.8] max-w-[560px]
                      ${isDark ? "text-white/55" : "text-[#8E8E93]"}`}>
                      {stop.poi.description}
                    </p>

                    {/* 地铁出口 */}
                    <p className={`mt-10 text-[10px] uppercase tracking-[0.2em]
                      ${isDark ? "text-white/20" : "text-[#C7C7CC]"}`}>
                      {stop.poi.subwayExit} · {stop.poi.address}
                    </p>
                  </div>
                </div>
              </section>
            );
          })}

          {/* 结束语 */}
          <section className="px-6 py-40 md:py-56 flex items-center justify-center bg-[#FAFAFA]">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-[#C7C7CC] mb-6">
                Voyage
              </p>
              <p className="text-sm text-[#8E8E93]">
                路线由 AI 生成 · 仅供参考
              </p>
            </div>
          </section>
        </div>
      )}

      {/* 底部 padding —— 留出 Lenis 惯性滚动空间 */}
      <div className="h-1" />
    </main>
  );
}
