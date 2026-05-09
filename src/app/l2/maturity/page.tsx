"use client"

import { FileText, Clock } from "lucide-react"

export default function MaturityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="size-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">成熟度评审</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Spec 完整性与质量评审，支持自动化检查与评分
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm p-12 text-center">
        <Clock className="size-12 text-muted-foreground/20 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">成熟度评审功能即将上线</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          将支持四维度评分：完整性、可测试性、一致性、清晰度
        </p>
      </div>
    </div>
  )
}
