import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  onClick?: () => void;
}

/** 毛玻璃卡片 */
export function GlassCard({ children, className = "", elevated = false, onClick }: GlassCardProps) {
  const base = elevated ? "glass-elevated" : "glass";

  return (
    <div
      className={`${base} rounded-2xl ${onClick ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-white/15" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
