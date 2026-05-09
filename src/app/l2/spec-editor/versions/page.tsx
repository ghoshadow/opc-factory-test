"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { VersionTimeline } from "@/components/requirement/VersionTimeline"
import { Skeleton } from "@/components/ui/skeleton"

function VersionTimelineContent() {
  const searchParams = useSearchParams()
  const specId = searchParams.get("specId") ?? ""

  if (!specId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/l2/spec-editor"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            返回 Spec 编辑器
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border py-12 text-center">
          <AlertTriangle className="mb-2 size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">参数无效</p>
          <p className="text-xs text-muted-foreground mt-1">请指定有效的 specId 参数</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/l2/spec-editor?specId=${specId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          返回 Spec 编辑器
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">版本历史</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          查看 Spec 的所有历史版本，选择两个版本进行差异对比
        </p>
      </div>

      {/* Timeline */}
      <VersionTimeline specId={specId} />
    </div>
  )
}

export default function VersionHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="space-y-4 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="size-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <VersionTimelineContent />
    </Suspense>
  )
}
