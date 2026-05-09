import { NextResponse } from "next/server"
import type { SloData } from "@/types/factory"

const mockSlo: SloData = {
  targets: [
    { sli: "availability", description: "API 可用性", current: 99.97, target: 99.95, unit: "%", trend: "stable", withinSlo: true },
    { sli: "latency-p99", description: "P99 延迟", current: 68, target: 100, unit: "ms", trend: "down", withinSlo: true },
    { sli: "error-rate-5xx", description: "5xx 错误率", current: 0.047, target: 0.1, unit: "%", trend: "up", withinSlo: true },
    { sli: "throughput", description: "吞吐量", current: 920, target: 800, unit: "req/s", trend: "up", withinSlo: true },
    { sli: "latency-p50", description: "P50 延迟", current: 24, target: 50, unit: "ms", trend: "stable", withinSlo: true },
    { sli: "error-rate-4xx", description: "4xx 错误率", current: 1.2, target: 2.0, unit: "%", trend: "down", withinSlo: true },
    { sli: "uptime", description: "服务运行时间", current: 99.99, target: 99.9, unit: "%", trend: "stable", withinSlo: true },
    { sli: "circuit-breaker-trips", description: "熔断触发次数", current: 3, target: 0, unit: "次/天", trend: "up", withinSlo: false },
  ],
  summary: {
    totalSli: 8,
    withinSlo: 7,
  },
}

export async function GET() {
  return NextResponse.json({ type: "slo", data: mockSlo })
}
