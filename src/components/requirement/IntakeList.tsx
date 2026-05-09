"use client"

import { useState, useMemo, useCallback } from "react"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import { DataTable } from "@/components/ui/DataTable"
import { EmptyState } from "@/components/ui/EmptyState"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { FileText, Filter } from "lucide-react"
import type { IntakeItem, IntakeType, IntakePriority, IntakeStatus, IntakeResponse } from "@/types/requirement"

const fetcher = (url: string): Promise<IntakeResponse> =>
  fetch(url).then((res) => res.json())

const intakeTypes: IntakeType[] = ["初步需求", "功能需求", "技术需求", "Bug 报告"]
const intakePriorities: IntakePriority[] = ["P0", "P1", "P2", "P3"]
const intakeStatuses: IntakeStatus[] = ["queued", "triaging", "accepted", "rejected"]

const statusLabel: Record<IntakeStatus, string> = {
  queued: "排队中",
  triaging: "分类中",
  accepted: "已接受",
  rejected: "已拒绝",
}

const statusStyle: Record<IntakeStatus, string> = {
  queued: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  triaging: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  accepted: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
}

const priorityStyle: Record<IntakePriority, string> = {
  P0: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-semibold",
  P1: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  P2: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  P3: "bg-stone-50 text-stone-700 dark:bg-stone-950/40 dark:text-stone-400",
}

export function IntakeList() {
  const [filterType, setFilterType] = useState<string>("")
  const [filterPriority, setFilterPriority] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [selectedItem, setSelectedItem] = useState<IntakeItem | null>(null)

  const params = new URLSearchParams()
  if (filterType) params.set("type", filterType)
  if (filterPriority) params.set("priority", filterPriority)
  if (filterStatus) params.set("status", filterStatus)

  const url = `/api/v1/intake${params.toString() ? "?" + params.toString() : ""}`

  const { data, error, isLoading } = useSWR<IntakeResponse>(url, fetcher)

  const handleRowClick = useCallback((item: IntakeItem) => {
    setSelectedItem(item)
  }, [])

  const hasActiveFilters = filterType || filterPriority || filterStatus

  const columns = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
        className: "w-[100px] font-mono text-xs",
      },
      {
        key: "type",
        header: "类型",
        className: "w-[90px]",
        render: (item: IntakeItem) => (
          <span className="text-xs font-medium text-muted-foreground">{item.type}</span>
        ),
      },
      {
        key: "title",
        header: "标题",
        sortable: true,
        render: (item: IntakeItem) => (
          <span className="font-medium">{item.title}</span>
        ),
      },
      {
        key: "priority",
        header: "优先级",
        className: "w-[80px]",
        render: (item: IntakeItem) => (
          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", priorityStyle[item.priority])}>
            {item.priority}
          </span>
        ),
      },
      {
        key: "status",
        header: "状态",
        className: "w-[90px]",
        render: (item: IntakeItem) => (
          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", statusStyle[item.status])}>
            {statusLabel[item.status]}
          </span>
        ),
      },
      {
        key: "submittedAt",
        header: "提交时间",
        className: "w-[120px] text-muted-foreground",
        render: (item: IntakeItem) => (
          <span className="text-xs">
            {new Date(item.submittedAt).toLocaleDateString("zh-CN", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ),
      },
    ],
    [],
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <FilterToolbar
          filterType={filterType}
          filterPriority={filterPriority}
          filterStatus={filterStatus}
          onTypeChange={setFilterType}
          onPriorityChange={setFilterPriority}
          onStatusChange={setFilterStatus}
        />
        <DataTable columns={columns} data={[]} isLoading />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">加载入厂需求失败，请稍后重试</p>
      </div>
    )
  }

  if (!data) return null

  const items = data.items

  // Empty state when no items exist at all (no filters active)
  if (items.length === 0 && !hasActiveFilters) {
    return (
      <>
        <FilterToolbar
          filterType={filterType}
          filterPriority={filterPriority}
          filterStatus={filterStatus}
          onTypeChange={setFilterType}
          onPriorityChange={setFilterPriority}
          onStatusChange={setFilterStatus}
        />
        <EmptyState
          icon={FileText}
          title="暂无入厂需求"
          description="点击新建需求开始"
        />
      </>
    )
  }

  return (
    <div className="space-y-4">
      <FilterToolbar
        filterType={filterType}
        filterPriority={filterPriority}
        filterStatus={filterStatus}
        onTypeChange={setFilterType}
        onPriorityChange={setFilterPriority}
        onStatusChange={setFilterStatus}
        total={data.total}
      />

      {/* Empty filtered results */}
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
          onRowClick={handleRowClick}
          emptyMessage="暂无入厂需求"
        />
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent side="right" className="w-[420px] sm:max-w-[420px]">
          {selectedItem && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="font-mono text-sm text-muted-foreground">{selectedItem.id}</span>
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-4 px-1">
                <h2 className="text-lg font-semibold">{selectedItem.title}</h2>

                <div className="flex flex-wrap gap-2">
                  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", priorityStyle[selectedItem.priority])}>
                    {selectedItem.priority}
                  </span>
                  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyle[selectedItem.status])}>
                    {statusLabel[selectedItem.status]}
                  </span>
                  <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {selectedItem.type}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-1">描述</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.description || "暂无描述"}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-1">提交时间</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedItem.submittedAt).toLocaleString("zh-CN")}
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function FilterToolbar({
  filterType,
  filterPriority,
  filterStatus,
  onTypeChange,
  onPriorityChange,
  onStatusChange,
  total,
}: {
  filterType: string
  filterPriority: string
  filterStatus: string
  onTypeChange: (v: string) => void
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
        value={filterType}
        onChange={(e) => onTypeChange(e.target.value)}
        className={selectClasses}
      >
        <option value="">全部类型</option>
        {intakeTypes.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <select
        value={filterPriority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className={selectClasses}
      >
        <option value="">全部优先级</option>
        {intakePriorities.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select
        value={filterStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className={selectClasses}
      >
        <option value="">全部状态</option>
        {intakeStatuses.map((s) => (
          <option key={s} value={s}>{statusLabel[s]}</option>
        ))}
      </select>

      {total !== undefined && (
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          共 {total} 项
        </span>
      )}
    </div>
  )
}
