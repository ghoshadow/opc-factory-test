"use client"

import useSWR from "swr"
import { Rocket, CheckCircle2, AlertCircle, Loader2, XCircle, RotateCcw } from "lucide-react"
import type { DeployResponse, DeployRecord, DeployStatus } from "@/types/factory"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string): Promise<DeployResponse> =>
  fetch(url).then((res) => res.json())

const statusConfig: Record<DeployStatus, { icon: typeof CheckCircle2; label: string; className: string }> = {
  success: { icon: CheckCircle2, label: "成功", className: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" },
  in_progress: { icon: Loader2, label: "部署中", className: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" },
  failed: { icon: XCircle, label: "失败", className: "text-red-500 bg-red-50 dark:bg-red-950/30" },
  rolled_back: { icon: RotateCcw, label: "已回滚", className: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
}

export function DeployPanel() {
  const { data, error, isLoading } = useSWR<DeployResponse>(
    "/api/v1/sre/deploy",
    fetcher,
    { refreshInterval: 30000 }
  )

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-7 w-40" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <Rocket className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取部署数据，请稍后重试</p>
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
          <Rocket className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">部署状态</h2>
            <p className="text-xs text-muted-foreground">近期部署记录</p>
          </div>
        </div>
        <div className="text-sm tabular-nums">
          <span className="font-semibold text-emerald-600">{data.successRate}%</span>
          <span className="text-muted-foreground ml-1">成功率</span>
        </div>
      </div>

      <div className="space-y-2">
        {data.deploys.map((d) => {
          const cfg = statusConfig[d.status]
          const Icon = cfg.icon
          return (
            <div
              key={d.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3"
            >
              <div className={`shrink-0 rounded-full p-1.5 ${cfg.className}`}>
                <Icon className={`size-3.5 ${d.status === "in_progress" ? "animate-spin" : ""}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{d.service}</span>
                  <span className="text-xs font-mono text-muted-foreground">{d.version}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {d.environment} · {d.triggeredBy} · {d.commitSha.slice(0, 7)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
                  {cfg.label}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums w-16 text-right">
                  {new Date(d.startedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
