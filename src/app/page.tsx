"use client"

import useSWR from "swr"
import { LineStatusGrid } from "@/components/factory/LineStatusGrid"
import { MetricCard } from "@/components/ui/MetricCard"
import type { LineStatusData } from "@/types/factory"
import { Factory } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Home() {
  const { data: lines, error, isLoading } = useSWR<LineStatusData[]>(
    "/api/v1/factory/line-status",
    fetcher,
  )

  const totalWip = lines?.reduce((sum, l) => sum + l.wip, 0) ?? 0
  const totalCompleted = lines?.reduce((sum, l) => sum + l.completed, 0) ?? 0
  const attentionCount = lines?.filter((l) => l.status === "ATTENTION").length ?? 0

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="在制总量"
          value={isLoading ? "—" : totalWip}
          unit="项"
          icon={Factory}
        />
        <MetricCard
          label="已完成总量"
          value={isLoading ? "—" : totalCompleted}
          unit="项"
        />
        <MetricCard
          label="需关注产线"
          value={isLoading ? "—" : attentionCount}
          unit="条"
          trend={attentionCount > 0 ? "down" : "stable"}
          trendValue={attentionCount > 0 ? "需处理" : "全部正常"}
        />
      </div>

      {/* Line status cards */}
      {error ? (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">加载产线状态失败，请稍后重试</p>
        </div>
      ) : (
        <LineStatusGrid lines={lines ?? []} />
      )}
    </div>
  )
}
