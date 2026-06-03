"use client";

import { useState, useCallback, useRef, useEffect, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type SetupStep = {
  id: string;
  question: string;
  placeholder: string;
  hint?: string;
};

interface AppleSetupProps {
  steps: SetupStep[];
  onComplete: (answers: Record<string, string>) => void;
  accentColor: string;
}

export function AppleSetup({ steps, onComplete, accentColor }: AppleSetupProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [value, setValue] = useState("");
  const [direction, setDirection] = useState<1 | -1>(1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentStep]);

  const goNext = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const newAnswers = { ...answers, [steps[currentStep].id]: trimmed };
    setAnswers(newAnswers);
    setValue("");

    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      onComplete(newAnswers);
    }
  }, [value, answers, currentStep, steps, onComplete]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goNext();
    }
  };

  const step = steps[currentStep];

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-8">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step.id}
          custom={direction}
          initial={{ opacity: 0, y: direction * 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: direction * -20 }}
          transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
          className="text-center w-full max-w-md"
        >
          {/* 步骤指示器 */}
          <div className="flex items-center justify-center gap-1.5 mb-10">
            {steps.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: i === currentStep ? 24 : 6,
                  backgroundColor: i <= currentStep ? accentColor : "#E5E5EA",
                }}
              />
            ))}
          </div>

          {/* 问题 */}
          <h2 className="text-2xl md:text-3xl font-semibold text-[#1D1D1F] tracking-[-0.02em] leading-tight mb-8">
            {step.question}
          </h2>

          {/* 输入 */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={step.placeholder}
              className="w-full bg-[#F5F5F7] border-0 rounded-2xl px-5 py-4 text-[17px] text-[#1D1D1F]
                         placeholder:text-[#AEAEB2] outline-none transition-all duration-300
                         focus:bg-white focus:ring-2 focus:shadow-sm text-center"
              style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
            />
            {step.hint && (
              <p className="text-xs text-[#86868B] mt-3 text-center">{step.hint}</p>
            )}
          </div>

          {/* 确认按钮 */}
          <button
            onClick={goNext}
            disabled={!value.trim()}
            className="mt-8 px-8 py-3 rounded-full text-white text-[15px] font-medium
                       transition-all duration-300 active:scale-95
                       disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            {currentStep < steps.length - 1 ? "继续" : "开始规划"}
          </button>
        </motion.div>
      </AnimatePresence>

      {/* 进度 */}
      <p className="text-xs text-[#AEAEB2] mt-12">
        {currentStep + 1} / {steps.length}
      </p>
    </div>
  );
}
