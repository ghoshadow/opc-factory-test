import { DesignReviewPanel } from "@/components/coding/DesignReviewPanel"

export default function DesignReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Design Review</h1>
        <p className="text-sm text-muted-foreground mt-1">
          接口设计评审，检查 API 定义、数据模型与架构一致性
        </p>
      </div>
      <DesignReviewPanel />
    </div>
  )
}
