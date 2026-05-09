import { NextResponse } from "next/server"
import { productionLines } from "@/lib/mock-data"
import type { LineStatusData } from "@/types/factory"

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
  alerts: Alert[]
  lines: LineStatusData[]
}

const alerts: Alert[] = [
  { id: "a1", type: "warning", message: "编码产线存在异常: F-2341 Silent Gap", source: "编码产线", timestamp: new Date().toISOString() },
  { id: "a2", type: "info", message: "需求产线完成率超过 90%", source: "需求产线", timestamp: new Date().toISOString() },
  { id: "a3", type: "error", message: "测试产线 Pipeline 执行超时", source: "测试产线", timestamp: new Date().toISOString() },
]

function getLines(): LineStatusData[] {
  return productionLines.map((l) => ({
    id: l.id,
    name: l.name,
    opc: l.opc,
    function: l.function,
    wip: l.wip,
    completed: l.completed,
    anomaly: l.anomaly === "—" ? null : l.anomaly,
    status: l.status,
  }))
}

export async function GET() {
  const now = new Date().toISOString()

  const totalWip = productionLines.reduce((sum, l) => sum + l.wip, 0)
  const totalCompleted = productionLines.reduce((sum, l) => sum + l.completed, 0)
  const attentionLines = productionLines.filter((l) => l.status === "ATTENTION").length

  return NextResponse.json({
    timestamp: now,
    kpi: {
      totalWip,
      totalCompleted,
      attentionLines,
      activeRequirements: 3,
      pendingReviews: 5,
      todayDeployments: 2,
      systemHealth: attentionLines > 0 ? 66 : 88,
    },
    alerts,
    lines: getLines(),
  } satisfies MetricsResponse)
}
