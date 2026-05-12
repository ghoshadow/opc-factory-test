import { NextResponse } from "next/server"
import type { ObservabilityResponse, MetricSeries } from "@/types/factory"

const metricsData: MetricSeries[] = [
  {
    name: "P99 延迟",
    value: 245,
    unit: "ms",
    trend: "up",
    changePercent: 12.5,
  },
  {
    name: "5xx 错误率",
    value: 0.03,
    unit: "%",
    trend: "down",
    changePercent: -15.2,
  },
  {
    name: "QPS",
    value: 2840,
    unit: "req/s",
    trend: "stable",
    changePercent: 0.8,
  },
  {
    name: "可用性",
    value: 99.97,
    unit: "%",
    trend: "stable",
    changePercent: 0.01,
  },
  {
    name: "CPU 使用率",
    value: 68,
    unit: "%",
    trend: "up",
    changePercent: 8.3,
  },
  {
    name: "内存使用率",
    value: 72,
    unit: "%",
    trend: "up",
    changePercent: 5.7,
  },
]

export async function GET() {
  const response: ObservabilityResponse = {
    metrics: metricsData,
    lastUpdated: new Date().toISOString(),
  }
  return NextResponse.json(response)
}
