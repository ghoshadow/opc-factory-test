"use client"

import { KanbanBoard } from "@/components/testing/KanbanBoard"

export default function KanbanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kanban 看板</h1>
        <p className="text-sm text-muted-foreground mt-1">
          通用任务看板，拖拽卡片切换状态
        </p>
      </div>
      <KanbanBoard />
    </div>
  )
}
