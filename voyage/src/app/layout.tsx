import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voyage",
  description: "沉浸式旅行探索体验",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="h-full">{children}</body>
    </html>
  );
}
