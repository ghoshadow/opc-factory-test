import { SpecQueue } from "@/components/requirement/SpecQueue"

export default function SpecQueuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">需求队列</h1>
        <p className="text-sm text-muted-foreground mt-1">
          已接受的入厂需求，按优先级排序。选择需求进入 Spec 编辑或下发至编码产线
        </p>
      </div>

      <SpecQueue />
    </div>
  )
}
