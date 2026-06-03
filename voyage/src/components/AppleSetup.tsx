"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";

interface Step {
  id: string; question: string; placeholder: string; hint?: string;
  type: "input" | "select";
  options?: { id: string; label: string; emoji: string }[];
}

const STEPS: Step[] = [
  { id: "destination", question: "你想去哪？", placeholder: "输入城市名称", hint: "例如：首尔、东京、巴黎…", type: "input" },
  { id: "companion", question: "和谁一起去？", placeholder: "一个人 / 情侣 / 闺蜜 / 家人…", type: "input" },
  { id: "style", question: "想去体验什么？", placeholder: "", type: "select", options: [
    { id: "cafe", label: "咖啡探店", emoji: "☕" },
    { id: "shop", label: "逛街购物", emoji: "🛍️" },
    { id: "art", label: "看展打卡", emoji: "🎨" },
    { id: "chill", label: "随缘走走", emoji: "✨" },
  ]},
];

interface Props {
  accentColor: string;
  onComplete: (answers: Record<string, string>) => void;
}

export function AppleSetup({ accentColor, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [value, setValue] = useState("");
  const [exiting, setExiting] = useState(false);
  const [entering, setEntering] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); setEntering(true); }, [step]);

  const advance = useCallback((answer: string) => {
    const newAnswers = { ...answers, [STEPS[step].id]: answer };
    setAnswers(newAnswers);
    setExiting(true);
    setTimeout(() => {
      if (step < STEPS.length - 1) {
        setStep(s => s + 1);
        setValue("");
        setExiting(false);
      } else {
        onComplete(newAnswers);
      }
    }, 350);
  }, [step, answers, onComplete]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      advance(value.trim());
    }
  };

  const current = STEPS[step];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto">
      {/* 进度指示器 */}
      <div className="flex items-center gap-1 mb-12">
        {STEPS.map((_, i) => (
          <div key={i} className="h-[2px] rounded-full transition-all duration-500"
            style={{ width: i <= step ? 16 : 6, backgroundColor: i <= step ? accentColor : "#E5E5EA" }} />
        ))}
      </div>

      <div className={`w-full transition-all duration-350 ${exiting ? "opacity-0 translate-y-[-12px]" : entering ? "opacity-0 translate-y-[16px]" : ""}`}
        style={!exiting && !entering ? {} : {}}
        ref={el => {
          if (el && entering) { el.style.opacity = "0"; el.style.transform = "translateY(16px)";
            requestAnimationFrame(() => { el.style.transition = "all 400ms cubic-bezier(0.4,0,0.2,1)"; el.style.opacity = "1"; el.style.transform = "translateY(0)"; }); }
        }}>
        {/* 问题 */}
        <h2 className="text-[20px] font-medium text-center text-[#1D1D1F] tracking-[-0.02em] mb-8">
          {current.question}
        </h2>

        {current.type === "input" ? (
          <div>
            <input ref={inputRef} type="text" value={value}
              onChange={e => setValue(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={current.placeholder}
              className="w-full bg-transparent border-0 border-b border-[#D1D1D6] pb-2 text-[17px] text-[#1D1D1F]
                         placeholder:text-[#AEAEB2] outline-none text-center transition-colors duration-300
                         focus:border-[#1D1D1F]" />
            {current.hint && <p className="text-[12px] text-[#AEAEB2] mt-3 text-center">{current.hint}</p>}
            <button onClick={() => advance(value.trim())} disabled={!value.trim()}
              className="mt-8 mx-auto block px-8 py-2.5 rounded-full text-white text-[14px] font-medium
                         transition-all duration-300 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              style={{ backgroundColor: accentColor }}>继续</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {current.options!.map(opt => (
              <button key={opt.id} onClick={() => advance(opt.label)}
                className="glass-panel rounded-2xl p-4 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                <span className="text-2xl">{opt.emoji}</span>
                <p className="text-[14px] font-medium text-[#1D1D1F] mt-2">{opt.label}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
