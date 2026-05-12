"use client"

import useSWR from "swr"
import {
  RefreshCw,
  Factory,
  FileText,
  GitPullRequest,
  Rocket,
  Activity,
  CheckCircle2,
} from "lucide-react"
import { MetricCard } from "@/components/ui/MetricCard"
import { WipStats } from "@/components/factory/WipStats"
import { LineStatusGrid } from "@/components/factory/LineStatusGrid"
import { AlertList } from "@/components/dashboard/alert-list"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { RefreshTimestamp } from "@/components/dashboard/refresh-timestamp"
import type { FactoryMetrics } from "@/app/api/v1/factory/metrics/route"
import type { ProductionLine } from "@/lib/types"

interface LineStatusResponse {
  data: ProductionLine[]
  updatedAt: string
}

interface Alert {
  id: string
  type: "warning" | "error" | "info"
  message: string
  source: string
  timestamp: string
}

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const {
    data: metricsData,
    error: metricsError,
    isLoading: metricsLoading,
  } = useSWR<FactoryMetrics>("/api/v1/factory/metrics", fetcher, {
    refreshInterval: 10000,
  })

  const {
    data: lineStatusData,
    error: lineStatusError,
    isLoading: lineStatusLoading,
    isValidating: lineStatusValidating,
    mutate: mutateLineStatus,
  } = useSWR<LineStatusResponse>("/api/v1/factory/line-status", fetcher, {
    refreshInterval: 10000,
  })

  const isLoading = metricsLoading || lineStatusLoading

  if (isLoading) {
    return <DashboardSkeleton />
  }

  const error = metricsError || lineStatusError
  if (error || !metricsData || !lineStatusData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-8 text-center max-w-md">
          <p className="text-sm font-medium text-destructive">
            加载工厂数据失败
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {error instanceof Error ? error.message : "无法连接到数据服务"}
          </p>
          <button
            type="button"
            onClick={() => mutateLineStatus()}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RefreshCw className="size-4" />
            重试
          </button>
        </div>
      </div>
    )
  }

  const { data: lines, updatedAt: timestamp } = lineStatusData
  const attentionCount = lines.filter((l) => l.status === "ATTENTION").length
  const totalCompleted = lines.reduce((sum, l) => sum + l.completed, 0)
  const totalWip = lines.reduce((sum, l) => sum + l.wip, 0)
  const systemHealth =
    attentionCount === 0
      ? 100
      : attentionCount === 1
        ? 75
        : attentionCount === 2
          ? 50
          : 25

  const systemHealthTrend =
    systemHealth >= 75
      ? ("up" as const)
      : systemHealth >= 50
        ? ("stable" as const)
        : ("down" as const)

  const systemHealthLabel =
    systemHealth >= 75 ? "良好" : systemHealth >= 50 ? "一般" : "需关注"

  const attentionTrend =
    attentionCount > 0 ? ("down" as const) : ("stable" as const)
  const attentionLabel = attentionCount > 0 ? "需处理" : "全部正常"

  const alerts: Alert[] = lines
    .filter((l) => l.status === "ATTENTION")
    .map((l) => ({
      id: l.id,
      type: "warning" as const,
      message: `${l.name} 需要关注${l.anomaly && l.anomaly !== "—" ? `: ${l.anomaly}` : ""}`,
      source: l.opc,
      timestamp,
    }))

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">工厂总览</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          4 条产线的实时状态与关键指标
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <MetricCard
          label="在制总量"
          value={totalWip}
          unit="项"
          icon={Factory}
        />
        <MetricCard
          label="已完成总量"
          value={totalCompleted}
          unit="项"
          icon={CheckCircle2}
        />
        <MetricCard
          label="需关注产线"
          value={attentionCount}
          unit="条"
          icon={Activity}
          trend={attentionTrend}
          trendValue={attentionLabel}
        />
        <MetricCard
          label="活跃需求"
          value={metricsData.activeLines.count}
          unit="条"
          icon={FileText}
        />
        <MetricCard
          label="待评审"
          value={metricsData.opcInterventions.value}
          unit="项"
          icon={GitPullRequest}
        />
        <MetricCard
          label="今日部署"
          value={metricsData.throughput.value}
          unit="次"
          icon={Rocket}
        />
        <MetricCard
          label="系统健康度"
          value={`${systemHealth}%`}
          icon={Activity}
          trend={systemHealthTrend}
          trendValue={systemHealthLabel}
        />
      </div>

      {/* WIP + Alerts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <WipStats />
        </div>
        <div className="lg:col-span-2">
          <AlertList alerts={alerts} />
        </div>
      </div>

      {/* Line status grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          产线状态
        </h2>
        <LineStatusGrid lines={lines} />
      </div>

      {/* Refresh timestamp */}
      <div className="flex justify-end">
        <RefreshTimestamp
          timestamp={timestamp}
          onRefresh={() => mutateLineStatus()}
          isLoading={lineStatusValidating}
        />
      </div>
    </div>
  )
}
