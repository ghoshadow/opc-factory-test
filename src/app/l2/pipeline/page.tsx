"use client"

import { PipelineFlow } from "@/components/factory/PipelineFlow"
import { KanbanBoard } from "@/components/factory/KanbanBoard"
import { REQ_PIPELINE_NODES } from "@/lib/constants/pipeline-nodes"
import type { PipelineFlowNode } from "@/components/factory/PipelineFlow"
import type { KanbanItem } from "@/components/factory/KanbanBoard"
import type { PipelineNodeStatus } from "@/lib/constants/pipeline-nodes"
import { Loader2 } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface PipelineResponse {
  pipeline: { id: string; label: string; status: PipelineNodeStatus }[]
  activeNodeId: string
  kanbanItems: (KanbanItem & { nodeId: string })[]
}

const STATUS_COLUMNS = [
  { id: "Backlog", label: "Backlog" },
  { id: "Drafting", label: "Drafting" },
  { id: "Checking", label: "Checking" },
  { id: "Shipped", label: "Shipped" },
] as const

export default function RequirementsPipelinePage() {
  const { data, error, isLoading } = useSWR<PipelineResponse>(
    "/api/v1/l2/pipeline",
    fetcher,
  )

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load pipeline data</p>
      </div>
    )
  }

  const nodes: PipelineFlowNode[] = data.pipeline.map((n) => {
    const cfg = REQ_PIPELINE_NODES.find((c) => c.id === n.id)
    return {
      id: n.id,
      label: n.label,
      icon: cfg?.icon ?? ((() => null) as unknown as PipelineFlowNode["icon"]),
      status: n.status,
    }
  })

  const kanbanColumns = STATUS_COLUMNS.map((col) => ({
    id: col.id,
    label: col.label,
    items: data.kanbanItems.filter((item) => item.status === col.id),
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">需求产线 Pipeline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          展示需求产线的 8 个 Agent 节点及其处理流程
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Pipeline 流程图</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card p-6">
          <PipelineFlow nodes={nodes} activeNodeId={data.activeNodeId} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Kanban 看板</h2>
        <KanbanBoard columns={kanbanColumns} />
      </section>
    </div>
  )
}
