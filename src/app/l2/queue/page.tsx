"use client"

import { FileText, Clock } from "lucide-react"

export default function SpecQueuePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="size-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">需求队列</h1>
          <p className="text-sm text-muted-foreground mt-1">
            待处理的需求文档队列与优先级管理
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm p-12 text-center">
        <Clock className="size-12 text-muted-foreground/20 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">需求队列功能即将上线</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          将支持优先级排序、批量签批和产线下发
        </p>
      </div>
    </div>
  )
}
