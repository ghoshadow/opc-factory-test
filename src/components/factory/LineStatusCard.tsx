"use client"

import { StatusBadge } from "@/components/ui/StatusBadge"
import { cn } from "@/lib/utils"
import type { LineStatusData } from "@/types/factory"

interface LineStatusCardProps {
  data: LineStatusData
  onClick: (id: string) => void
}

export function LineStatusCard({ data, onClick }: LineStatusCardProps) {
  const isAttention = data.status === "ATTENTION"

  return (
    <button
      type="button"
      onClick={() => onClick(data.id)}
      className={cn(
        "group relative flex flex-col rounded-xl border bg-card p-6 text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isAttention ? "border-amber-400 dark:border-amber-600" : "border-border",
      )}
    >
      {/* Header: name + status */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{data.name}</h3>
        <StatusBadge status={data.status} />
      </div>

      {/* OPC + function */}
      <div className="mt-3 space-y-1">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">OPC:</span> {data.opc}
        </p>
        <p className="text-sm text-muted-foreground">{data.function}</p>
      </div>

      {/* Metrics: WIP + completed */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">在制</p>
          <p className="text-2xl font-semibold text-foreground">{data.wip}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">已完成</p>
          <p className="text-2xl font-semibold text-foreground">{data.completed}</p>
        </div>
      </div>

      {/* Anomaly */}
      <div className="mt-3">
        <p className="text-xs text-muted-foreground">异常</p>
        <p
          className={cn(
            "text-sm",
            data.anomaly ? "font-medium text-amber-600 dark:text-amber-400" : "text-muted-foreground",
          )}
        >
          {data.anomaly ?? "—"}
        </p>
      </div>

      {/* Hover indicator */}
      <div className="mt-4 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        点击查看详情 →
      </div>
    </button>
  )
}
