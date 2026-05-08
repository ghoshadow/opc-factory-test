import { NextResponse } from "next/server"

export interface FactoryMetrics {
  activeLines: { count: number; names: string[] }
  throughput: { value: number; unit: string; trend: "up" | "down" | "stable"; trendValue: number }
  weeklyDelivery: { value: number; trend: "up" | "down" | "stable"; trendValue: number }
  avgCycleTime: { value: number; unit: string; trend: "up" | "down" | "stable" }
  autoPassRate: { value: number; unit: string; trend: "up" | "down" | "stable" }
  opcInterventions: { value: number }
  capacityUtilization: { value: number; unit: string; trend: "up" | "down" | "stable" }
  tokenConsumption: { value: number; unit: string; costUSD: number }
  repoInventory: { count: number; trend: "up" | "down" | "stable" }
}

function generateMetrics(): FactoryMetrics {
  const throughputBase = 12
  const weeklyBase = 7
  const throughputDelta = Math.round((Math.random() * 4 - 1) * 10) / 10
  const weeklyDelta = Math.round((Math.random() * 3 - 1) * 10) / 10

  return {
    activeLines: { count: 4, names: ["需求产线", "编码产线", "测试产线", "SRE产线"] },
    throughput: {
      value: throughputBase,
      unit: "feat/wk",
      trend: throughputDelta > 0 ? "up" : throughputDelta < 0 ? "down" : "stable",
      trendValue: Math.abs(throughputDelta),
    },
    weeklyDelivery: {
      value: weeklyBase,
      trend: weeklyDelta > 0 ? "up" : weeklyDelta < 0 ? "down" : "stable",
      trendValue: Math.abs(weeklyDelta),
    },
    avgCycleTime: { value: 2.4, unit: "hr", trend: "stable" },
    autoPassRate: { value: 87, unit: "%", trend: "up" },
    opcInterventions: { value: 3 },
    capacityUtilization: { value: 82, unit: "%", trend: "up" },
    tokenConsumption: { value: 3.4, unit: "M tok/day", costUSD: 12.8 },
    repoInventory: { count: 7, trend: "up" },
  }
}

export async function GET() {
  return NextResponse.json(generateMetrics())
}
