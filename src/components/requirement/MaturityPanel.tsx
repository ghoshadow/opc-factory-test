"use client"

import useSWR from "swr"
import { Check, X, FileText } from "lucide-react"
import type { MaturityResponse } from "@/types/factory"
import { MaturityGauge } from "@/components/requirement/MaturityGauge"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string): Promise<MaturityResponse> =>
  fetch(url).then((res) => res.json())

interface MaturityPanelProps {
  specId: string
}

export function MaturityPanel({ specId }: MaturityPanelProps) {
  const { data, error, isLoading } = useSWR<MaturityResponse>(
    `/api/v1/specs/${specId}/maturity`,
    fetcher,
  )

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-60" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 place-items-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <Skeleton className="h-32 w-32 rounded-full" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <FileText className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取成熟度数据，请稍后重试</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const isPass = data.verdict === "PASS"

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            成熟度评审
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Spec: {data.specTitle}
          </p>
        </div>
        <div className="text-xs text-muted-foreground text-right shrink-0">
          <span>阈值</span>
          <span className="ml-1 font-bold text-foreground">{data.threshold}</span>
          <span className="ml-0.5">分</span>
        </div>
      </div>

      {/* Three gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 place-items-center">
        {data.dimensions.map((dim) => (
          <MaturityGauge
            key={dim.key}
            dimension={dim}
            threshold={data.threshold}
          />
        ))}
      </div>

      {/* Verdict */}
      <div
        className={`rounded-lg border p-4 ${
          isPass
            ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
        }`}
      >
        {isPass ? (
          <div className="flex items-center gap-2">
            <Check className="size-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                PASS — 三维度均达到阈值，可进入 Review Board
              </p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                章节完整度、可测性、一致性全部达标
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <X className="size-5 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  FAIL — 存在不达标维度，自动触发 Gap Agent
                </p>
                <p className="text-xs text-red-600/70 dark:text-red-400/70">
                  以下维度未通过阈值 ({data.threshold}) 检查
                </p>
              </div>
            </div>
            <ul className="text-xs text-red-600/80 dark:text-red-400/80 space-y-0.5 ml-7 list-disc">
              {data.dimensions
                .filter((d) => d.score < data.threshold)
                .map((d) => (
                  <li key={d.key}>
                    {d.name}: {d.score} 分 — {d.description}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>

      {/* Dimension details */}
      <div className="border-t pt-4 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          评分说明
        </p>
        {data.dimensions.map((dim) => {
          const passDim = dim.score >= data.threshold
          return (
            <div key={dim.key} className="flex items-center gap-2 text-sm">
              {passDim ? (
                <Check className="size-3.5 text-emerald-500 shrink-0" />
              ) : (
                <X className="size-3.5 text-red-500 shrink-0" />
              )}
              <span className="font-medium">{dim.name}</span>
              <span className="tabular-nums">{dim.score} 分</span>
              <span className="text-muted-foreground text-xs">
                — {dim.description}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
