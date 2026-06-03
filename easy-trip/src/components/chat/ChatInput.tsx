"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="flex items-end gap-2 px-4 py-3">
      <div className="flex-1 bg-white/70 backdrop-blur-xl border border-black/8 rounded-2xl px-4 py-2.5
                      shadow-sm transition-all duration-300 focus-within:bg-white/90 focus-within:shadow-md focus-within:border-black/12">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="说说你的旅行想法..."
          disabled={disabled}
          rows={1}
          className="w-full bg-transparent text-[15px] text-[#2D221E] placeholder:text-[#B8A99A] resize-none outline-none max-h-[120px]"
        />
      </div>

      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full
                   bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/20
                   transition-all duration-200 active:scale-90
                   disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </button>
    </div>
  );
}
