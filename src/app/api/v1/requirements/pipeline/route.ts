import { NextResponse } from "next/server"
import { REQ_PIPELINE_NODES } from "@/lib/constants/pipeline-nodes"
import type { PipelineNodeStatus } from "@/lib/constants/pipeline-nodes"
import type { ReqKanbanItem } from "@/lib/constants/pipeline-nodes"

const mockNodeStatuses: Record<string, PipelineNodeStatus> = {
  discovery: "done",
  "spec-author": "done",
  maturity: "running",
  gap: "waiting",
  "review-board": "waiting",
  revision: "waiting",
  checker: "waiting",
  reviewer: "waiting",
}

const mockKanbanItems: ReqKanbanItem[] = [
  { id: "REQ-001", title: "用户权限管理 Spec 编写", status: "Backlog", nodeId: "discovery", priority: "high" },
  { id: "REQ-002", title: "支付模块需求分析", status: "Backlog", nodeId: "discovery", priority: "high" },
  { id: "REQ-003", title: "通知系统 Spec 初稿", status: "Drafting", nodeId: "spec-author", priority: "medium" },
  { id: "REQ-004", title: "搜索优化需求规格", status: "Drafting", nodeId: "spec-author", priority: "high" },
  { id: "REQ-005", title: "API 网关需求成熟度评估", status: "Checking", nodeId: "maturity", priority: "medium" },
  { id: "REQ-006", title: "数据导出模块需求", status: "Checking", nodeId: "maturity", priority: "low" },
  { id: "REQ-007", title: "Dashboard 需求已完成", status: "Shipped", nodeId: "reviewer", priority: "high" },
  { id: "REQ-008", title: "日志采集需求已交付", status: "Shipped", nodeId: "reviewer", priority: "medium" },
]

export async function GET() {
  const pipeline = REQ_PIPELINE_NODES.map(({ icon: _icon, ...node }) => ({
    ...node,
    status: mockNodeStatuses[node.id] ?? "waiting",
  }))

  return NextResponse.json({
    pipeline,
    activeNodeId: "maturity",
    kanbanItems: mockKanbanItems,
  })
}
