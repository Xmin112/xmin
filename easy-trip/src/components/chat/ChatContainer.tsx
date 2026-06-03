"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Message, ChatOption, ChatStage } from "@/types/chat";
import type { Place } from "@/types/place";
import type { Route } from "@/types/place";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { RouteCard } from "./RouteCard";

/** 生成唯一消息 ID */
function msgId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 初始欢迎消息 */
const WELCOME_MSG: Message = {
  id: "welcome",
  role: "assistant",
  content: "嗨！我是小E，你的旅行路线规划师 🌍\n\n今天想去哪儿玩？或者如果你有几天的时间，也可以告诉我，我帮你安排～",
  timestamp: Date.now(),
  options: [
    { id: "single", label: "单日规划", emoji: "📍", description: "某个区域深度游" },
    { id: "multi", label: "多日行程", emoji: "🗓️", description: "3-7天城市攻略" },
  ],
};

interface ChatContainerProps {
  onRouteGenerated?: (route: Route) => void;
}

export function ChatContainer({ onRouteGenerated }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [stage, setStage] = useState<ChatStage>("greeting");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  /** 发送消息 */
  const handleSend = useCallback(async (text: string) => {
    // 添加用户消息
    const userMsg: Message = {
      id: msgId(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setStage("searching");

    try {
      // 构造发送历史
      const history = [...messages, userMsg]
        .filter((m) => m.id !== "welcome" || m === userMsg)
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) throw new Error(`API 错误: ${res.status}`);

      const data = await res.json();

      // 添加 AI 回复
      const aiMsg: Message = {
        id: msgId(),
        role: "assistant",
        content: data.reply ?? "嗯...出了点问题，再说一次？",
        options: data.options,
        route: data.route,
        tripPlan: data.tripPlan,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setStage(data.stage ?? "done");

      // 通知外部地图更新
      if (data.route && onRouteGenerated) {
        onRouteGenerated(data.route);
      }
    } catch (err) {
      const aiMsg: Message = {
        id: msgId(),
        role: "assistant",
        content: "抱歉，我这边出了点问题 😢\n可能是网络或 API 的问题，稍等再试一次？",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setStage("done");
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  /** 点击选项卡片 */
  const handleOptionClick = useCallback(async (option: ChatOption) => {
    // 把选项文字当作用户消息发送
    await handleSend(option.label);
  }, [handleSend]);

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4"
      >
        {messages.map((msg) => (
          <div key={msg.id}>
            <MessageBubble
              message={msg}
              onOptionClick={handleOptionClick}
            />
            {/* 路线卡片 */}
            {msg.route && (
              <RouteCard route={msg.route} />
            )}
          </div>
        ))}

        {/* AI 思考中动画 */}
        {isLoading && (
          <div className="mb-4 ml-2">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-black/5 rounded-2xl px-4 py-2.5 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF6B6B] animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-[#FF6B6B] animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-[#FF6B6B] animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-xs text-[#B8A99A]">
                {stage === "searching" ? "小E正在帮你搜罗好地方..." : "小E思考中..."}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 输入栏 */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
