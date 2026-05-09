"use client"

import { useState } from "react"
import { MaturityPanel } from "@/components/requirement/MaturityPanel"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function MaturityPage() {
  const [specId, setSpecId] = useState("demo")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">成熟度评审</h1>
        <p className="text-sm text-muted-foreground mt-1">
          需求 Spec 三维度打分面板 — 章节完整度 · 可测性 · 一致性
        </p>
      </div>

      {/* Spec ID input */}
      <div className="flex items-center gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="输入 Spec ID (例如: demo)"
            value={specId}
            onChange={(e) => setSpecId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // trigger re-render by forcing state update
                setSpecId((prev) => prev)
              }
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          输入 "demo" 查看通过示例
        </p>
      </div>

      <div className="max-w-2xl">
        <MaturityPanel key={specId} specId={specId} />
      </div>
    </div>
  )
}
