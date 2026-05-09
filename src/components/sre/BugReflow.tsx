"use client"

import { useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import {
  Bug,
  Edit3,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  Send,
  Loader2,
} from "lucide-react"
import type {
  ReflowBug,
  ReflowBugListResponse,
  ReflowStatusResponse,
  ReflowStatus,
} from "@/types/factory"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const priorityConfig: Record<string, string> = {
  P0: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800",
  P1: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  P2: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  P3: "bg-slate-100 text-slate-700 dark:bg-slate-950/40 dark:text-slate-400 border-slate-200 dark:border-slate-800",
}

const statusConfig: Record<
  ReflowStatus,
  { label: string; icon: typeof Clock; badgeClass: string; iconClass: string }
> = {
  open: {
    label: "待回流",
    icon: AlertTriangle,
    badgeClass:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    iconClass: "text-amber-500",
  },
  reflowed_to_intake: {
    label: "已回流至 Intake",
    icon: Send,
    badgeClass:
      "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    iconClass: "text-blue-500",
  },
  coding_in_progress: {
    label: "编码产线处理中",
    icon: Loader2,
    badgeClass:
      "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    iconClass: "text-purple-500",
  },
  fixed: {
    label: "已修复",
    icon: CheckCircle2,
    badgeClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    iconClass: "text-emerald-500",
  },
}

function StatusTimeline({
  timeline,
}: {
  timeline: ReflowStatusResponse["timeline"]
}) {
  return (
    <div className="space-y-0">
      {timeline.map((entry, idx) => {
        const cfg = statusConfig[entry.status]
        const Icon = cfg.icon
        const isLast = idx === timeline.length - 1
        const isCurrent = entry.status === timeline[timeline.length - 1].status

        return (
          <div key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`size-7 rounded-full flex items-center justify-center border-2 ${
                  isCurrent
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/20 bg-muted/50"
                }`}
              >
                <Icon
                  className={`size-3.5 ${isCurrent ? cfg.iconClass : "text-muted-foreground/50"}`}
                />
              </div>
              {!isLast && (
                <div className="w-0.5 h-full min-h-6 bg-border my-1" />
              )}
            </div>
            <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
              <div className="flex items-center gap-2">
                <p
                  className={`text-sm font-medium ${isCurrent ? "" : "text-muted-foreground"}`}
                >
                  {entry.label}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {entry.description}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                {new Date(entry.timestamp).toLocaleString("zh-CN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ReflowConfirmDialog({
  bug,
  open,
  onClose,
  onConfirm,
  loading,
}: {
  bug: ReflowBug
  open: boolean
  onClose: () => void
  onConfirm: (title: string, description: string) => void
  loading: boolean
}) {
  const [title, setTitle] = useState(bug.title)
  const [description, setDescription] = useState(bug.description)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={loading ? undefined : onClose}
      />
      <div className="relative bg-card rounded-xl border shadow-lg w-full max-w-lg mx-4 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
            <RefreshCw className="size-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">确认回流</h3>
            <p className="text-xs text-muted-foreground">
              确认 Bug 内容后回流至需求产线 Intake
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={5}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50"
            />
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-3.5" />
            <span>
              回流后将创建需求产线任务，Bug 状态将更新为"编码产线处理中"
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            取消
          </Button>
          <Button
            onClick={() => onConfirm(title, description)}
            disabled={loading || !title.trim() || !description.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                回流中...
              </>
            ) : (
              <>
                <Send className="size-4" />
                确认回流
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function BugDetail({
  bug,
  onBack,
}: {
  bug: ReflowBug
  onBack: () => void
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [reflowing, setReflowing] = useState(false)
  const [localBug, setLocalBug] = useState<ReflowBug>(bug)
  const isEditable = bug.status === "open"

  const handleReflow = async (title: string, description: string) => {
    setReflowing(true)
    try {
      const res = await fetch(`/api/v1/sre/bugs/${bug.id}/reflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      })
      if (!res.ok) throw new Error("回流失败")

      const data: ReflowStatusResponse = await res.json()
      setLocalBug({
        ...bug,
        title,
        description,
        status: data.status,
        timeline: data.timeline,
      })
      setShowConfirm(false)
      toast.success("Bug 已成功回流至需求产线 Intake")
    } catch {
      toast.error("回流失败，请稍后重试")
    } finally {
      setReflowing(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        返回列表
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-xs text-muted-foreground font-mono">
              {bug.id}
            </span>
            <Badge className={priorityConfig[bug.priority]}>{bug.priority}</Badge>
            <Badge
              className={statusConfig[localBug.status]?.badgeClass}
            >
              {statusConfig[localBug.status]?.label}
            </Badge>
          </div>
          {isEditable ? (
            <input
              type="text"
              value={localBug.title}
              onChange={(e) =>
                setLocalBug({ ...localBug, title: e.target.value })
              }
              className="w-full text-lg font-semibold bg-transparent border-b border-input focus:outline-none focus:border-primary px-0 py-1"
            />
          ) : (
            <h2 className="text-lg font-semibold">{localBug.title}</h2>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>
              模块: <span className="font-medium text-foreground">{bug.module}</span>
            </span>
            <span>
              来源: <span className="font-medium text-foreground">{bug.source}</span>
            </span>
            <span>
              创建:{" "}
              {new Date(bug.createdAt).toLocaleString("zh-CN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {isEditable && (
          <Button
            onClick={() => setShowConfirm(true)}
            className="shrink-0"
          >
            <RefreshCw className="size-4" />
            回流至 Intake
          </Button>
        )}
      </div>

      {/* Description */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Edit3 className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Bug 描述</h3>
        </div>
        {isEditable ? (
          <textarea
            value={localBug.description}
            onChange={(e) =>
              setLocalBug({ ...localBug, description: e.target.value })
            }
            rows={8}
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        ) : (
          <div className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">
            {localBug.description}
          </div>
        )}
      </div>

      {/* Status Timeline */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">状态追踪</h3>
        </div>
        <StatusTimeline timeline={localBug.timeline} />
      </div>

      {/* Reflow Confirm Dialog */}
      <ReflowConfirmDialog
        bug={localBug}
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleReflow}
        loading={reflowing}
      />
    </div>
  )
}

function BugListRow({
  bug,
  selected,
  onClick,
}: {
  bug: ReflowBug
  selected: boolean
  onClick: () => void
}) {
  const statusCfg = statusConfig[bug.status]
  const StatusIcon = statusCfg.icon

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg border p-4 transition-colors hover:bg-accent/50 ${
        selected ? "border-primary bg-accent/50" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs text-muted-foreground font-mono">
              {bug.id}
            </span>
            <Badge className={priorityConfig[bug.priority]}>{bug.priority}</Badge>
          </div>
          <p className="text-sm font-medium truncate">{bug.title}</p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span>{bug.module}</span>
            <span>{bug.source}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs ${statusCfg.badgeClass}`}
          >
            <StatusIcon className="size-3" />
            {statusCfg.label}
          </div>
          <ChevronRight className="size-4 text-muted-foreground/40" />
        </div>
      </div>
    </button>
  )
}

export function BugReflow() {
  const { data, error, isLoading, mutate } = useSWR<ReflowBugListResponse>(
    "/api/v1/sre/bugs",
    fetcher,
    { refreshInterval: 30000 }
  )

  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-7 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <Bug className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">
              无法获取 Bug 列表，请稍后重试
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const selectedBug = data.bugs.find((b) => b.id === selectedId) ?? null

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bug className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Bug 回流管理</h2>
            <p className="text-xs text-muted-foreground">
              SRE 确认 Bug 内容并回流至需求产线
            </p>
          </div>
        </div>
        {!selectedBug && (
          <div className="flex items-center gap-1 text-sm tabular-nums">
            <span className="font-semibold">{data.total}</span>
            <span className="text-muted-foreground">个 Bug</span>
          </div>
        )}
      </div>

      {selectedBug ? (
        <BugDetail
          bug={selectedBug}
          onBack={() => {
            setSelectedId(null)
            mutate()
          }}
        />
      ) : (
        <div className="space-y-2">
          {data.bugs.map((bug) => (
            <BugListRow
              key={bug.id}
              bug={bug}
              selected={selectedId === bug.id}
              onClick={() => setSelectedId(bug.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
