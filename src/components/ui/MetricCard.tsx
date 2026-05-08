"use client"

import { ArrowUp, ArrowDown, Minus, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Trend = "up" | "down" | "stable"

interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  trend?: Trend
  trendValue?: string
  icon?: LucideIcon
  className?: string
}

const trendConfig: Record<Trend, { icon: typeof ArrowUp; color: string; bg: string }> = {
  up: { icon: ArrowUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  down: { icon: ArrowDown, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40" },
  stable: { icon: Minus, color: "text-muted-foreground", bg: "bg-muted" },
}

export function MetricCard({ label, value, unit, trend, trendValue, icon: Icon, className }: MetricCardProps) {
  const trendCfg = trend ? trendConfig[trend] : null
  const TrendIcon = trendCfg?.icon

  return (
    <div className={cn("rounded-xl border bg-card p-5 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && <Icon className="size-5 text-muted-foreground/60" />}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {trendCfg && TrendIcon && (
        <div className={cn("mt-3 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium", trendCfg.color, trendCfg.bg)}>
          <TrendIcon className="size-3" />
          {trendValue && <span>{trendValue}</span>}
        </div>
      )}
    </div>
  )
}
