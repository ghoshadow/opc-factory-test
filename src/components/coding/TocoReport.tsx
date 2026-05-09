"use client"

import useSWR from "swr"
import { Check, X, AlertTriangle, GitBranch, ArrowRight } from "lucide-react"
import type { TocoReportResponse, TocoCheckItem, CheckerItemStatus, TocoLoopAction } from "@/types/factory"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string): Promise<TocoReportResponse> =>
  fetch(url).then((res) => res.json())

const statusConfig: Record<CheckerItemStatus, { icon: typeof Check; label: string; cardBorder: string; badgeClass: string; iconClass: string }> = {
  pass: {
    icon: Check,
    label: "通过",
    cardBorder: "border-emerald-200 dark:border-emerald-800",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    iconClass: "text-emerald-500",
  },
  fail: {
    icon: X,
    label: "未通过",
    cardBorder: "border-red-200 dark:border-red-800",
    badgeClass: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    iconClass: "text-red-500",
  },
  warning: {
    icon: AlertTriangle,
    label: "警告",
    cardBorder: "border-amber-200 dark:border-amber-800",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    iconClass: "text-amber-500",
  },
}

const loopConfig: Record<TocoLoopAction, { bgClass: string; borderClass: string; textClass: string; descClass: string }> = {
  checker: {
    bgClass: "bg-emerald-50 dark:bg-emerald-950/20",
    borderClass: "border-emerald-200 dark:border-emerald-800",
    textClass: "text-emerald-700 dark:text-emerald-400",
    descClass: "text-emerald-600/70 dark:text-emerald-400/70",
  },
  developer: {
    bgClass: "bg-amber-50 dark:bg-amber-950/20",
    borderClass: "border-amber-200 dark:border-amber-800",
    textClass: "text-amber-700 dark:text-amber-400",
    descClass: "text-amber-600/70 dark:text-amber-400/70",
  },
  designer: {
    bgClass: "bg-red-50 dark:bg-red-950/20",
    borderClass: "border-red-200 dark:border-red-800",
    textClass: "text-red-700 dark:text-red-400",
    descClass: "text-red-600/70 dark:text-red-400/70",
  },
}

function CheckItemCard({ item }: { item: TocoCheckItem }) {
  const cfg = statusConfig[item.status]
  const Icon = cfg.icon

  return (
    <div className={`rounded-xl border bg-card p-5 shadow-sm ${cfg.cardBorder}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 rounded-full p-1 ${cfg.badgeClass}`}>
          <Icon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold">{item.name}</h3>
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${cfg.badgeClass}`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
          <p className="text-sm mt-2 leading-relaxed">{item.detail}</p>
        </div>
      </div>
    </div>
  )
}

export function TocoReport() {
  const { data, error, isLoading } = useSWR<TocoReportResponse>(
    "/api/v1/coding/toco-report/default",
    fetcher,
    { refreshInterval: 30000 }
  )

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <GitBranch className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取 Toco 检查报告数据，请稍后重试</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const passCount = data.items.filter((i) => i.status === "pass").length
  const failCount = data.items.filter((i) => i.status === "fail").length
  const warnCount = data.items.filter((i) => i.status === "warning").length
  const loopCfg = loopConfig[data.loopAction]

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">TocoAgent 检查报告</h2>
            <p className="text-xs text-muted-foreground">编码产线 · 四项检查</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm tabular-nums">
          <span className="text-emerald-600 font-semibold">{passCount}</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold">{data.items.length}</span>
          <span className="text-muted-foreground ml-1">项通过</span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-emerald-500" />
          {passCount} 通过
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-amber-500" />
          {warnCount} 警告
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-red-500" />
          {failCount} 未通过
        </span>
      </div>

      {/* Check cards */}
      <div className="space-y-3">
        {data.items.map((item) => (
          <CheckItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* Loop recommendation */}
      <div className={`rounded-lg border p-4 ${loopCfg.borderClass} ${loopCfg.bgClass}`}>
        <div className="flex items-center gap-2">
          {data.loopAction === "checker" ? (
            <Check className="size-5 text-emerald-600" />
          ) : data.loopAction === "developer" ? (
            <AlertTriangle className="size-5 text-amber-600" />
          ) : (
            <X className="size-5 text-red-600" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">回路建议</span>
              <span className="text-muted-foreground">
                <ArrowRight className="size-3 inline" />
              </span>
              <span className={`text-sm font-semibold ${loopCfg.textClass}`}>
                {data.loopLabel}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${loopCfg.descClass}`}>
              {data.loopDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
