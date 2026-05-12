"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import type { SpecVersionsResponse, SpecVersionSummary } from "@/types/factory"
import {
  GitBranch,
  Loader2,
  ArrowRight,
  Check,
  Eye,
  Clock,
  AlertTriangle,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string): Promise<SpecVersionsResponse> =>
  fetch(url).then((res) => res.json())

interface VersionTimelineProps {
  specId: string
}

export function VersionTimeline({ specId }: VersionTimelineProps) {
  const router = useRouter()
  const { data, error, isLoading } = useSWR<SpecVersionsResponse>(
    specId ? `/api/v1/specs/${specId}/versions` : null,
    fetcher,
  )

  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [viewingVersion, setViewingVersion] = useState<SpecVersionSummary | null>(null)

  const toggleSelect = useCallback((version: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(version)) {
        next.delete(version)
      } else {
        if (next.size >= 2) {
          // Remove oldest selection and add new
          const [first] = next
          next.delete(first)
        }
        next.add(version)
      }
      return next
    })
  }, [])

  const handleCompare = useCallback(() => {
    const [v1, v2] = [...selected].sort((a, b) => a - b)
    router.push(`/l2/spec-editor/diff?specId=${specId}&v1=${v1}&v2=${v2}`)
  }, [selected, specId, router])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 pl-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
        <AlertTriangle className="size-8 text-destructive/60 mx-auto mb-2" />
        <p className="text-sm text-destructive">
          {error ? "加载版本历史失败，请稍后重试" : "版本数据未找到"}
        </p>
      </div>
    )
  }

  const versions = data.versions

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border py-12 text-center">
        <GitBranch className="size-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm font-medium text-muted-foreground">暂无版本历史</p>
        <p className="text-xs text-muted-foreground mt-1">Spec 尚未创建任何版本</p>
      </div>
    )
  }

  const currentVersion = versions.find((v) => v.isCurrent)
  const selectedArr = [...selected].sort((a, b) => a - b)
  const canCompare = selectedArr.length === 2

  return (
    <div className="space-y-6">
      {/* Selection bar */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GitBranch className="size-4" />
          <span>
            {selected.size === 0
              ? "选择两个版本以对比差异"
              : selected.size === 1
                ? `已选 v${selectedArr[0]}，再选一个版本`
                : `对比 v${selectedArr[0]} ↔ v${selectedArr[1]}`}
          </span>
        </div>
        <button
          disabled={!canCompare}
          onClick={handleCompare}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            canCompare
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          对比差异
          <ArrowRight className="size-3" />
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" aria-hidden="true" />

        <div className="space-y-0">
          {versions.map((v, i) => {
            const isFirst = i === 0
            const isLast = i === versions.length - 1
            const isSelected = selected.has(v.version)

            return (
              <div key={v.id} className="relative flex gap-4 pb-6 last:pb-0">
                {/* Timeline dot */}
                <div className="relative z-10 flex shrink-0 items-center justify-center">
                  <button
                    onClick={() => toggleSelect(v.version)}
                    className={cn(
                      "flex size-[38px] items-center justify-center rounded-full border-2 transition-colors",
                      v.isCurrent
                        ? "border-blue-500 bg-blue-100 dark:bg-blue-950/40"
                        : "border-border bg-card hover:border-muted-foreground/40",
                      isSelected && "border-primary bg-primary/10 ring-2 ring-primary/20",
                    )}
                    aria-label={`${isSelected ? "取消选择" : "选择"} v${v.version}`}
                  >
                    {isSelected ? (
                      <Check className="size-4 text-primary" />
                    ) : (
                      <span
                        className={cn(
                          "text-xs font-bold tabular-nums",
                          v.isCurrent
                            ? "text-blue-700 dark:text-blue-400"
                            : "text-muted-foreground",
                        )}
                      >
                        {v.version}
                      </span>
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        v.isCurrent && "text-blue-700 dark:text-blue-400",
                      )}
                    >
                      v{v.version}
                    </span>
                    {v.isCurrent && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                        <Check className="size-2.5" />
                        当前版本
                      </span>
                    )}
                    {isFirst && !v.isCurrent && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        最新
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {v.summary}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground/70">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      {new Date(v.timestamp).toLocaleString("zh-CN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <button
                      onClick={() => setViewingVersion(v)}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Eye className="size-3" />
                      查看内容
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Version content sheet */}
      <Sheet open={!!viewingVersion} onOpenChange={(open) => !open && setViewingVersion(null)}>
        <SheetContent side="right" className="w-[480px] sm:max-w-[480px]">
          {viewingVersion && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="font-mono text-sm">v{viewingVersion.version}</span>
                  {viewingVersion.isCurrent && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                      当前版本
                    </span>
                  )}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-1">
                    变更摘要
                  </h4>
                  <p className="text-sm">{viewingVersion.summary}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-1">
                    修改时间
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(viewingVersion.timestamp).toLocaleString("zh-CN")}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">
                    Spec 内容
                  </h4>
                  {viewingVersion.content ? (
                    <pre className="whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
                      {viewingVersion.content}
                    </pre>
                  ) : (
                    <p className="text-sm text-muted-foreground">该版本无内容快照</p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
