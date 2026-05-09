"use client"

import useSWR from "swr"
import { Check, X, AlertTriangle, Shield, ExternalLink } from "lucide-react"
import type { ReqCheckerResponse, ReqCheckerItem, CheckerItemStatus } from "@/types/factory"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string): Promise<ReqCheckerResponse> =>
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

function CheckerCard({ item }: { item: ReqCheckerItem }) {
  const cfg = statusConfig[item.status]
  const Icon = cfg.icon

  return (
    <div className={`rounded-xl border bg-card p-5 shadow-sm ${cfg.cardBorder}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
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
            {item.conflicts && item.conflicts.length > 0 && (
              <div className="mt-2 rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">术语冲突详情</p>
                <ul className="space-y-1">
                  {item.conflicts.map((c, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <AlertTriangle className="size-3 text-amber-500 shrink-0" />
                      <span className="font-mono font-medium">{c.term}</span>
                      <span>在</span>
                      <span className="font-mono">{c.specA}</span>
                      <span>与</span>
                      <span className="font-mono">{c.specB}</span>
                      <span>中定义不一致</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      {item.status !== "pass" && item.supplementLabel && (
        <div className="mt-3 pt-3 border-t border-border">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink className="size-3" />
            {item.supplementLabel}
          </button>
        </div>
      )}
    </div>
  )
}

export function ReqCheckerPanel() {
  const { data, error, isLoading } = useSWR<ReqCheckerResponse>(
    "/api/v1/quality/checker/requirement/latest",
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
          <Shield className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取需求 Checker 数据，请稍后重试</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const passCount = data.items.filter((i) => i.status === "pass").length
  const failCount = data.items.filter((i) => i.status === "fail").length
  const warnCount = data.items.filter((i) => i.status === "warning").length

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">需求产线 Checker</h2>
            <p className="text-xs text-muted-foreground">四项检查 · 全部通过才可发布</p>
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
          <CheckerCard key={item.id} item={item} />
        ))}
      </div>

      {/* Gate result */}
      <div
        className={`rounded-lg border p-4 ${
          data.canRelease
            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
        }`}
      >
        {data.canRelease ? (
          <div className="flex items-center gap-2">
            <Check className="size-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                可以发布 — 四项检查全部通过
              </p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                允许推向发布流程
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <X className="size-5 text-red-600" />
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                发布阻断 — 存在未通过的检查项
              </p>
            </div>
            <ul className="text-xs text-red-600/80 dark:text-red-400/80 space-y-0.5 ml-7 list-disc">
              {data.items
                .filter((i) => i.status !== "pass")
                .map((i) => (
                  <li key={i.id}>
                    {i.name}: {i.status === "fail" ? "未通过" : "警告"} — {i.description}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
