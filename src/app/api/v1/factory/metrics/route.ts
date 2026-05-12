import { NextResponse } from "next/server"
import { productionLines } from "@/lib/mock-data"
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

const phaseMap: Record<string, string> = {
  requirement: "Spec 产出",
  coding: "编码实现",
  testing: "回归测试",
  sre: "监控观察",
}

const milestoneMap: Record<string, string> = {
  requirement: "需求评审完成",
  coding: "PR 合并",
  testing: "测试通过",
  sre: "全量发布",
}

const wipLines: WipLine[] = [
  { key: "requirement", name: "需求产线", count: 12, cssVar: "--chart-1" },
  { key: "coding", name: "编码产线", count: 8, cssVar: "--chart-2" },
  { key: "testing", name: "测试产线", count: 5, cssVar: "--chart-3" },
  { key: "sre", name: "SRE 产线", count: 3, cssVar: "--chart-4" },
]

const mockAlerts: Alert[] = [
  {
    id: "alt-1",
    type: "warning",
    message: "编码产线检测到异常 F-2341 Silent Gap",
    source: "产线监控",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "alt-2",
    type: "info",
    message: "SRE 产线完成灰度发布，观察期剩余 30 分钟",
    source: "部署系统",
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: "alt-3",
    type: "error",
    message: "测试产线 E2E 用例执行超时，已触发重试",
    source: "测试框架",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
  },
]

export async function GET() {
  const wipTotal = wipLines.reduce((sum, l) => sum + l.count, 0)
  const totalCompleted = productionLines.reduce((sum, l) => sum + l.completed, 0)
  const attentionLines = productionLines.filter((l) => l.status !== "NOMINAL").length
  const activeInProgress = productionLines.filter(
    (l) => l.status === "NOMINAL" || l.status === "ATTENTION"
  ).length

  const lines: LineStatusData[] = productionLines.map((pl) => ({
    id: pl.id as LineStatusData["id"],
    line: (pl.id === "requirement" ? "requirement" : pl.id === "coding" ? "coding" : pl.id === "testing" ? "testing" : "sre") as LineStatusData["line"],
    name: pl.name,
    opc: pl.opc,
    function: pl.function,
    wip: pl.wip,
    completed: pl.completed,
    anomaly: pl.anomaly === "—" ? null : pl.anomaly,
    status: pl.status,
    activeItems: pl.wip,
    completedToday: Math.min(pl.completed, Math.floor(pl.completed / 7)),
    currentPhase: phaseMap[pl.id] ?? "运行中",
    nextMilestone: milestoneMap[pl.id] ?? "交付",
  }))

  const response: MetricsResponse = {
    timestamp: new Date().toISOString(),
    kpi: {
      totalWip: wipTotal,
      totalCompleted,
      attentionLines,
      activeRequirements: activeInProgress,
      pendingReviews: 7,
      todayDeployments: 3,
      systemHealth: attentionLines === 0 ? 92 : attentionLines === 1 ? 78 : 55,
    },
    wip: {
      lines: wipLines,
      total: wipTotal,
    },
    alerts: mockAlerts,
    lines,
  }

  return NextResponse.json(response)
}

export type { MetricsResponse, KpiData }
