"use client"

import { RefactorPanel } from "@/components/coding/RefactorPanel"

export default function RefactorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">安全重构</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Brownfield 模式 · 重构计划 · 影响分析 · 测试覆盖率
        </p>
      </div>
      <RefactorPanel />
    </div>
  )
}
