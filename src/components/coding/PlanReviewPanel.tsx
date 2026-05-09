"use client"

import { useState, useCallback, useEffect } from "react"
import useSWR from "swr"
import {
  ClipboardCheck,
  ChevronRight,
  GitBranch,
  Network,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  FileCode,
} from "lucide-react"
import type { PlanData, PlanReviewResponse, PlanTask } from "@/types/coding"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string): Promise<PlanReviewResponse> =>
  fetch(url).then((res) => res.json())

const statusConfig = {
  pending: {
    label: "待审",
    icon: AlertCircle,
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  approved: {
    label: "已确认",
    icon: CheckCircle,
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
  rejected: {
    label: "已打回",
    icon: XCircle,
    className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800",
  },
}

// ─── Task Tree ──────────────────────────────────────────────

function TaskRow({ task, depth = 0 }: { task: PlanTask; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 1)
  const hasChildren = task.children && task.children.length > 0

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-muted/40 rounded-md transition-colors cursor-pointer"
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          <ChevronRight
            className={`size-4 text-muted-foreground shrink-0 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span className="text-sm font-medium flex-1 min-w-0 truncate">{task.title}</span>
        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
          {task.estimatedHours}h
        </span>
      </div>
      {hasChildren && expanded && (
        <div>
          {task.children!.map((child) => (
            <TaskRow key={child.id} task={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── API Table ──────────────────────────────────────────────

const methodColors: Record<string, string> = {
  GET: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  POST: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  PUT: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  PATCH: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  DELETE: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
}

// ─── Confirm Dialog ─────────────────────────────────────────

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  plan,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  plan: PlanData
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border rounded-xl shadow-lg p-6 w-full max-w-md mx-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 p-2">
            <ClipboardCheck className="size-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">确认冻结 Plan</h3>
            <p className="text-sm text-muted-foreground">确认后将进入 Design 阶段，不可修改</p>
          </div>
        </div>
        <div className="bg-muted/40 rounded-lg p-3 space-y-1">
          <p className="text-sm font-medium">{plan.title}</p>
          <p className="text-xs text-muted-foreground">
            {plan.tasks.length} 个任务 · {plan.workload.storyPoints} SP · {plan.workload.totalPersonHours}h
          </p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium border hover:bg-muted transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            确认冻结
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Reject Dialog ──────────────────────────────────────────

function RejectDialog({
  open,
  onClose,
  onConfirm,
  plan,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  plan: PlanData
}) {
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  if (!open) return null

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("驳回必须填写修改意见")
      return
    }
    onConfirm(reason.trim())
  }

  const handleClose = () => {
    setReason("")
    setError("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-card border rounded-xl shadow-lg p-6 w-full max-w-md mx-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-red-100 dark:bg-red-900/40 p-2">
            <XCircle className="size-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">驳回 Plan</h3>
            <p className="text-sm text-muted-foreground">Plan 将回到 Planner 重新修改</p>
          </div>
        </div>
        <div className="bg-muted/40 rounded-lg p-3">
          <p className="text-sm font-medium">{plan.title}</p>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            修改意见 <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="请填写驳回原因及修改建议..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (error) setError("")
            }}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium border hover:bg-muted transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            确认驳回
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Panel ─────────────────────────────────────────────

export function PlanReviewPanel() {
  const { data, error, isLoading, mutate } = useSWR<PlanReviewResponse>(
    "/api/v1/coding/plan",
    fetcher,
    { refreshInterval: 30000 }
  )

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  const selectedPlan = data?.plans.find((p) => p.id === selectedId) ?? null

  useEffect(() => {
    if (!selectedId && data && data.plans.length > 0) {
      setSelectedId(data.plans[0].id)
    }
  }, [data, selectedId])

  const handleApprove = useCallback(async () => {
    if (!selectedPlan) return
    setUpdating(true)
    try {
      const res = await fetch("/api/v1/coding/plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedPlan.id, action: "approve" }),
      })
      if (res.ok) {
        await mutate()
        setConfirmOpen(false)
      }
    } finally {
      setUpdating(false)
    }
  }, [selectedPlan, mutate])

  const handleReject = useCallback(
    async (reason: string) => {
      if (!selectedPlan) return
      setUpdating(true)
      try {
        const res = await fetch("/api/v1/coding/plan", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedPlan.id, action: "reject", reason }),
        })
        if (res.ok) {
          await mutate()
          setRejectOpen(false)
        }
      } finally {
        setUpdating(false)
      }
    },
    [selectedPlan, mutate]
  )

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  // ── Error ──
  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取 Plan 数据，请稍后重试</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.plans.length === 0) return null

  // ── Plan selector ──
  const currentCfg = selectedPlan ? statusConfig[selectedPlan.status] : null

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
      {/* Header + Plan selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Plan Review 面板</h2>
            <p className="text-xs text-muted-foreground">审核 PlannerAgent 产出的执行计划</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {currentCfg && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${currentCfg.className}`}
            >
              <currentCfg.icon className="size-3.5" />
              {currentCfg.label}
            </span>
          )}
          <select
            className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {data.plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} — {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedPlan ? (
        <p className="text-sm text-muted-foreground text-center py-8">请选择一个 Plan 进行审核</p>
      ) : (
        <>
          {/* Rejection reason banner */}
          {selectedPlan.status === "rejected" && selectedPlan.rejectionReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-3 flex items-start gap-2">
              <XCircle className="size-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">驳回原因</p>
                <p className="text-sm text-red-600/80 dark:text-red-400/80">{selectedPlan.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* ── Section 1: Task Breakdown ── */}
          <SectionCard
            icon={GitBranch}
            title="任务拆分"
            subtitle={`${countTasks(selectedPlan.tasks)} 个任务 · 合计 ${selectedPlan.workload.totalPersonHours}h`}
          >
            <div className="divide-y">
              {selectedPlan.tasks.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </div>
          </SectionCard>

          {/* ── Section 2: API Design ── */}
          <SectionCard
            icon={FileCode}
            title="API 设计"
            subtitle={`${selectedPlan.apis.length} 个端点`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-3 font-medium text-muted-foreground w-16">方法</th>
                    <th className="py-2 pr-3 font-medium text-muted-foreground">路径</th>
                    <th className="py-2 pr-3 font-medium text-muted-foreground">说明</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPlan.apis.map((api) => (
                    <tr key={`${api.method}-${api.path}`} className="border-b last:border-0">
                      <td className="py-2 pr-3">
                        <span
                          className={`inline-flex rounded px-1.5 py-0.5 text-xs font-mono font-semibold ${
                            methodColors[api.method] ?? "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {api.method}
                        </span>
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs">{api.path}</td>
                      <td className="py-2 pr-3 text-xs text-muted-foreground">{api.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* ── Section 3: Dependencies ── */}
          <SectionCard
            icon={Network}
            title="依赖关系"
            subtitle={`${selectedPlan.dependencies.length} 条依赖边`}
          >
            {selectedPlan.dependencies.length === 0 ? (
              <p className="text-sm text-muted-foreground/60 italic py-2">无依赖关系</p>
            ) : (
              <div className="space-y-1.5">
                {selectedPlan.dependencies.map((dep, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm py-1.5 px-3 bg-muted/30 rounded-md"
                  >
                    <span className="font-medium">{dep.from}</span>
                    <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                    <span className="font-medium">{dep.to}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{dep.label}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── Section 4: Workload Estimates ── */}
          <SectionCard
            icon={Clock}
            title="工作量预估"
            subtitle={`${selectedPlan.workload.storyPoints} SP · ${selectedPlan.workload.totalPersonHours}h`}
          >
            <div className="space-y-2">
              {selectedPlan.workload.breakdown.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm py-1.5 px-3 bg-muted/30 rounded-md">
                  <span className="flex-1">{item.task}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{item.hours}h</span>
                  <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/60"
                      style={{
                        width: `${Math.round((item.hours / selectedPlan.workload.totalPersonHours) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Actions ── */}
          {selectedPlan.status === "pending" && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectOpen(true)}
                disabled={updating}
                className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
              >
                <XCircle className="size-4" />
                驳回
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={updating}
                className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="size-4" />
                确认冻结
              </button>
            </div>
          )}

          {/* Dialogs */}
          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleApprove}
            plan={selectedPlan}
          />
          <RejectDialog
            open={rejectOpen}
            onClose={() => setRejectOpen(false)}
            onConfirm={handleReject}
            plan={selectedPlan}
          />
        </>
      )}
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-card/50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
      {children}
    </div>
  )
}

function countTasks(tasks: PlanTask[]): number {
  let count = 0
  for (const t of tasks) {
    count += 1
    if (t.children) count += t.children.length
  }
  return count
}
