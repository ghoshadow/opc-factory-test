"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SpecEditor } from "@/components/requirement/SpecEditor"
import { Skeleton } from "@/components/ui/skeleton"

function SpecEditorContent() {
  const searchParams = useSearchParams()
  const specId = searchParams.get("specId") ?? "spec-001"

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Spec 编辑器</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          编辑 Spec 的四个核心章节：User Story、验收标准、数据契约、UX 雏形
        </p>
      </div>

      {/* Editor */}
      <SpecEditor specId={specId} />
    </div>
  )
}

export default function SpecEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      }
    >
      <SpecEditorContent />
    </Suspense>
  )
}
