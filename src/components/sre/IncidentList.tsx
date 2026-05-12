"use client"

import useSWR from "swr"
import { Siren, AlertTriangle, Info, Clock, User } from "lucide-react"
import type { IncidentResponse, Incident, AlertSeverity, IncidentStatus } from "@/types/factory"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string): Promise<IncidentResponse> =>
  fetch(url).then((res) => res.json())

const severityIcon: Record<AlertSeverity, typeof Siren> = {
  critical: Siren,
  warning: AlertTriangle,
  info: Info,
}

const severityClass: Record<AlertSeverity, string> = {
  critical: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
}

const statusConfig: Record<IncidentStatus, { label: string; className: string }> = {
  open: { label: "待处理", className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" },
  investigating: { label: "调查中", className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
  mitigated: { label: "已缓解", className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
  resolved: { label: "已解决", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
}

export function IncidentList() {
  const { data, error, isLoading } = useSWR<IncidentResponse>(
    "/api/v1/sre/incidents",
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
          <Siren className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取事件列表，请稍后重试</p>
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
          <Siren className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">事件列表</h2>
            <p className="text-xs text-muted-foreground">近期生产事件</p>
          </div>
        </div>
        <div className="text-sm tabular-nums">
          <Siren className="size-4 text-red-500 inline mr-1" />
          <span className="text-red-600 font-semibold">{data.openCount}</span>
          <span className="text-muted-foreground ml-1">进行中</span>
        </div>
      </div>

      <div className="space-y-2">
        {data.incidents.map((inc) => {
          const Icon = severityIcon[inc.severity]
          const stCfg = statusConfig[inc.status]
          return (
            <div
              key={inc.id}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                inc.status === "open" || inc.status === "investigating"
                  ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/10"
                  : "border-border bg-muted/30"
              }`}
            >
              <Icon className={`size-4 mt-0.5 shrink-0 ${severityClass[inc.severity]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{inc.title}</span>
                  <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${stCfg.className}`}>
                    {stCfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {new Date(inc.openedAt).toLocaleString("zh-CN")}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <User className="size-3" />
                    {inc.owner}
                  </span>
                  <span>{inc.service}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
