"use client"

import { useState } from "react"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import type { AlertData, AlertLevel, AlertRoute } from "@/types/factory"

const fetcher = (url: string): Promise<AlertData[]> =>
  fetch(url).then((res) => res.json())

const levelConfig: Record<AlertLevel, { label: string; className: string }> = {
  urgent: {
    label: "紧急",
    className: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
  warning: {
    label: "警告",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
}

const routeConfig: Record<AlertRoute, { className: string }> = {
  "值班": {
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  "OPC": {
    className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400",
  },
  "自动处置": {
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function AlertItem({ data }: { data: AlertData }) {
  const [expanded, setExpanded] = useState(false)
  const level = levelConfig[data.level]
  const route = routeConfig[data.route]

  return (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      className="w-full text-left"
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50",
          expanded ? "bg-muted/30 border-ring/50" : "border-border"
        )}
      >
        <span className="font-mono text-xs font-semibold text-muted-foreground shrink-0 w-16">
          {data.id}
        </span>
        <span className="flex-1 text-sm text-foreground truncate min-w-0">
          {data.description}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
            level.className
          )}
        >
          {data.level === "urgent" && (
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 rounded-full bg-red-500" />
              <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-75" />
            </span>
          )}
          {level.label}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
            route.className
          )}
        >
          {data.route}
        </span>
        <span className="text-xs text-muted-foreground shrink-0 w-20 text-right tabular-nums">
          {formatTime(data.time)}
        </span>
      </div>
      {expanded && (
        <div className="mx-4 -mt-px rounded-b-lg border border-t-0 border-ring/50 bg-muted/20 px-4 py-3 space-y-1.5">
          <div className="flex gap-2 text-sm">
            <span className="text-muted-foreground">目标:</span>
            <span className="font-medium text-foreground">{data.target}</span>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-muted-foreground">时间:</span>
            <span className="text-foreground">
              {new Date(data.time).toLocaleString("zh-CN")}
            </span>
          </div>
        </div>
      )}
    </button>
  )
}

export function AlertList() {
  const { data, error, isLoading } = useSWR<AlertData[]>(
    "/api/v1/factory/alerts",
    fetcher,
    { refreshInterval: 10000 }
  )

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-3">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Failed to load alerts</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">暂无告警</p>
      </div>
    )
  }

  // Sort: urgent first, then by time descending
  const sorted = [...data].sort((a, b) => {
    if (a.level !== b.level) return a.level === "urgent" ? -1 : 1
    return new Date(b.time).getTime() - new Date(a.time).getTime()
  })

  const urgentCount = data.filter((a) => a.level === "urgent").length
  const warningCount = data.filter((a) => a.level === "warning").length

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">告警与阻塞通知</h3>
        <div className="flex items-center gap-2 text-xs">
          {urgentCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
              {urgentCount} 紧急
            </span>
          )}
          {warningCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              {warningCount} 警告
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((alert) => (
          <AlertItem key={alert.id} data={alert} />
        ))}
      </div>
    </div>
  )
}
