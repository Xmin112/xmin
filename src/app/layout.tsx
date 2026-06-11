import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voyage — 在出发之前，先去一次",
  description: "AI 旅行路线规划，让探索成为体验。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-[100dvh]">{children}</body>
    </html>
  );
}
