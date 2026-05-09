"use client"

import useSWR from "swr"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface WipLine {
  key: string
  name: string
  count: number
  cssVar: string
}

interface WipResponse {
  lines: WipLine[]
  total: number
}

interface WipStatsProps {
  data?: WipResponse
  isLoading?: boolean
  error?: unknown
}

const fetcher = (url: string): Promise<WipResponse> =>
  fetch(url).then((res) => res.json())

export function WipStats({ data: propData, isLoading: propLoading, error: propError }: WipStatsProps = {}) {
  const hasProps = propData !== undefined || propLoading !== undefined || propError !== undefined

  const { data: swrData, error: swrError, isLoading: swrLoading } = useSWR<WipResponse>(
    hasProps ? null : "/api/v1/factory/wip",
    fetcher,
    { refreshInterval: 10000 }
  )

  const data = hasProps ? propData : swrData
  const isLoading = hasProps ? (propLoading ?? false) : swrLoading
  const error = hasProps ? propError : swrError

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Failed to load WIP stats</p>
      </div>
    )
  }

  if (!data) return null

  const maxCount = Math.max(...data.lines.map((l) => l.count), 1)

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-foreground">WIP 在制品统计</h3>
        <span className="text-2xl font-bold tabular-nums">{data.total}</span>
      </div>

      <div className="space-y-4">
        {data.lines.map((line) => {
          const pct = data.total > 0 ? ((line.count / data.total) * 100).toFixed(1) : "0.0"
          const barWidth = (line.count / maxCount) * 100

          return (
            <div key={line.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{line.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  {line.count > 0 ? (
                    <>
                      <span className="font-semibold text-foreground">{line.count}</span>
                      {" "}件 · {pct}%
                    </>
                  ) : (
                    <span className="text-muted-foreground/60">待定</span>
                  )}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    line.count === 0 && "w-0"
                  )}
                  style={{
                    width: line.count > 0 ? `${barWidth}%` : "0%",
                    backgroundColor: LINE_COLORS[line.key] ?? "#6B7280",
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
