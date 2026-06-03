import type { Message, ChatOption } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  onOptionClick?: (option: ChatOption) => void;
}

export function MessageBubble({ message, onOptionClick }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      style={{ animation: "message-in 0.35s cubic-bezier(0.4,0,0.2,1) both" }}
    >
      <div className={`max-w-[80%]`}>
        {isUser ? (
          /* 用户消息 — iOS 蓝 */
          <div className="bg-[#007AFF] text-white px-4 py-2.5 rounded-[18px] rounded-br-[6px] shadow-sm">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          /* AI 消息 */
          <div>
            <div className="bg-white/65 backdrop-blur-xl border border-black/[0.06] rounded-[18px] rounded-bl-[6px] px-4 py-3 shadow-sm">
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-[#2D221E]">
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
                    className="bg-white/70 backdrop-blur-lg border border-black/5 rounded-2xl p-3.5 text-left
                               transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-black/10
                               active:scale-[0.98] cursor-pointer"
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    <p className="text-[14px] font-medium text-[#2D221E] mt-1.5">{opt.label}</p>
                    {opt.description && (
                      <p className="text-xs text-[#B8A99A] mt-0.5">{opt.description}</p>
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
