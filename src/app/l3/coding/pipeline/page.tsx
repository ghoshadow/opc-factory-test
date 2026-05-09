import { CodingPipelinePanel } from "@/components/coding/CodingPipelinePanel"

export default function CodingPipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">编码产线 Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          8 个 Agent 流程节点，支持点击查看各阶段产出
        </p>
      </div>
      <CodingPipelinePanel />
    </div>
  )
}
