"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { PlanResponse, RouteTheme } from "@/core/types";
import { gsap } from "gsap";

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

  // ── DOM refs for GSAP ──
  const heroRef = useRef<HTMLDivElement>(null);
  const inputCardRef = useRef<HTMLDivElement>(null);
  const resultSectionRef = useRef<HTMLDivElement>(null);

  // ── 入场动画 ──
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero stagger
      gsap.from(".hero-item", {
        y: 48,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.3,
      });

      // Input card float up
      gsap.from(".input-card", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.8,
      });
    });

    return () => ctx.revert();
  }, []);

  // ── 结果入场动画 ──
  useEffect(() => {
    if (!result?.route) return;

    // 等 DOM 渲染完
    requestAnimationFrame(() => {
      const ctx = gsap.context(() => {
        // Section 标题
        gsap.from(".result-section .section-eyebrow", {
          y: 24, opacity: 0, duration: 0.7, ease: "power3.out",
        });
        gsap.from(".result-section .route-title", {
          y: 32, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.1,
        });
        gsap.from(".result-section .route-meta", {
          y: 20, opacity: 0, duration: 0.7, ease: "power3.out", delay: 0.15,
        });

        // 叙事卡片
        gsap.from(".narrative-card", {
          y: 48, opacity: 0, duration: 1, ease: "power3.out", delay: 0.3,
        });

        // 停靠点卡片交错入场
        gsap.from(".stop-card", {
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          delay: 0.5,
        });
      }, resultSectionRef.current ?? undefined);

      return () => ctx.revert();
    });
  }, [result]);

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
      } else {
        setError(data.error ?? "生成失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }, [district, theme]);

  return (
    <main className="min-h-[100dvh] bg-[#FAFAFA]">
      {/* ── Hero ── */}
      <section className="px-6 pt-32 pb-12 md:pt-48 md:pb-16">
        <div ref={heroRef} className="mx-auto max-w-prose">
          <p className="hero-item text-[10px] uppercase tracking-[0.25em] font-medium text-[#8E8E93] mb-8">
            Voyage
          </p>
          <h1 className="hero-item text-[52px] leading-[1.06] font-light text-[#1A1A1A] tracking-[-0.03em] md:text-[72px]">
            在出发之前，
            <br />
            先去一次。
          </h1>
          <p className="hero-item mt-8 text-base text-[#8E8E93] leading-relaxed max-w-[440px]">
            输入你想去的地方和想做的事。
            <br />
            剩下的路线，我们来。
          </p>
        </div>
      </section>

      {/* ── Input Card ── */}
      <section className="px-6 pb-12 md:pb-16">
        <div ref={inputCardRef} className="mx-auto max-w-prose">
          {/* Double-Bezel: Outer Shell */}
          <div className="input-card bg-black/[0.025] ring-1 ring-black/[0.04] p-[5px] rounded-[2rem]">
            {/* Inner Core */}
            <div className="bg-white rounded-[calc(2rem-0.25rem)] p-7 md:p-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
              {/* District display — 只读，简洁 */}
              <div className="mb-7">
                <p className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#8E8E93] mb-2">
                  地点
                </p>
                <p className="text-lg text-[#1A1A1A]">首尔 · 圣水洞</p>
              </div>

              {/* Theme pills */}
              <div className="mb-9">
                <p className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#8E8E93] mb-4">
                  路线主题
                </p>
                <div className="flex flex-wrap gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium
                        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                        active:scale-[0.97]
                        ${
                          theme === t.value
                            ? "bg-[#1A1A1A] text-white"
                            : "bg-black/[0.03] text-[#8E8E93] hover:bg-black/[0.06] hover:text-[#1A1A1A]"
                        }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="group w-full rounded-full bg-[#1A1A1A] text-white px-6 py-3.5 text-sm font-medium
                  hover:bg-[#252525] active:scale-[0.98]
                  transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                  flex items-center justify-center gap-2"
              >
                <span>{loading ? "生成中…" : "生成路线"}</span>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10
                  group-hover:translate-x-0.5 group-hover:-translate-y-px transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  →
                </span>
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-5 text-sm text-[#FF3B30] text-center">{error}</p>
          )}
        </div>
      </section>

      {/* ── Route Result ── */}
      {result?.route && (
        <section ref={resultSectionRef} className="result-section px-6 pb-40 md:pb-56">
          <div className="mx-auto max-w-prose">
            {/* Section label */}
            <p className="section-eyebrow text-[10px] uppercase tracking-[0.25em] font-medium text-[#8E8E93] mb-10">
              路线
            </p>

            {/* Title */}
            <h2 className="route-title text-[32px] font-light text-[#1A1A1A] tracking-[-0.02em] mb-3">
              {result.route.title}
            </h2>
            <p className="route-meta text-sm text-[#8E8E93] mb-12">
              {result.route.stops.length} 站 · 全程约 {Math.ceil(result.route.totalDurationMin / 60)} 小时
            </p>

            {/* Narrative — 沉浸式黑底 */}
            <div className="narrative-card bg-[#0A0A0A] rounded-[2rem] p-8 md:p-10 mb-14">
              <p className="text-sm text-white/65 leading-[1.9] whitespace-pre-line">
                {result.route.narrative}
              </p>
            </div>

            {/* Timeline stops */}
            <div className="relative pl-10">
              {/* 竖线 */}
              <div className="absolute left-[5px] top-1 bottom-1 w-px bg-black/[0.05]" />

              <ul className="space-y-12">
                {result.route.stops.map((stop, i) => (
                  <li key={stop.poi.id} className="stop-card relative">
                    {/* 序号圆点 */}
                    <div className="absolute -left-[29px] top-0 w-[11px] h-[11px] rounded-full bg-[#1A1A1A]
                      flex items-center justify-center">
                    </div>

                    {/* 卡片内容 */}
                    <div className="bg-white ring-1 ring-black/[0.03] rounded-2xl p-6
                      transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                      hover:ring-black/[0.08]">
                      {/* Number + Category */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#C7C7CC]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#8E8E93]">
                          {stop.poi.subcategory}
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="text-xl font-regular text-[#1A1A1A] mb-3">
                        {stop.poi.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-[#8E8E93] leading-[1.75]">
                        {stop.poi.description}
                      </p>

                      {/* Transit hint — 极简，只有地铁口 */}
                      <p className="mt-4 text-[10px] uppercase tracking-[0.15em] text-[#C7C7CC]">
                        {stop.poi.subwayExit} · {stop.poi.nameKo}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <p className="mt-20 text-[10px] uppercase tracking-[0.3em] font-medium text-[#C7C7CC] text-center">
              Voyage · 路线由 AI 生成 · 仅供参考
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
