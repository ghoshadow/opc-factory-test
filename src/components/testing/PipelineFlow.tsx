"use client"

import useSWR from "swr"
import { ArrowRight, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PipelineRun, PipelineStageStatus, TestingOpsResponse } from "@/types/factory"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string): Promise<PipelineRun> =>
  fetch(url).then((res) => res.json()).then((d: TestingOpsResponse) => d.pipeline)

const statusConfig: Record<PipelineStageStatus, { dotColor: string; borderColor: string; bg: string; textColor: string }> = {
  waiting: {
    dotColor: "bg-muted-foreground/40",
    borderColor: "border-muted-foreground/20",
    bg: "bg-muted/50",
    textColor: "text-muted-foreground/60",
  },
  running: {
    dotColor: "bg-blue-500 animate-pulse",
    borderColor: "border-blue-300 dark:border-blue-700",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  done: {
    dotColor: "bg-emerald-500",
    borderColor: "border-emerald-300 dark:border-emerald-700",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  failed: {
    dotColor: "bg-red-500",
    borderColor: "border-red-300 dark:border-red-700",
    bg: "bg-red-50 dark:bg-red-950/30",
    textColor: "text-red-700 dark:text-red-300",
  },
}

function ConnectorLine({ active }: { active: boolean }) {
  return (
    <div className="flex items-center shrink-0">
      <div className={cn("h-px w-6 sm:w-10", active ? "bg-blue-400" : "bg-muted-foreground/20")} />
      <ArrowRight className={cn("size-3 -ml-1", active ? "text-blue-400" : "text-muted-foreground/30")} />
    </div>
  )
}

export function PipelineFlow() {
  const { data, error, isLoading } = useSWR<PipelineRun>(
    "/api/v1/testing/ops",
    fetcher,
    { refreshInterval: 15000 }
  )

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="flex items-center gap-2 overflow-x-auto pb-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <Skeleton className="h-20 w-28 rounded-lg" />
              {i < 7 && <Skeleton className="h-px w-10 shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <Play className="size-5 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">暂无法加载流水线状态</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">测试流水线</h2>
        {data.startedAt && (
          <span className="text-xs text-muted-foreground tabular-nums">
            启动于 {new Date(data.startedAt).toLocaleTimeString("zh-CN")}
          </span>
        )}
      </div>
      <div className="flex items-start gap-0 overflow-x-auto pb-3 scrollbar-thin">
        {data.stages.map((stage, i) => {
          const cfg = statusConfig[stage.status]
          const isActive = stage.id === data.currentStageId

          return (
            <div key={stage.id} className="flex items-center shrink-0">
              <div
                className={cn(
                  "relative flex flex-col items-center rounded-lg border-2 px-3 py-3 text-center min-w-[90px] sm:min-w-[100px] transition-all",
                  cfg.borderColor,
                  cfg.bg,
                  isActive && "ring-2 ring-blue-300 ring-offset-2",
                  stage.status === "failed" && "ring-1 ring-red-200",
                )}
              >
                <span className={cn("mb-1.5 size-2.5 rounded-full", cfg.dotColor, isActive && "size-3")} />
                <span className={cn("text-xs font-semibold leading-tight", cfg.textColor)}>
                  {stage.label}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                  {stage.subtext}
                </span>
                {isActive && (
                  <span className="absolute -top-2 rounded-full bg-blue-500 px-2 py-px text-[10px] font-bold text-white">
                    进行中
                  </span>
                )}
              </div>
              {i < data.stages.length - 1 && (
                <ConnectorLine active={
                  stage.status === "done" || stage.status === "running"
                } />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
