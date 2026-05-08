"use client"

import { cn } from "@/lib/utils"
import { useWipStats } from "@/lib/api/factory"

export function WipStats() {
  const { wip, isLoading, isError } = useWipStats()

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-5 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="flex-1 h-6 rounded bg-muted animate-pulse" />
            <div className="h-4 w-8 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (isError || !wip) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
        Failed to load WIP stats. Please try again.
      </div>
    )
  }

  const total = wip.reduce((sum, item) => sum + item.count, 0)
  const maxCount = Math.max(...wip.map((item) => item.count))

  const barColors: Record<string, string> = {
    requirement: "bg-blue-500 dark:bg-blue-400",
    coding: "bg-emerald-500 dark:bg-emerald-400",
    testing: "bg-amber-500 dark:bg-amber-400",
    sre: "bg-violet-500 dark:bg-violet-400",
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <span className="text-2xl font-semibold">{total}</span>
          <span className="ml-1 text-sm text-muted-foreground">件在制品</span>
        </div>
      </div>
      <div className="space-y-3">
        {wip.map((item) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
          const widthPct = maxCount > 0 ? (item.count / maxCount) * 100 : 0

          return (
            <div key={item.lineId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="text-muted-foreground">
                  {item.count} 件 · {pct}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", barColors[item.lineId])}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
