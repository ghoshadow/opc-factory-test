"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Zap, Clock, Package } from "lucide-react"
import { useLineDetail } from "@/lib/api/factory"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { PipelineNode } from "@/components/ui/PipelineNode"
import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import type { DeliverableDetail } from "@/lib/types"

export default function LineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const lineId = params.lineId as string

  const { line, isLoading, isError, isNotFound } = useLineDetail(lineId)

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
          <div className="h-32 rounded-xl bg-muted" />
          <div className="h-64 rounded-xl bg-muted" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
          Failed to load line details. Please try again.
        </div>
      </div>
    )
  }

  if (isNotFound || !line) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          title="产线未找到"
          description="找不到指定的产线，请检查链接是否正确。"
          action={
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <ArrowLeft className="size-4" />
              返回总览
            </button>
          }
        />
      </div>
    )
  }

  const deliverableColumns = [
    { key: "id", header: "ID" },
    { key: "name", header: "名称" },
    { key: "type", header: "类型" },
    {
      key: "status",
      header: "状态",
      render: (item: DeliverableDetail) => {
        const statusLabel: Record<string, string> = {
          done: "已完成",
          in_progress: "进行中",
          pending: "待开始",
        }
        const statusColor: Record<string, string> = {
          done: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30",
          in_progress: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30",
          pending: "text-muted-foreground bg-muted",
        }
        return (
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[item.status]}`}>
            {statusLabel[item.status]}
          </span>
        )
      },
    },
    { key: "updatedAt", header: "更新时间" },
  ]

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          返回总览
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{line.name}</h1>
          <StatusBadge status={line.status} />
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
          <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/30">
            <Zap className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-xl font-semibold">{line.throughput}</div>
            <div className="text-xs text-muted-foreground">吞吐量 (feat/wk)</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
          <div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-950/30">
            <Package className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-xl font-semibold">{line.wip}</div>
            <div className="text-xs text-muted-foreground">在制品 (WIP)</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
          <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/30">
            <Clock className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-xl font-semibold">{line.cycleTime}</div>
            <div className="text-xs text-muted-foreground">交付周期 (hr)</div>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold">Pipeline</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {(() => {
            const stages = line.pipeline ?? line.pipelineSteps.map((s) => ({ name: s.label, status: "done" as const }))
            return stages.map((stage, i) => (
            <div key={i} className="flex items-center gap-2">
              <PipelineNode
                label={stage.name}
                status={stage.status}
                isActive={stage.status === "running"}
              />
              {i < stages.length - 1 && (
                <div className="w-6 h-px bg-border" />
              )}
            </div>
          ))})()}
        </div>
      </section>

      {/* Deliverables */}
      <section>
        <h2 className="mb-3 text-base font-semibold">交付物</h2>
        <DataTable
          columns={deliverableColumns}
          data={line.deliverables as unknown as DeliverableDetail[]}
          emptyMessage="暂无交付物"
        />
      </section>
    </div>
  )
}
