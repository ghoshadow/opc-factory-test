"use client"

import useSWR from "swr"
import { Bell, BellRing, AlertTriangle, Info } from "lucide-react"
import type { AlertsResponse, AlertRule, AlertSeverity } from "@/types/factory"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string): Promise<AlertsResponse> =>
  fetch(url).then((res) => res.json())

const severityConfig: Record<AlertSeverity, { icon: typeof Bell; className: string; badgeClass: string }> = {
  critical: { icon: BellRing, className: "text-red-500", badgeClass: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" },
  warning: { icon: AlertTriangle, className: "text-amber-500", badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
  info: { icon: Info, className: "text-blue-500", badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
}

export function AlertRulesPanel() {
  const { data, error, isLoading } = useSWR<AlertsResponse>(
    "/api/v1/sre/alerts",
    fetcher,
    { refreshInterval: 30000 }
  )

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-7 w-40" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <Bell className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取告警规则，请稍后重试</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">告警规则</h2>
            <p className="text-xs text-muted-foreground">监控告警配置与状态</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm tabular-nums">
          <BellRing className="size-4 text-red-500" />
          <span className="text-red-600 font-semibold">{data.firingCount}</span>
          <span className="text-muted-foreground">告警中</span>
        </div>
      </div>

      <div className="space-y-2">
        {data.rules.map((rule) => {
          const cfg = severityConfig[rule.severity]
          const Icon = cfg.icon
          return (
            <div
              key={rule.id}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                rule.status === "firing"
                  ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/10"
                  : "border-border bg-muted/30"
              }`}
            >
              <Icon className={`size-4 mt-0.5 shrink-0 ${cfg.className}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{rule.name}</span>
                  <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${cfg.badgeClass}`}>
                    {rule.severity === "critical" ? "严重" : rule.severity === "warning" ? "警告" : "信息"}
                  </span>
                  {rule.status === "firing" && (
                    <span className="inline-flex items-center gap-1 rounded bg-red-100 dark:bg-red-950/60 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
                      <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                      告警中
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>阈值: {rule.threshold}</span>
                  <span>当前: {rule.currentValue}</span>
                  <span>来源: {rule.source}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
