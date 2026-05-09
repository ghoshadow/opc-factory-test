"use client"

import { AlertTriangle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface Alert {
  id: string
  type: "warning" | "error" | "info"
  message: string
  source: string
  timestamp: string
}

interface AlertListProps {
  alerts: Alert[]
}

const typeConfig: Record<Alert["type"], { icon: typeof AlertTriangle; label: string; color: string; bg: string }> = {
  warning: {
    icon: AlertTriangle,
    label: "警告",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  error: {
    icon: AlertCircle,
    label: "错误",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
  },
  info: {
    icon: Info,
    label: "信息",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "刚刚"
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

export function AlertList({ alerts }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">告警列表</h3>
        <p className="mt-4 text-sm text-muted-foreground text-center">暂无告警</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">告警列表</h3>
        <span className="text-xs text-muted-foreground tabular-nums">{alerts.length} 条</span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const cfg = typeConfig[alert.type]
          const Icon = cfg.icon

          return (
            <div
              key={alert.id}
              className="flex items-start gap-3 rounded-lg border p-3 text-sm"
            >
              <span className={cn("mt-0.5 flex-shrink-0", cfg.color)}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-foreground leading-snug">{alert.message}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={cn("rounded px-1.5 py-0.5 font-medium", cfg.bg, cfg.color)}>
                    {cfg.label}
                  </span>
                  <span>{alert.source}</span>
                  <span>{relativeTime(alert.timestamp)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
