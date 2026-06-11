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

export default function HomePage() {
  const [district] = useState("seongsu");
  const [theme, setTheme] = useState<Theme>("买衣服");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

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

  // ── 入场动画 ──
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
    ctxRef.current = ctx;
    return () => ctx.revert();
  }, []);

  // ── 生成路线 → 单条连续 Timeline ──
  const runAnimation = useCallback((route: NonNullable<PlanResponse["route"]>) => {
    // 清理旧触发器 & 旧 context
    ScrollTrigger.getAll().forEach((st) => st.kill());
    ctxRef.current?.revert();
    if (!resultRef.current) return;

    const stops = route.stops;

    // 构建 HTML —— 每站不同的布局
    const stopHTML = stops.map((s, i) => {
      const isDark = i % 2 === 1;
      const isSplit = i % 3 === 0; // 每第三站用 Editorial Split 布局

      if (isSplit) {
        // Editorial Split: 左半巨大店名 + 右半描述
        return `
        <section class="stop-section min-h-[90dvh] flex items-center relative overflow-hidden
          ${isDark ? "bg-[#0D0D0D] text-white" : "bg-[#FDFBF7] text-[#1A1A1A]"}" data-index="${i}">
          <!-- 装饰: 大号数字固定 -->
          <div class="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none flex items-center justify-center opacity-[0.03]">
            <span class="text-[40vw] font-light leading-none ${isDark ? "text-white" : "text-black"}">${String(i + 1).padStart(2, "0")}</span>
          </div>
          <div class="stop-inner w-full px-6 md:px-12 py-24 md:py-32 relative z-10">
            <div class="mx-auto max-w-[1200px] flex flex-col md:flex-row md:items-center gap-10 md:gap-20">
              <!-- 左半 -->
              <div class="md:w-1/2">
                <span class="w-10 h-px block mb-6 ${isDark ? "bg-white/15" : "bg-black/[0.08]"}"></span>
                <p class="text-[10px] uppercase tracking-[0.3em] font-medium mb-4 ${isDark ? "text-white/25" : "text-[#8E8E93]"}">
                  ${String(i + 1).padStart(2, "0")} · ${s.poi.subcategory}
                </p>
                <h2 class="text-[40px] leading-[1.06] font-light tracking-[-0.02em] md:text-[64px]
                  ${isDark ? "text-white" : "text-[#1A1A1A]"}">${s.poi.name}</h2>
                <p class="text-xs mt-3 ${isDark ? "text-white/15" : "text-[#C7C7CC]"}">${s.poi.nameKo}</p>
              </div>
              <!-- 右半 -->
              <div class="md:w-1/2">
                <p class="text-[15px] leading-[1.8] max-w-[440px] ${isDark ? "text-white/45" : "text-[#8E8E93]"}">
                  ${s.poi.description}
                </p>
                <p class="mt-10 text-[10px] uppercase tracking-[0.2em] ${isDark ? "text-white/15" : "text-[#C7C7CC]"}">
                  ${s.poi.subwayExit} · ${s.poi.address}
                </p>
              </div>
            </div>
          </div>
        </section>`;
      }

      // 默认: Double-Bezel 居中布局
      return `
      <section class="stop-section min-h-[90dvh] flex items-center relative overflow-hidden
        ${isDark ? "bg-[#0D0D0D] text-white" : "bg-[#FDFBF7] text-[#1A1A1A]"}" data-index="${i}">
        <!-- 装饰层 -->
        <div class="stop-deco absolute inset-0 pointer-events-none">
          <svg class="absolute top-12 left-12 w-12 h-12 ${isDark ? "opacity-[0.06]" : "opacity-[0.04]"}" viewBox="0 0 48 48">
            <rect x="0" y="0" width="16" height="16" fill="none" stroke="currentColor" stroke-width="0.4"/>
            <rect x="4" y="4" width="8" height="8" fill="none" stroke="currentColor" stroke-width="0.3"/>
          </svg>
          <svg class="absolute bottom-12 right-12 w-12 h-12 ${isDark ? "opacity-[0.06]" : "opacity-[0.04]"}" viewBox="0 0 48 48">
            <rect x="32" y="32" width="16" height="16" fill="none" stroke="currentColor" stroke-width="0.4"/>
            <rect x="36" y="36" width="8" height="8" fill="none" stroke="currentColor" stroke-width="0.3"/>
          </svg>
          ${i === 0 ? `
          <svg class="absolute top-1/2 right-16 -translate-y-1/2 w-40 h-40 ${isDark ? "opacity-[0.04]" : "opacity-[0.02]"}" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="78" fill="none" stroke="currentColor" stroke-width="0.3" stroke-dasharray="4 12"/>
            <circle cx="80" cy="80" r="50" fill="none" stroke="currentColor" stroke-width="0.3"/>
          </svg>` : ""}
        </div>
        <!-- Double-Bezel Outer -->
        <div class="stop-inner w-full px-6 md:px-12 py-24 md:py-32 relative z-10">
          <div class="mx-auto max-w-[680px]">
            <!-- Outer Shell -->
            <div class="${isDark ? "bg-white/[0.02] ring-1 ring-white/[0.04]" : "bg-black/[0.015] ring-1 ring-black/[0.03]"} p-[5px] rounded-[2.5rem]">
              <!-- Inner Core -->
              <div class="${isDark ? "bg-[#0D0D0D] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" : "bg-[#FDFBF7] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"} rounded-[calc(2.5rem-0.25rem)] p-10 md:p-14">
                <div class="flex items-center gap-4 mb-6">
                  <span class="w-8 h-px ${isDark ? "bg-white/15" : "bg-black/[0.08]"}"></span>
                  <span class="text-[10px] uppercase tracking-[0.3em] font-medium ${isDark ? "text-white/25" : "text-[#8E8E93]"}">
                    ${String(i + 1).padStart(2, "0")} · ${s.poi.subcategory}
                  </span>
                </div>
                <h2 class="text-[32px] leading-[1.08] font-light tracking-[-0.02em] mb-4 md:text-[48px]
                  ${isDark ? "text-white" : "text-[#1A1A1A]"}">${s.poi.name}</h2>
                <p class="text-xs mb-8 ${isDark ? "text-white/15" : "text-[#C7C7CC]"}">${s.poi.nameKo}</p>
                <p class="text-[15px] leading-[1.8] max-w-[480px] ${isDark ? "text-white/45" : "text-[#8E8E93]"}">
                  ${s.poi.description}
                </p>
                <p class="mt-10 text-[10px] uppercase tracking-[0.2em] ${isDark ? "text-white/12" : "text-[#C7C7CC]"}">
                  ${s.poi.subwayExit} · ${s.poi.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>`;
    }).join("");

    const footerHTML = `
    <section class="relative py-40 md:py-56 flex items-center justify-center bg-[#FDFBF7] overflow-hidden">
      <div class="absolute inset-0 pointer-events-none opacity-[0.015]"
        style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 28px 28px;"></div>
      <div class="relative z-10 text-center">
        <p class="text-[10px] uppercase tracking-[0.3em] font-medium text-[#C7C7CC] mb-4">Voyage</p>
        <p class="text-sm text-[#8E8E93]">${route.stops.length} 站 · 不回头路线 · AI 生成</p>
      </div>
    </section>`;

    resultRef.current.innerHTML = `
    <div class="stops-summary stop-section px-6 py-16 md:py-20 bg-[#FDFBF7]">
      <div class="mx-auto max-w-[720px]">
        <p class="text-[10px] uppercase tracking-[0.3em] font-medium text-[#8E8E93] mb-3">${route.title} · ${route.stops.length} 站</p>
        <p class="text-sm text-[#8E8E93]">${route.narrative}</p>
      </div>
    </div>
    ${stopHTML}
    ${footerHTML}`;

    // ScrollTrigger.refresh() — 必须在 DOM 变更后
    ScrollTrigger.refresh();

    // 新建 gsap context 管理所有动画
    const ctx = gsap.context(() => {
      // ── Timeline: 折叠 Hero → 滚动 → Stagger 展开 ──
      const tl = gsap.timeline();
      tl.to(".hero-section", { paddingTop: "2rem", paddingBottom: "1rem", duration: 1, ease: "power4.inOut" }, 0)
        .to(".hero-title-lg", { fontSize: "1.25rem", lineHeight: "1.2", duration: 1, ease: "power4.inOut" }, 0)
        .to(".hero-sub", { height: 0, opacity: 0, marginTop: 0, duration: 0.5, ease: "power3.in" }, 0.2)
        .to(".input-shell", { scale: 0.9, y: -8, opacity: 0.5, duration: 0.8, ease: "power4.inOut" }, 0)
        .fromTo(".stops-summary", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.6)
        .fromTo(".stop-section", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: "power3.out" }, 0.8);

      // 动画完成后滚动
      tl.eventCallback("onComplete", () => {
        const target = document.querySelector(".stops-summary");
        if (target && lenisRef.current) {
          const top = target.getBoundingClientRect().top + window.scrollY - 40;
          lenisRef.current.scrollTo(top, { duration: 1.2, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
        }
      });

      // ── ScrollTrigger.batch(): 每个 stop 入场时内部元素 stagger ──
      ScrollTrigger.batch(".stop-section .stop-inner > div > div > *", {
        interval: 0.08,
        batchMax: 6,
        onEnter: (elements) => {
          gsap.fromTo(elements, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: "power3.out" });
        },
        start: "top 85%",
        once: true,
      });

      // ── Scrub: 装饰数字随滚动慢慢旋转 ──
      document.querySelectorAll(".stop-section").forEach((sec) => {
        const bigNum = sec.querySelector(".stop-deco svg:last-of-type circle, .stop-section > div > div:first-child");
        if (!bigNum) return;
        ScrollTrigger.create({
          trigger: sec,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
          onUpdate: (self) => {
            const els = sec.querySelectorAll(".stop-deco svg circle");
            els.forEach((el) => {
              (el as SVGCircleElement).style.transform = `rotate(${self.progress * 180}deg)`;
              (el as SVGCircleElement).style.transformOrigin = "center center";
            });
          },
        });
      });
    }, resultRef);

    ctxRef.current = ctx;
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
      {/* 噪点纹理 */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Hero ── */}
      <section className="hero-section px-6 pt-32 pb-12 md:pt-48 md:pb-16">
        <div className="mx-auto max-w-[720px]">
          <p className="hero-word text-[10px] uppercase tracking-[0.3em] font-medium text-[#8E8E93] mb-8">Voyage</p>
          <h1 className="hero-title-lg text-[56px] leading-[1.05] font-light tracking-[-0.03em] md:text-[80px]">
            <span className="hero-word inline-block">在出发之前，</span>{" "}
            <span className="hero-word inline-block">先去一次。</span>
          </h1>
          <p className="hero-sub mt-6 text-[15px] text-[#8E8E93] leading-relaxed max-w-[380px]">
            输入你想去的地方。剩下的路线，我们来。
          </p>
          <div className="mt-12">
            <div className="input-shell bg-white ring-1 ring-black/[0.05] rounded-[2rem] p-6 md:p-8
              shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
              <div className="flex items-center justify-between mb-7">
                <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#8E8E93]">地点</span>
                <span className="text-sm text-[#1A1A1A]">首尔 · 圣水洞</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-8">
                {THEMES.map((t) => (
                  <button key={t.value} onClick={() => setTheme(t.value)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-500
                      ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]
                      ${theme === t.value ? "bg-[#1A1A1A] text-white" : "bg-black/[0.03] text-[#8E8E93] hover:bg-black/[0.06] hover:text-[#1A1A1A]"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <button onClick={handleSubmit} disabled={loading}
                className="group w-full rounded-full bg-[#1A1A1A] text-white px-6 py-3.5 text-sm font-medium
                  hover:bg-[#2E2E2E] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                  flex items-center justify-center gap-2">
                <span>{loading ? "生成中…" : "生成路线"}</span>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10
                  group-hover:translate-x-0.5 transition-transform duration-300">→</span>
              </button>
              {error && <p className="mt-4 text-sm text-[#FF3B30] text-center">{error}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* ── 结果区 —— GSAP 直接操作 ── */}
      <div ref={resultRef} />
    </main>
  );
}
