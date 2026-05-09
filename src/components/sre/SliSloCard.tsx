"use client"

import { TrendingUp, TrendingDown, Minus, CheckCircle, AlertTriangle } from "lucide-react"
import type { SloTarget, SloData } from "@/types/factory"

interface Props {
  data: SloData
}

function SloRow({ target }: { target: SloTarget }) {
  const trendIcon = target.trend === "up" ? TrendingUp : target.trend === "down" ? TrendingDown : Minus
  const trendColor = target.trend === "up" ? "text-amber-500" : target.trend === "down" ? "text-emerald-500" : "text-slate-400"

  return (
    <div className="flex items-center gap-4 py-3 px-4 hover:bg-muted/30 transition-colors border-b border-border/50 last:border-b-0">
      {/* Status icon */}
      <div className="shrink-0">
        {target.withinSlo ? (
          <CheckCircle className="size-5 text-emerald-500" />
        ) : (
          <AlertTriangle className="size-5 text-amber-500" />
        )}
      </div>

      {/* SLI name + description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{target.sli}</code>
          <span className="text-sm">{target.description}</span>
        </div>
      </div>

      {/* Current value */}
      <div className="text-right">
        <div className="flex items-center gap-1 justify-end">
          <span className={`text-lg font-bold tabular-nums ${target.withinSlo ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
            {target.current}
          </span>
          <span className="text-xs text-muted-foreground">{target.unit}</span>
        </div>
        <div className="flex items-center gap-1.5 justify-end mt-0.5">
          <span className="text-xs text-muted-foreground">
            SLO: {target.target}{target.unit}
          </span>
          <span className={`inline-flex items-center gap-0.5 text-xs ${trendColor}`}>
            {(() => { const Icon = trendIcon; return <Icon className="size-3" /> })()}
          </span>
        </div>
      </div>
    </div>
  )
}

export function SliSloCard({ data }: Props) {
  const compliant = data.summary.withinSlo
  const total = data.summary.totalSli
  const allCompliant = compliant === total

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className={`rounded-xl border p-5 ${allCompliant ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/10" : "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10"}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">SLO 合规状态</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{compliant}/{total} 个指标达标</p>
          </div>
          <div className={`text-3xl font-bold tabular-nums ${allCompliant ? "text-emerald-600" : "text-amber-600"}`}>
            {Math.round((compliant / total) * 100)}%
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${allCompliant ? "bg-emerald-500" : "bg-amber-500"}`}
            style={{ width: `${(compliant / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Individual SLI rows */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center gap-4 py-2.5 px-4 text-xs font-medium text-muted-foreground bg-muted/50 border-b">
          <div className="w-5 shrink-0" />
          <div className="flex-1">指标</div>
          <div className="text-right w-[140px]">当前值 / SLO 阈值</div>
        </div>
        <div>
          {data.targets.map((t) => (
            <SloRow key={t.sli} target={t} />
          ))}
        </div>
      </div>
    </div>
  )
}
