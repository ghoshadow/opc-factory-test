import { ReviewerPanel } from "@/components/quality/ReviewerPanel"

export default function ReviewerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviewer 看板</h1>
        <p className="text-sm text-muted-foreground mt-1">
          计划评审 · 设计评审 · Toco 代码分析
        </p>
      </div>
      <ReviewerPanel />
    </div>
  )
}
