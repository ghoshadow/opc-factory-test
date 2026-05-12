"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { MaturityPanel } from "@/components/requirement/MaturityPanel"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, ArrowLeft } from "lucide-react"

function MaturityContent() {
  const searchParams = useSearchParams()
  const specId = searchParams.get("specId")

  if (!specId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">成熟度评审</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Spec 完整性与质量评审，支持四维度自动化检查与评分
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border py-12 text-center">
          <AlertTriangle className="mb-2 size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">请指定 Spec</p>
          <p className="text-xs text-muted-foreground mt-1">
            可从 Spec 编辑器跳转，或在 URL 中添加 ?specId= 参数
          </p>
          <Link
            href="/l2/spec-editor"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            前往 Spec 编辑器
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-4">
          <Link
            href={`/l2/spec-editor?specId=${specId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            返回 Spec 编辑器
          </Link>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mt-2">成熟度评审</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Spec 完整性与质量评审，支持四维度自动化检查与评分
        </p>
      </div>

      <MaturityPanel specId={specId} />
    </div>
  )
}

export default function MaturityPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      }
    >
      <MaturityContent />
    </Suspense>
  )
}
