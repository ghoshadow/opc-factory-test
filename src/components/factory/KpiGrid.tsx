"use client"

import { MetricCard } from "@/components/ui/MetricCard"
import useSWR from "swr"

interface Alert {
  id: string
  type: "warning" | "error" | "info"
  message: string
  source: string
  timestamp: string
}

interface KpiData {
  totalWip: number
  totalCompleted: number
  attentionLines: number
  activeRequirements: number
  pendingReviews: number
  todayDeployments: number
  systemHealth: number
}

interface MetricsResponse {
  timestamp: string
  kpi: KpiData
  alerts: Alert[]
  lines: unknown[]
}

const fetcher = (url: string): Promise<MetricsResponse> =>
  fetch(url).then((res) => res.json())

export function KpiGrid() {
  const { data, error, isLoading } = useSWR<MetricsResponse>(
    "/api/v1/factory/metrics",
    fetcher,
    { refreshInterval: 5000 }
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-[120px] rounded-xl bg-muted animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
        Failed to load metrics. Please try again.
      </div>
    )
  }

  const { kpi } = data

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricCard
        label="在制总量"
        value={kpi.totalWip}
        unit="项"
      />
      <MetricCard
        label="已完成总量"
        value={kpi.totalCompleted}
        unit="项"
      />
      <MetricCard
        label="需关注产线"
        value={kpi.attentionLines}
        unit="条"
      />
      <MetricCard
        label="活跃需求"
        value={kpi.activeRequirements}
        unit="项"
      />
      <MetricCard
        label="待评审"
        value={kpi.pendingReviews}
        unit="项"
      />
      <MetricCard
        label="今日部署"
        value={kpi.todayDeployments}
        unit="次"
      />
      <MetricCard
        label="系统健康度"
        value={`${kpi.systemHealth}%`}
      />
    </div>
  )
}
