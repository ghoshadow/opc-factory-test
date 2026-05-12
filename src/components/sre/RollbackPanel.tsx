"use client"

import useSWR from "swr"
import { RotateCcw, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import type { RollbackResponse, RollbackTarget, RollbackReadiness } from "@/types/factory"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string): Promise<RollbackResponse> =>
  fetch(url).then((res) => res.json())

const readinessConfig: Record<RollbackReadiness, { icon: typeof CheckCircle2; label: string; className: string; cardBorder: string }> = {
  ready: {
    icon: CheckCircle2,
    label: "就绪",
    className: "text-emerald-500",
    cardBorder: "border-emerald-200 dark:border-emerald-800",
  },
  preparing: {
    icon: Clock,
    label: "准备中",
    className: "text-amber-500",
    cardBorder: "border-amber-200 dark:border-amber-800",
  },
  not_ready: {
    icon: AlertTriangle,
    label: "未就绪",
    className: "text-red-500",
    cardBorder: "border-red-200 dark:border-red-800",
  },
}

export function RollbackPanel() {
  const { data, error, isLoading } = useSWR<RollbackResponse>(
    "/api/v1/sre/rollback",
    fetcher,
    { refreshInterval: 30000 }
  )

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-7 w-40" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <RotateCcw className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取回滚数据，请稍后重试</p>
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
          <RotateCcw className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">回滚预案</h2>
            <p className="text-xs text-muted-foreground">服务回滚准备状态</p>
          </div>
        </div>
        <div className="text-sm tabular-nums">
          <CheckCircle2 className="size-4 text-emerald-500 inline mr-1" />
          <span className="text-emerald-600 font-semibold">{data.readyCount}</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold">{data.total}</span>
          <span className="text-muted-foreground ml-1">就绪</span>
        </div>
      </div>

      <div className="space-y-3">
        {data.targets.map((t) => {
          const cfg = readinessConfig[t.readiness]
          const Icon = cfg.icon
          return (
            <div
              key={t.id}
              className={`rounded-lg border bg-card p-4 ${cfg.cardBorder}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{t.service}</span>
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${cfg.className === "text-emerald-500" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : cfg.className === "text-amber-500" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"}`}>
                      <Icon className="size-3" />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <span className="font-mono">{t.currentVersion}</span>
                      <span className="text-muted-foreground/50">→</span>
                      <span className="font-mono">{t.targetVersion}</span>
                    </span>
                    <span>停机预估: {t.estimatedDowntime}</span>
                    <span>
                      验证于 {new Date(t.lastValidated).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
