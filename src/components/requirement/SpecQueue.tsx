"use client"

import { useState, useMemo, useCallback } from "react"
import useSWR from "swr"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import { Filter, FileText, ArrowRight, ExternalLink } from "lucide-react"
import type { QueueItem, QueueItemStatus, QueueResponse } from "@/types/requirement"

const fetcher = (url: string): Promise<QueueResponse> =>
  fetch(url).then((res) => res.json())

const statusLabel: Record<QueueItemStatus, string> = {
  queued: "排队中",
  speccing: "Spec 编辑中",
  ready_for_review: "待评审",
  dispatched: "已下发产线",
}

const statusStyle: Record<QueueItemStatus, string> = {
  queued: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  speccing: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  ready_for_review: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  dispatched: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
}

const priorityStyle: Record<string, string> = {
  P0: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-semibold",
  P1: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  P2: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  P3: "bg-stone-50 text-stone-700 dark:bg-stone-950/40 dark:text-stone-400",
}

export function SpecQueue() {
  const [filterPriority, setFilterPriority] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  const params = new URLSearchParams()
  if (filterPriority) params.set("priority", filterPriority)
  if (filterStatus) params.set("status", filterStatus)

  const url = `/api/v1/requirements/queue${params.toString() ? "?" + params.toString() : ""}`

  const { data, error, isLoading } = useSWR<QueueResponse>(url, fetcher)

  const hasActiveFilters = filterPriority || filterStatus

  const columns = useMemo(
    () => [
      {
        key: "id",
        header: "队列 ID",
        className: "w-[110px] font-mono text-xs",
      },
      {
        key: "title",
        header: "需求标题",
        sortable: true,
        render: (item: QueueItem) => (
          <span className="font-medium">{item.title}</span>
        ),
      },
      {
        key: "type",
        header: "类型",
        className: "w-[90px]",
        render: (item: QueueItem) => (
          <span className="text-xs font-medium text-muted-foreground">{item.type}</span>
        ),
      },
      {
        key: "priority",
        header: "优先级",
        className: "w-[80px]",
        render: (item: QueueItem) => (
          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", priorityStyle[item.priority])}>
            {item.priority}
          </span>
        ),
      },
      {
        key: "status",
        header: "状态",
        className: "w-[110px]",
        render: (item: QueueItem) => (
          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", statusStyle[item.status])}>
            {statusLabel[item.status]}
          </span>
        ),
      },
      {
        key: "actions",
        header: "操作",
        className: "w-[140px]",
        render: (item: QueueItem) =>
          item.specId ? (
            <Link
              href={`/l2/spec-editor?specId=${item.specId}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              编辑 Spec
              <ArrowRight className="size-3" />
            </Link>
          ) : (
            <Link
              href={`/l2/spec-editor?specId=${item.intakeId}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              新建 Spec
              <ExternalLink className="size-3" />
            </Link>
          ),
      },
    ],
    [],
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <FilterToolbar
          filterPriority={filterPriority}
          filterStatus={filterStatus}
          onPriorityChange={setFilterPriority}
          onStatusChange={setFilterStatus}
        />
        <DataTable columns={columns} data={[]} isLoading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">加载需求队列失败，请稍后重试</p>
      </div>
    )
  }

  if (!data) return null

  const items = data.items

  if (items.length === 0 && !hasActiveFilters) {
    return (
      <>
        <FilterToolbar
          filterPriority={filterPriority}
          filterStatus={filterStatus}
          onPriorityChange={setFilterPriority}
          onStatusChange={setFilterStatus}
        />
        <EmptyState
          icon={FileText}
          title="需求队列为空"
          description="入厂队列中暂无已接受的需求，请先在入厂队列中审核需求"
        />
      </>
    )
  }

  return (
    <div className="space-y-4">
      <FilterToolbar
        filterPriority={filterPriority}
        filterStatus={filterStatus}
        onPriorityChange={setFilterPriority}
        onStatusChange={setFilterStatus}
        total={data.total}
      />

      {items.length === 0 && hasActiveFilters ? (
        <EmptyState
          icon={Filter}
          title="无匹配需求"
          description="尝试调整筛选条件"
        />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          emptyMessage="需求队列为空"
        />
      )}
    </div>
  )
}

function FilterToolbar({
  filterPriority,
  filterStatus,
  onPriorityChange,
  onStatusChange,
  total,
}: {
  filterPriority: string
  filterStatus: string
  onPriorityChange: (v: string) => void
  onStatusChange: (v: string) => void
  total?: number
}) {
  const selectClasses = cn(
    "h-8 rounded-md border bg-background px-2.5 text-xs",
    "text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
    "appearance-none cursor-pointer",
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Filter className="size-3.5" />
        <span className="hidden sm:inline">筛选</span>
      </div>

      <select
        value={filterPriority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className={selectClasses}
      >
        <option value="">全部优先级</option>
        <option value="P0">P0</option>
        <option value="P1">P1</option>
        <option value="P2">P2</option>
        <option value="P3">P3</option>
      </select>

      <select
        value={filterStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className={selectClasses}
      >
        <option value="">全部状态</option>
        <option value="queued">排队中</option>
        <option value="speccing">Spec 编辑中</option>
        <option value="ready_for_review">待评审</option>
        <option value="dispatched">已下发产线</option>
      </select>

      {total !== undefined && (
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          共 {total} 项
        </span>
      )}
    </div>
  )
}
