"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { PlanResponse, RouteTheme } from "@/core/types";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

type Theme = RouteTheme;

const THEMES: { value: Theme; label: string }[] = [
  { value: "买衣服", label: "买衣服" },
  { value: "吃东西", label: "吃东西" },
  { value: "探店", label: "探店" },
  { value: "咖啡", label: "咖啡" },
];

/** 装饰用几何片段 —— 每个 section 一个 */
function DecoFrame({ className }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none ${className ?? ""}`}>
      {/* 左上角 */}
      <svg className="absolute top-8 left-8 w-8 h-8 opacity-[0.12]" viewBox="0 0 32 32">
        <path d="M0 12V0h12" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </svg>
      {/* 右下角 */}
      <svg className="absolute bottom-8 right-8 w-8 h-8 opacity-[0.12]" viewBox="0 0 32 32">
        <path d="M32 20v12H20" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    </div>
  );
}

export default function HomePage() {
  const [district] = useState("seongsu");
  const [theme, setTheme] = useState<Theme>("买衣服");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // ── Lenis ──
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenisRef.current = lenis;
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.on("scroll", () => ScrollTrigger.update());
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => { lenis.destroy(); gsap.ticker.remove(() => {}); };
  }, []);

  // ── 页面加载入场 ──
  useEffect(() => {
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
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // ── 单条 GSAP Timeline：生成 → 折叠 → 滚动 → 展开结果 ──
  const runAnimation = useCallback((route: NonNullable<PlanResponse["route"]>) => {
    // 先清理旧 ScrollTrigger
    ScrollTrigger.getAll().forEach((st) => st.kill());
    timelineRef.current?.kill();

    const stops = route.stops;
    if (!resultRef.current) return;

    // 把结果 DOM 写进去
    const html = stops.map((s, i) => {
      const isDark = i % 2 === 1;
      return `
        <section class="stop-section min-h-[80dvh] flex items-center relative overflow-hidden
          ${isDark ? "bg-[#0D0D0D] text-white" : "bg-[#FDFBF7] text-[#1A1A1A]"}" data-index="${i}">
          <div class="stop-deco absolute inset-0 pointer-events-none">
            <svg class="absolute top-10 left-10 w-10 h-10 ${isDark ? "opacity-[0.08]" : "opacity-[0.06]"}" viewBox="0 0 40 40">
              <path d="M0 16V0h16" fill="none" stroke="currentColor" stroke-width="0.5"/>
            </svg>
            <svg class="absolute bottom-10 right-10 w-10 h-10 ${isDark ? "opacity-[0.08]" : "opacity-[0.06]"}" viewBox="0 0 40 40">
              <path d="M40 24v16H24" fill="none" stroke="currentColor" stroke-width="0.5"/>
            </svg>
            ${i === 0 ? `<svg class="absolute top-1/2 right-12 -translate-y-1/2 w-32 h-32 ${isDark ? "opacity-[0.03]" : "opacity-[0.02]"}" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="62" fill="none" stroke="currentColor" stroke-width="0.3" stroke-dasharray="4 8"/>
              <circle cx="64" cy="64" r="42" fill="none" stroke="currentColor" stroke-width="0.3" stroke-dasharray="4 8"/>
            </svg>` : ""}
            <div class="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 text-[120px] md:text-[200px] font-light leading-none ${isDark ? "text-white/[0.02]" : "text-black/[0.02]"}" aria-hidden="true">
              ${String(i + 1).padStart(2, "0")}
            </div>
          </div>
          <div class="stop-inner w-full px-6 md:px-12 py-20 md:py-28 relative z-10">
            <div class="mx-auto max-w-[720px]">
              <div class="flex items-center gap-4 mb-6">
                <span class="w-8 h-px ${isDark ? "bg-white/15" : "bg-black/[0.08]"}"></span>
                <span class="text-[10px] uppercase tracking-[0.3em] font-medium ${isDark ? "text-white/25" : "text-[#8E8E93]"}">
                  ${String(i + 1).padStart(2, "0")} · ${s.poi.subcategory}
                </span>
              </div>
              <h2 class="text-[36px] leading-[1.08] font-light tracking-[-0.02em] mb-6 md:text-[56px]
                ${isDark ? "text-white" : "text-[#1A1A1A]"}">
                ${s.poi.name}
              </h2>
              <p class="text-xs ${isDark ? "text-white/20" : "text-[#C7C7CC]"} mb-8">${s.poi.nameKo}</p>
              <p class="text-[15px] leading-[1.8] max-w-[520px] ${isDark ? "text-white/45" : "text-[#8E8E93]"}">
                ${s.poi.description}
              </p>
              <div class="mt-12 flex items-center gap-4">
                <span class="w-12 h-px ${isDark ? "bg-white/10" : "bg-black/[0.06]"}"></span>
                <span class="text-[10px] uppercase tracking-[0.2em] ${isDark ? "text-white/15" : "text-[#C7C7CC]"}">
                  ${s.poi.subwayExit} · ${s.poi.address.split("首尔").pop() ?? ""}
                </span>
              </div>
            </div>
          </div>
        </section>`;
    }).join("");

    const footer = `
      <section class="relative py-32 md:py-48 flex items-center justify-center bg-[#FDFBF7] overflow-hidden">
        <div class="absolute inset-0 pointer-events-none opacity-[0.02]"
          style="background-image: radial-gradient(circle, currentColor 0.5px, transparent 0.5px); background-size: 24px 24px;">
        </div>
        <div class="relative z-10 text-center">
          <p class="text-[10px] uppercase tracking-[0.3em] font-medium text-[#C7C7CC] mb-4">Voyage</p>
          <p class="text-sm text-[#8E8E93]">${route.stops.length} 站 · 不回头路线 · 由 AI 生成</p>
        </div>
      </section>`;

    resultRef.current.innerHTML = `
      <div class="stops-summary stop-section px-6 py-16 md:py-20 bg-[#FDFBF7]">
        <div class="mx-auto max-w-[720px]">
          <p class="text-[10px] uppercase tracking-[0.3em] font-medium text-[#8E8E93] mb-4">
            ${route.title} · ${route.stops.length} 站
          </p>
          <p class="text-sm text-[#8E8E93]">${route.narrative}</p>
        </div>
      </div>
      ${html}
      ${footer}`;

    // ── 单一 Timeline：折叠 Hero → 滚动 → Stagger 展开 ──
    const tl = gsap.timeline();
    timelineRef.current = tl;

    // Step 1: 折叠 Hero
    tl.to(".hero-section", {
      paddingTop: "2rem", paddingBottom: "1rem", duration: 1, ease: "power4.inOut",
    }, 0)
    .to(".hero-title-lg", {
      fontSize: "1.25rem", lineHeight: "1.2", duration: 1, ease: "power4.inOut",
    }, 0)
    .to(".hero-sub", {
      height: 0, opacity: 0, marginTop: 0, duration: 0.5, ease: "power3.in",
    }, 0.2)
    .to(".input-shell", {
      scale: 0.9, y: -8, opacity: 0.5, duration: 0.8, ease: "power4.inOut",
    }, 0)
    // Step 2: Summary + Stops fade in
    .fromTo(".stops-summary", { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
    }, 0.6)
    .fromTo(".stop-section", { opacity: 0, y: 50 }, {
      opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out",
    }, 0.8);

    // Step 3: 动画完成后滚动到结果区
    tl.eventCallback("onComplete", () => {
      const firstStop = document.querySelector(".stops-summary");
      if (firstStop && lenisRef.current) {
        const top = firstStop.getBoundingClientRect().top + window.scrollY - 40;
        lenisRef.current.scrollTo(top, {
          duration: 1.2,
          easing: (t: number) => 1 - Math.pow(1 - t, 4),
        });
      }
    });

    // ScrollTrigger: 每个 stop section 内元素入场
    const stopSections = resultRef.current.querySelectorAll(".stop-section");
    stopSections.forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec,
        start: "top 85%",
        onEnter: () => {
          gsap.fromTo(
            sec.querySelectorAll(".stop-inner > div > *"),
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power3.out" },
          );
        },
        once: true,
      });
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ district, theme }),
      });
      const data = (await res.json()) as PlanResponse;
      if (data.success && data.route) {
        runAnimation(data.route);
      } else {
        setError(data.error ?? "生成失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }, [district, theme, runAnimation]);

  return (
    <main ref={containerRef} className="bg-[#FDFBF7] text-[#1A1A1A]">
      {/* ── 固定噪点纹理 ── */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Hero ── */}
      <section className="hero-section px-6 pt-32 pb-12 md:pt-48 md:pb-16">
        <div className="mx-auto max-w-[720px]">
          <p className="hero-word text-[10px] uppercase tracking-[0.3em] font-medium text-[#8E8E93] mb-8">
            Voyage
          </p>
          <h1 className="hero-title-lg text-[56px] leading-[1.05] font-light tracking-[-0.03em] md:text-[80px]">
            <span className="hero-word inline-block">在出发之前，</span>{" "}
            <span className="hero-word inline-block">先去一次。</span>
          </h1>
          <p className="hero-sub mt-6 text-[15px] text-[#8E8E93] leading-relaxed max-w-[380px]">
            输入你想去的地方。剩下的路线，我们来。
          </p>

          {/* Input */}
          <div className="mt-12">
            <div className="input-shell bg-white ring-1 ring-black/[0.05] rounded-[2rem] p-6 md:p-8
              shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
              <div className="flex items-center justify-between mb-7">
                <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#8E8E93]">
                  地点
                </span>
                <span className="text-sm text-[#1A1A1A]">首尔 · 圣水洞</span>
              </div>

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

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="group w-full rounded-full bg-[#1A1A1A] text-white px-6 py-3.5 text-sm font-medium
                  hover:bg-[#2E2E2E] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                  flex items-center justify-center gap-2"
              >
                <span>{loading ? "生成中…" : "生成路线"}</span>
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

      {/* ── 结果渲染区 —— GSAP Timeline 直接操作 innerHTML ── */}
      <div ref={resultRef} />
    </main>
  );
}
