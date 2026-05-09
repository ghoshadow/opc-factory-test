"use client"

import { cn } from "@/lib/utils"

export interface KanbanItem {
  id: string
  title: string
  status: string
  priority?: "high" | "medium" | "low"
}

interface KanbanColumn {
  id: string
  label: string
  items: KanbanItem[]
}

interface KanbanBoardProps {
  columns: KanbanColumn[]
  className?: string
}

const priorityBadge: Record<string, { label: string; className: string }> = {
  high: { label: "高", className: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" },
  medium: { label: "中", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400" },
  low: { label: "低", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
}

export function KanbanBoard({ columns, className }: KanbanBoardProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {columns.map((col) => (
        <div
          key={col.id}
          className="rounded-lg border border-border bg-card p-3"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{col.label}</h3>
            <span className="rounded-full bg-muted px-2 py-px text-xs text-muted-foreground">
              {col.items.length}
            </span>
          </div>
          <div className="space-y-2">
            {col.items.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-border bg-background p-2 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium leading-tight">{item.title}</span>
                  {item.priority && priorityBadge[item.priority] && (
                    <span
                      className={cn(
                        "shrink-0 rounded px-1.5 py-px text-[10px] font-medium",
                        priorityBadge[item.priority].className,
                      )}
                    >
                      {priorityBadge[item.priority].label}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">{item.id}</div>
              </div>
            ))}
            {col.items.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground/50">暂无条目</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
