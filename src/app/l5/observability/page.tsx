"use client"

import { useState } from "react"
import useSWR from "swr"
import { BarChart3, FileSearch, GitFork, Target } from "lucide-react"
import type { ObservabilityResponse, MetricsData, LogsData, TraceData, SloData } from "@/types/factory"
import { MetricsChart } from "@/components/sre/MetricsChart"
import { LogViewer } from "@/components/sre/LogViewer"
import { TraceViewer } from "@/components/sre/TraceViewer"
import { SliSloCard } from "@/components/sre/SliSloCard"
import { Skeleton } from "@/components/ui/skeleton"

type Tab = "metrics" | "logs" | "traces" | "slo"

const tabs: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
  { key: "metrics", label: "Metrics 指标", icon: BarChart3 },
  { key: "logs", label: "Logs 日志", icon: FileSearch },
  { key: "traces", label: "Traces 追踪", icon: GitFork },
  { key: "slo", label: "SLI/SLO", icon: Target },
]

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-[300px] rounded-xl" />
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
      {message}
    </div>
  )
}

export default function ObservabilityPage() {
  const [activeTab, setActiveTab] = useState<Tab>("metrics")

  const { data, isLoading, error } = useSWR<ObservabilityResponse>(
    `/api/v1/sre/observability/${activeTab}`,
    fetcher,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">可观测数据仪表盘</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Metrics · Logs · Traces · SLI/SLO — 四维运维观测
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 rounded-lg bg-muted p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content area */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message="加载观测数据失败，请重试。" />
      ) : data ? (
        <div>
          {activeTab === "metrics" && <MetricsChart metrics={(data.data as MetricsData).metrics} />}
          {activeTab === "logs" && <LogViewer logs={(data.data as LogsData).logs} />}
          {activeTab === "traces" && <TraceViewer trace={data.data as TraceData} />}
          {activeTab === "slo" && <SliSloCard data={data.data as SloData} />}
        </div>
      ) : null}
    </div>
  )
}
