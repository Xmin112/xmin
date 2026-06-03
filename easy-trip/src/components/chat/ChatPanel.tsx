"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import type { Message, ChatOption, ChatStage } from "@/types/chat";
import type { Route } from "@/types/place";

interface ChatPanelProps {
  onRouteGenerated: (route: Route, destination?: string) => void;
  accentColor: string;
}

function msgId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "嗨，我是小E 🌍\n今天想去哪儿玩？",
  timestamp: Date.now(),
  options: [
    { id: "single", label: "单日逛逛", emoji: "📍" },
    { id: "multi", label: "多日行程", emoji: "🗓️" },
  ],
};

export function ChatPanel({ onRouteGenerated, accentColor }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<ChatStage>("greeting");
  const [value, setValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: Message = {
      id: msgId(), role: "user", content: text, timestamp: Date.now(),
    };
    setMessages((p) => [...p, userMsg]);
    setIsLoading(true);
    setStage("searching");

    try {
      const history = [...messages, userMsg]
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      const aiMsg: Message = {
        id: msgId(),
        role: "assistant",
        content: data.reply ?? "出了点问题...",
        options: data.options,
        route: data.route,
        timestamp: Date.now(),
      };

      setMessages((p) => [...p, aiMsg]);
      setStage(data.stage ?? "done");

      if (data.route) {
        // 提取目的地
        const dest = extractDestination(userMsg.content, data.reply);
        onRouteGenerated(data.route, dest);
      }
    } catch {
      setMessages((p) => [
        ...p,
        { id: msgId(), role: "assistant", content: "抱歉，出了点问题 😢 稍等再试试？", timestamp: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, onRouteGenerated]);

  const handleSend = useCallback(() => {
    const t = value.trim();
    if (!t || isLoading) return;
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    sendMessage(t);
  }, [value, isLoading, sendMessage]);

  const handleOption = useCallback((opt: ChatOption) => {
    sendMessage(opt.label);
  }, [sendMessage]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 消息列表 — 无气泡，纯文字流 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-5">
        {messages.map((msg) => (
          <div key={msg.id} className="message-in">
            {msg.role === "user" ? (
              /* 用户消息 — 右对齐，accent色 */
              <div className="flex justify-end">
                <p className="text-[15px] text-right leading-relaxed max-w-[75%]"
                   style={{ color: accentColor }}>
                  {msg.content}
                </p>
              </div>
            ) : (
              /* AI 消息 — 左对齐，深色文字 */
              <div>
                <p className="text-[15px] text-[#1D1D1F] leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>

                {/* 选项 — 圆角卡片 */}
                {msg.options && msg.options.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    {msg.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleOption(opt)}
                        className="bg-white/60 backdrop-blur-xl border border-black/5 rounded-2xl p-3.5 text-left
                                   transition-all duration-300 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] cursor-pointer"
                      >
                        <span className="text-lg">{opt.emoji}</span>
                        <p className="text-[14px] font-medium text-[#1D1D1F] mt-1.5">{opt.label}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* 路线结果 */}
                {msg.route && (
                  <div className="mt-4 bg-white/70 backdrop-blur-lg border border-black/5 rounded-2xl p-4">
                    <p className="text-xs text-[#86868B] mb-2">📍 {msg.route.dayLabel}</p>
                    <div className="space-y-1.5">
                      {msg.route.stops.map((s) => (
                        <div key={s.order} className="flex items-center gap-3 text-sm">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                                style={{ backgroundColor: accentColor }}>
                            {s.order}
                          </span>
                          <span className="text-[#1D1D1F]">{s.place.name}</span>
                          <span className="text-[#AEAEB2] text-xs">{s.place.intro}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* loading */}
        {isLoading && (
          <div className="message-in flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: accentColor, animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: accentColor, animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: accentColor, animationDelay: "300ms" }} />
          </div>
        )}
      </div>

      {/* 输入栏 */}
      <div className="flex-shrink-0 px-4 pb-4 pt-1">
        <div className="flex items-end gap-2 bg-white/60 backdrop-blur-xl border border-black/6 rounded-2xl px-4 py-2.5 shadow-sm">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="说说你的想法..."
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent text-[15px] text-[#1D1D1F] placeholder:text-[#AEAEB2] resize-none outline-none max-h-[100px]"
            onInput={() => {
              if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !value.trim()}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full
                       transition-all duration-200 active:scale-90 disabled:opacity-30 cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

function extractDestination(userMsg: string, reply: string): string | undefined {
  const combined = userMsg + " " + reply;
  const cities = ["首尔", "东京", "大阪", "京都", "巴黎", "伦敦", "纽约", "曼谷", "新加坡", "香港", "上海", "北京", "台北"];
  for (const c of cities) {
    if (combined.includes(c)) return c;
  }
  return undefined;
}
