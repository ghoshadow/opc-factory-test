"use client"

import useSWR from "swr"
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { ObservabilityResponse, MetricSeries } from "@/types/factory"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string): Promise<ObservabilityResponse> =>
  fetch(url).then((res) => res.json())

function TrendIcon({ trend }: { trend: MetricSeries["trend"] }) {
  switch (trend) {
    case "up":
      return <TrendingUp className="size-3 text-red-500" />
    case "down":
      return <TrendingDown className="size-3 text-emerald-500" />
    case "stable":
      return <Minus className="size-3 text-muted-foreground" />
  }
}

function trendColor(trend: MetricSeries["trend"]): string {
  switch (trend) {
    case "up":
      return "text-red-600 bg-red-50 dark:bg-red-950/30"
    case "down":
      return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
    case "stable":
      return "text-muted-foreground bg-muted"
  }
}

export function ObservabilityPanel() {
  const { data, error, isLoading } = useSWR<ObservabilityResponse>(
    "/api/v1/sre/observability",
    fetcher,
    { refreshInterval: 30000 }
  )

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取可观测性指标，请稍后重试</p>
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
          <BarChart3 className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">可观测性</h2>
            <p className="text-xs text-muted-foreground">关键监控指标</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          更新于 {new Date(data.lastUpdated).toLocaleTimeString("zh-CN")}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {data.metrics.map((m) => (
          <div
            key={m.name}
            className="rounded-lg border border-border bg-muted/30 p-4 space-y-2"
          >
            <p className="text-xs text-muted-foreground font-medium">{m.name}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold tabular-nums">{m.value}</span>
              <span className="text-xs text-muted-foreground">{m.unit}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendIcon trend={m.trend} />
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${trendColor(m.trend)}`}>
                {m.changePercent > 0 ? "+" : ""}{m.changePercent}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
