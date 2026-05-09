"use client"

import { SpecEditor } from "@/components/requirement/SpecEditor"

export default function SpecEditorPage() {
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
      <SpecEditor specId="spec-001" />
    </div>
  )
}
