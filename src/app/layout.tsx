import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";

import "./globals.css";

import { Toaster } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OPC Factory",
  description: "自动化软件工程系统 · 4 条 AI Agent 产线",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>
        <AppShell>{children}</AppShell>
        <Toaster richColors />
      </body>
    </html>
  );
}
