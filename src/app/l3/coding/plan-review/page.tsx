import { PlanReviewPanel } from "@/components/coding/PlanReviewPanel"

export default function PlanReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Plan Review</h1>
        <p className="text-sm text-muted-foreground mt-1">
          实现方案评审，确认任务拆解、依赖关系与影响范围
        </p>
      </div>
      <PlanReviewPanel />
    </div>
  )
}
