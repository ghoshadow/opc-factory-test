import { BugTriagePanel } from "@/components/testing/BugTriagePanel"

export default function BugTriagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bug 分诊</h1>
        <p className="text-sm text-muted-foreground mt-1">
          缺陷分类与根因分析，展示 AC 追溯链与相似 Bug 参考
        </p>
      </div>
      <BugTriagePanel />
    </div>
  )
}
