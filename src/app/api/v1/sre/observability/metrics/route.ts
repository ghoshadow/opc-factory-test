import { NextResponse } from "next/server"
import type { MetricsData } from "@/types/factory"

const mockMetrics: MetricsData = {
  metrics: Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0")
    return {
      timestamp: `2026-05-10T${hour}:00:00Z`,
      throughput: Math.round(800 + Math.sin(i / 4) * 200 + Math.random() * 100),
      latency: Math.round(45 + Math.cos(i / 3) * 20 + Math.random() * 15),
      errorRate: parseFloat((0.02 + Math.abs(Math.sin(i / 6)) * 0.05 + Math.random() * 0.02).toFixed(3)),
    }
  }),
  summary: {
    avgThroughput: 920,
    p99Latency: 68,
    avgErrorRate: 0.047,
  },
}

export async function GET() {
  return NextResponse.json({ type: "metrics", data: mockMetrics })
}
