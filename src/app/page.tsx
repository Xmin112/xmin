"use client";

import { useState, useCallback } from "react";
import type { PlanResponse, RouteTheme } from "@/core/types";

const THEMES: { value: RouteTheme; label: string }[] = [
  { value: "买衣服", label: "买衣服" },
  { value: "吃东西", label: "吃东西" },
  { value: "探店", label: "探店" },
  { value: "咖啡", label: "咖啡" },
];

export default function HomePage() {
  const [district, setDistrict] = useState("seongsu");
  const [theme, setTheme] = useState<RouteTheme>("买衣服");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      <section className="px-6 pt-24 pb-16 md:pt-40 md:pb-24">
        <div className="mx-auto max-w-prose">
          {/* Eyebrow */}
          <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#8E8E93] mb-6">
            Voyage
          </p>

          {/* H1 */}
          <h1 className="text-[48px] leading-[1.1] font-light text-[#1A1A1A] tracking-[-0.02em] md:text-[64px]">
            在出发之前，
            <br />
            先去一次。
          </h1>

          {/* Sub */}
          <p className="mt-6 text-base text-[#8E8E93] leading-relaxed max-w-[480px]">
            AI 搜索最值得去的店，规划不回头路线。
            <br />
            从地铁几号口出、怎么走，都帮你安排好。
          </p>
        </div>
      </section>

      {/* ── Input Card ── */}
      <section className="px-6 pb-24 md:pb-32">
        <div className="mx-auto max-w-prose">
          {/* Double-Bezel Outer Shell */}
          <div className="bg-black/[0.03] ring-1 ring-black/[0.04] p-[6px] rounded-[2rem]">
            {/* Inner Core */}
            <div className="bg-white rounded-[calc(2rem-0.375rem)] p-8 md:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]">
              {/* District Select */}
              <div className="mb-8">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-[#8E8E93] mb-3">
                  地点
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-transparent text-[#1A1A1A] text-lg py-2 border-b border-black/[0.06] focus:outline-none focus:border-black/[0.15] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] appearance-none cursor-pointer"
                >
                  <option value="seongsu">首尔 · 圣水洞</option>
                </select>
              </div>

              {/* Theme Select */}
              <div className="mb-10">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-[#8E8E93] mb-4">
                  路线主题
                </label>
                <div className="flex flex-wrap gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value)}
                      className={`px-5 py-2.5 rounded-full text-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
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

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-full bg-[#1A1A1A] text-white px-6 py-3.5 text-sm font-medium
                  hover:bg-[#2A2A2A] active:scale-[0.98]
                  transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {loading ? "生成中…" : "生成路线"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-6 text-sm text-[#FF3B30] text-center">{error}</p>
          )}
        </div>
      </section>

      {/* ── Route Result ── */}
      {result?.route && (
        <section className="px-6 pb-32 md:pb-40">
          <div className="mx-auto max-w-prose">
            {/* Section eyebrow */}
            <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#8E8E93] mb-8">
              路线
            </p>

            {/* Route Title */}
            <h2 className="text-[28px] font-light text-[#1A1A1A] tracking-[-0.01em] mb-2">
              {result.route.title}
            </h2>
            <p className="text-sm text-[#8E8E93] mb-10">
              全程约 {result.route.totalDurationMin} 分钟 · 步行 {result.route.totalWalkMin} 分钟
            </p>

            {/* Narrative */}
            <div className="bg-[#0A0A0A] rounded-[2rem] p-8 md:p-10 mb-10">
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
                {result.route.narrative}
              </p>
            </div>

            {/* Timeline Stops */}
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-black/[0.06]" />

              <ul className="space-y-10">
                {result.route.stops.map((stop) => (
                  <li key={stop.poi.id} className="relative">
                    {/* Dot */}
                    <div className="absolute -left-[22px] top-1.5 w-2 h-2 rounded-full bg-[#1A1A1A]" />

                    {/* Card */}
                    <div className="bg-white ring-1 ring-black/[0.04] rounded-2xl p-5
                      transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#8E8E93] mb-1">
                            {stop.poi.subcategory} · 第 {stop.position} 站
                          </p>
                          <h3 className="text-lg font-regular text-[#1A1A1A]">
                            {stop.poi.name}
                          </h3>
                          <p className="text-sm text-[#8E8E93] mt-1">
                            {stop.transitFromStation}
                          </p>
                        </div>
                      </div>
                      {stop.poi.description && (
                        <p className="mt-3 text-sm text-[#8E8E93] leading-relaxed">
                          {stop.poi.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <p className="mt-16 text-[10px] uppercase tracking-[0.2em] font-medium text-[#C7C7CC] text-center">
              Voyage · 路线由 AI 生成，仅供参考
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
