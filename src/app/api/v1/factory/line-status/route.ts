import { NextResponse } from "next/server"

export interface LineInfo {
  id: string
  name: string
  status: "NOMINAL" | "ATTENTION" | "BLOCKED"
  throughput: number
  wip: number
  cycleTime: number
  pipeline: PipelineStage[]
  deliverables: Deliverable[]
}

export interface PipelineStage {
  name: string
  status: "waiting" | "running" | "done" | "failed"
}

export interface Deliverable {
  id: string
  name: string
  type: string
  status: "done" | "in_progress" | "pending"
  updatedAt: string
}

export type LineStatusResponse = LineInfo[]

function generateLineStatus(): LineStatusResponse {
  return [
    {
      id: "requirement",
      name: "需求产线",
      status: "NOMINAL",
      throughput: 3,
      wip: 4,
      cycleTime: 2.1,
      pipeline: [
        { name: "需求分析", status: "done" },
        { name: "规格编写", status: "done" },
        { name: "评审确认", status: "running" },
        { name: "交付验收", status: "waiting" },
      ],
      deliverables: [
        { id: "REQ-001", name: "KPI 指标卡片", type: "feature", status: "done", updatedAt: "2h ago" },
        { id: "REQ-002", name: "产线状态组件", type: "feature", status: "in_progress", updatedAt: "30m ago" },
        { id: "REQ-003", name: "WIP 统计", type: "feature", status: "pending", updatedAt: "1d ago" },
      ],
    },
    {
      id: "coding",
      name: "编码产线",
      status: "NOMINAL",
      throughput: 5,
      wip: 5,
      cycleTime: 1.8,
      pipeline: [
        { name: "架构设计", status: "done" },
        { name: "代码实现", status: "running" },
        { name: "代码审查", status: "running" },
        { name: "合并主干", status: "waiting" },
      ],
      deliverables: [
        { id: "COD-001", name: "MetricCard 组件", type: "component", status: "done", updatedAt: "1h ago" },
        { id: "COD-002", name: "KpiGrid 布局", type: "component", status: "done", updatedAt: "2h ago" },
        { id: "COD-003", name: "Metrics API", type: "api", status: "done", updatedAt: "3h ago" },
        { id: "COD-004", name: "DataTable 组件", type: "component", status: "in_progress", updatedAt: "15m ago" },
      ],
    },
    {
      id: "testing",
      name: "测试产线",
      status: "ATTENTION",
      throughput: 2,
      wip: 3,
      cycleTime: 3.5,
      pipeline: [
        { name: "用例编写", status: "done" },
        { name: "自动化测试", status: "running" },
        { name: "性能测试", status: "failed" },
        { name: "报告生成", status: "waiting" },
      ],
      deliverables: [
        { id: "TST-001", name: "MetricCard 测试", type: "test", status: "done", updatedAt: "4h ago" },
        { id: "TST-002", name: "KpiGrid 集成测试", type: "test", status: "in_progress", updatedAt: "1h ago" },
      ],
    },
    {
      id: "sre",
      name: "SRE 产线",
      status: "NOMINAL",
      throughput: 2,
      wip: 2,
      cycleTime: 4.2,
      pipeline: [
        { name: "监控部署", status: "done" },
        { name: "日志采集", status: "running" },
        { name: "告警配置", status: "waiting" },
        { name: "运维手册", status: "waiting" },
      ],
      deliverables: [
        { id: "SRE-001", name: "监控仪表盘", type: "infra", status: "done", updatedAt: "6h ago" },
        { id: "SRE-002", name: "日志管道", type: "infra", status: "in_progress", updatedAt: "3h ago" },
      ],
    },
  ]
}

export async function GET() {
  return NextResponse.json(generateLineStatus())
}
