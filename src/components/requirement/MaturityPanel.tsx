"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
  ArrowRight,
  FileText,
  ShieldCheck,
  FlaskConical,
  GitCompare,
  Eye,
} from "lucide-react"
import type { MaturityReviewResponse, MaturityDimension } from "@/types/requirement"

const fetcher = (url: string): Promise<MaturityReviewResponse> =>
  fetch(url).then((res) => res.json())

const dimIcons: Record<string, typeof FileText> = {
  completeness: ShieldCheck,
  testability: FlaskConical,
  consistency: GitCompare,
  clarity: Eye,
}

const statusConfig = {
  pass: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", label: "通过" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", label: "待改进" },
  fail: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", label: "未通过" },
}

interface MaturityPanelProps {
  specId: string
  onClose?: () => void
}

export function MaturityPanel({ specId, onClose }: MaturityPanelProps) {
  const router = useRouter()
  const [reEvaluating, setReEvaluating] = useState(false)

  const { data: review, error, isLoading, mutate } = useSWR<MaturityReviewResponse>(
    specId ? `/api/v1/specs/${specId}/maturity` : null,
    fetcher,
  )

  const handleReEvaluate = useCallback(async () => {
    setReEvaluating(true)
    try {
      const res = await fetch(`/api/v1/specs/${specId}/maturity`, { method: "POST" })
      if (res.ok) {
        const updated = await res.json()
        mutate(updated, false)
      }
    } finally {
      setReEvaluating(false)
    }
  }, [specId, mutate])

  if (isLoading) return <MaturitySkeleton />
  if (error || !review) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-sm text-destructive">加载评审失败</p>
      </div>
    )
  }

  const scoreColor =
    review.overallScore >= review.threshold
      ? "text-emerald-600"
      : review.overallScore >= review.threshold * 0.75
        ? "text-amber-600"
        : "text-red-600"

  return (
    <div className="space-y-6">
      {/* Overall score card */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">成熟度评审</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {review.specId} · 最近评审于 {new Date(review.reviewedAt).toLocaleString("zh-CN")}
            </p>
          </div>
          <button
            onClick={handleReEvaluate}
            disabled={reEvaluating}
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            {reEvaluating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            重新评估
          </button>
        </div>

        {/* Score display */}
        <div className="mt-6 flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center justify-center size-20 rounded-full border-4",
              review.passed
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
            )}>
              <span className={cn("text-2xl font-bold tabular-nums", scoreColor)}>
                {review.overallScore}
              </span>
            </div>
          </div>
          <div>
            <p className={cn("text-sm font-semibold", scoreColor)}>
              {review.passed ? "评审通过" : "评审未通过"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              阈值 {review.threshold} 分 · 综合 {review.overallScore} 分
            </p>
            {!review.passed && (
              <button
                onClick={() => router.push(`/l2/gap-questions?specId=${specId}`)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                前往 Gap 追问
                <ArrowRight className="size-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dimension cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {review.dimensions.map((dim) => (
          <DimensionCard key={dim.key} dimension={dim} />
        ))}
      </div>
    </div>
  )
}

function DimensionCard({ dimension }: { dimension: MaturityDimension }) {
  const sc = statusConfig[dimension.status]
  const StatusIcon = sc.icon
  const DimIcon = dimIcons[dimension.key] || FileText

  const barColor =
    dimension.status === "pass"
      ? "bg-emerald-500"
      : dimension.status === "warning"
        ? "bg-amber-500"
        : "bg-red-500"

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DimIcon className="size-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">{dimension.name}</h4>
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", sc.bg, sc.color)}>
          <StatusIcon className="size-3" />
          {sc.label}
        </span>
      </div>

      {/* Score bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", barColor)}
            style={{ width: `${(dimension.score / dimension.maxScore) * 100}%` }}
          />
        </div>
        <span className="text-sm font-semibold tabular-nums">{dimension.score}</span>
      </div>

      {/* Details */}
      <ul className="space-y-1">
        {dimension.details.map((detail, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <span className="mt-1 size-1 shrink-0 rounded-full bg-muted-foreground/40" />
            {detail}
          </li>
        ))}
      </ul>
    </div>
  )
}

function MaturitySkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-48 mt-2" />
        <div className="mt-6 flex items-center gap-6">
          <Skeleton className="size-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
