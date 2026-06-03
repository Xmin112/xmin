import type { Message, ChatOption } from "@/types/chat";
import { GlassCard } from "@/components/ui/GlassCard";

interface MessageBubbleProps {
  message: Message;
  onOptionClick?: (option: ChatOption) => void;
}

/** 聊天气泡 */
export function MessageBubble({ message, onOptionClick }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-[message-in_0.3s_ease-out]`}
      style={{
        animation: "message-in 0.3s ease-out",
      }}
    >
      <div className={`max-w-[80%] ${isUser ? "order-1" : "order-1"}`}>
        {/* 用户气泡 —— accent 色底 */}
        {isUser && (
          <div className="bg-accent text-white px-4 py-2.5 rounded-2xl rounded-br-md">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        )}

        {/* AI 气泡 —— 玻璃卡片 */}
        {!isUser && (
          <div>
            <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-text-primary">
                {message.content}
              </p>
            </div>

            {/* 选项卡片 */}
            {message.options && message.options.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {message.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onOptionClick?.(opt)}
                    className="glass text-left p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-white/15 hover:bg-white/[0.06]"
                  >
                    <span className="text-lg">{opt.emoji}</span>
                    <p className="text-sm font-medium text-text-primary mt-1">
                      {opt.label}
                    </p>
                    {opt.description && (
                      <p className="text-xs text-text-muted mt-0.5">
                        {opt.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
