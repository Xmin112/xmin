import { ChatContainer } from "@/components/chat/ChatContainer";

export default function Home() {
  return (
    <div className="h-full flex flex-col relative z-[1]">
      {/* 顶部导航 — 极简品牌栏 */}
      <header className="flex-shrink-0 glass border-b border-white/5 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🏝️</span>
          <span className="text-sm font-semibold text-text-primary tracking-tight">
            Easy Trip
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-text-muted bg-white/[0.04] px-2 py-0.5 rounded-full">
            Beta
          </span>
        </div>
      </header>

      {/* 主区域 — Bento Grid 双栏 */}
      <main className="flex-1 flex min-h-0">
        {/* 左栏：聊天区 */}
        <div className="flex-1 min-w-0 flex flex-col lg:border-r border-white/5">
          <ChatContainer />
        </div>

        {/* 右栏：地图预览区（桌面端可见） */}
        <aside className="hidden lg:flex w-[40%] flex-col items-center justify-center p-6 relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] via-transparent to-accent-purple/[0.03]" />

          {/* 空状态 */}
          <div className="relative z-[1] text-center max-w-xs">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl glass-elevated flex items-center justify-center">
              <span className="text-4xl">🗺️</span>
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              路线将会出现在这里
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              跟小E聊完，你的手绘风格路线图会在右边实时显示
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
