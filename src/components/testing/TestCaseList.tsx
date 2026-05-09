"use client"

import useSWR from "swr"
import { TestTubeDiagonal, ChevronRight, AlertTriangle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TestCaseListResponse, TestCase, TestCaseStatus, TestingOpsResponse } from "@/types/factory"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string): Promise<TestCaseListResponse> =>
  fetch(url).then((res) => res.json()).then((d: TestingOpsResponse) => d.testCases)

const statusConfig: Record<TestCaseStatus, { label: string; className: string }> = {
  pass: { label: "通过", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200" },
  fail: { label: "失败", className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200" },
  running: { label: "执行中", className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200" },
  pending: { label: "待执行", className: "bg-gray-50 text-gray-500 dark:bg-gray-900/40 dark:text-gray-500 border-gray-200" },
}

const priorityConfig = {
  high: { label: "高", className: "text-red-600 bg-red-50 dark:bg-red-950/20" },
  medium: { label: "中", className: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20" },
  low: { label: "低", className: "text-gray-500 bg-gray-50 dark:bg-gray-900/20" },
}

function StatusChip({ status }: { status: TestCaseStatus }) {
  const cfg = statusConfig[status]
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", cfg.className)}>
      {cfg.label}
    </span>
  )
}

export function TestCaseList() {
  const { data, error, isLoading } = useSWR<TestCaseListResponse>(
    "/api/v1/testing/ops",
    (url: string) => fetcher(url).then((d) => d),
    { refreshInterval: 20000 }
  )

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-3">
        <Skeleton className="h-6 w-28" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 py-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <TestTubeDiagonal className="size-5 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">暂无法加载测试用例数据</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <TestTubeDiagonal className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">测试用例列表</h2>
            <p className="text-xs text-muted-foreground">
              共 {data.total} 条 · 通过率 {Math.round(data.passRate * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Pass rate bar */}
      <div className="px-6 py-3 bg-muted/30 border-b">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground shrink-0">通过率</span>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                data.passRate >= 0.9 ? "bg-emerald-500" : data.passRate >= 0.7 ? "bg-yellow-500" : "bg-red-500"
              )}
              style={{ width: `${Math.round(data.passRate * 100)}%` }}
            />
          </div>
          <span className="text-xs font-semibold tabular-nums shrink-0 w-10 text-right">
            {Math.round(data.passRate * 100)}%
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
              <th className="text-left px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">用例名称</th>
              <th className="text-left px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">阶段</th>
              <th className="text-left px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">状态</th>
              <th className="text-left px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">优先级</th>
              <th className="text-left px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">负责人</th>
              <th className="text-left px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">耗时</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.cases.map((tc) => {
              const priCfg = priorityConfig[tc.priority]
              const hasBug = tc.bugRef !== null

              return (
                <tr
                  key={tc.id}
                  className={cn(
                    "hover:bg-muted/30 transition-colors",
                    tc.status === "fail" && "bg-red-50/30 dark:bg-red-950/10"
                  )}
                >
                  <td className="px-6 py-3 text-xs font-mono text-muted-foreground">
                    {tc.id}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{tc.title}</span>
                      {hasBug && (
                        <AlertTriangle className="size-3.5 text-amber-500 shrink-0" aria-label={`关联: ${tc.bugRef}`} />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-xs text-muted-foreground">{tc.stage}</td>
                  <td className="px-6 py-3"><StatusChip status={tc.status} /></td>
                  <td className="px-6 py-3">
                    <span className={cn("inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold", priCfg.className)}>
                      {priCfg.label}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs font-medium">{tc.owner}</td>
                  <td className="px-6 py-3 text-xs text-muted-foreground tabular-nums">{tc.duration}</td>
                  <td className="px-2 py-3">
                    <ChevronRight className="size-4 text-muted-foreground/40" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
