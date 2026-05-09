import { NextResponse } from "next/server"
import type { LineStatusData } from "@/types/factory"

interface WipLine {
  key: string
  name: string
  count: number
  cssVar: string
}

interface Alert {
  id: string
  type: "warning" | "error" | "info"
  message: string
  source: string
  timestamp: string
}

interface KpiData {
  totalWip: number
  totalCompleted: number
  attentionLines: number
  activeRequirements: number
  pendingReviews: number
  todayDeployments: number
  systemHealth: number
}

interface MetricsResponse {
  timestamp: string
  kpi: KpiData
  wip: { lines: WipLine[]; total: number }
  alerts: Alert[]
  lines: LineStatusData[]
}

const linesData: LineStatusData[] = [
  {
    id: "requirements",
    name: "需求产线",
    opc: "陈",
    function: "需求摄入 · Spec 撰写 · 成熟度审查 · 本体录入",
    wip: 12,
    completed: 89,
    anomaly: null,
    status: "NOMINAL",
  },
  {
    id: "coding",
    name: "编码产线",
    opc: "林",
    function: "计划评审 · 设计评审 · 实现 · PR",
    wip: 23,
    completed: 156,
    anomaly: "F-2341 Silent Gap",
    status: "ATTENTION",
  },
  {
    id: "testing",
    name: "测试产线",
    opc: "王",
    function: "测试规划 · 用例执行 · 缺陷报告",
    wip: 8,
    completed: 42,
    anomaly: null,
    status: "NOMINAL",
  },
  {
    id: "sre",
    name: "SRE 产线",
    opc: "李",
    function: "部署编排 · 监控告警 · 事件响应",
    wip: 3,
    completed: 17,
    anomaly: null,
    status: "NOMINAL",
  },
]

const wipData = {
  lines: [
    { key: "requirement", name: "需求产线", count: 12, cssVar: "--chart-1" },
    { key: "coding", name: "编码产线", count: 23, cssVar: "--chart-2" },
    { key: "testing", name: "测试产线", count: 8, cssVar: "--chart-3" },
    { key: "sre", name: "SRE 产线", count: 3, cssVar: "--chart-4" },
  ],
  total: 46,
}

const alertsData: Alert[] = [
  {
    id: "alt-1",
    type: "warning",
    message: "编码产线存在静默差距 F-2341，建议立即评审",
    source: "编码产线",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "alt-2",
    type: "warning",
    message: "编码产线 WIP 超过 20，接近并发上限",
    source: "编码产线",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "alt-3",
    type: "info",
    message: "SRE 产线连续 3 天无新部署事件",
    source: "SRE 产线",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "alt-4",
    type: "info",
    message: "需求产线新增 3 条 Backlog 需求待评估",
    source: "需求产线",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
]

export async function GET() {
  const totalWip = linesData.reduce((s, l) => s + l.wip, 0)
  const totalCompleted = linesData.reduce((s, l) => s + l.completed, 0)
  const attentionLines = linesData.filter((l) => l.status === "ATTENTION").length
  const nominalCount = linesData.length - attentionLines
  const systemHealth = linesData.length > 0
    ? Math.round((nominalCount / linesData.length) * 100)
    : 0

  const response: MetricsResponse = {
    timestamp: new Date().toISOString(),
    kpi: {
      totalWip,
      totalCompleted,
      attentionLines,
      activeRequirements: 24,
      pendingReviews: 7,
      todayDeployments: 3,
      systemHealth,
    },
    wip: wipData,
    alerts: alertsData,
    lines: linesData,
  }

  return NextResponse.json(response)
}
