import { NextResponse } from "next/server"
import type { DeployResponse, DeployRecord } from "@/types/factory"

const deployData: DeployRecord[] = [
  {
    id: "dpl-001",
    version: "v3.2.1",
    service: "payment-gateway",
    environment: "production",
    status: "success",
    startedAt: "2026-05-10T14:30:00Z",
    completedAt: "2026-05-10T14:38:00Z",
    triggeredBy: "张三",
    commitSha: "a1b2c3d",
  },
  {
    id: "dpl-002",
    version: "v2.8.0",
    service: "order-service",
    environment: "production",
    status: "in_progress",
    startedAt: "2026-05-10T15:00:00Z",
    completedAt: null,
    triggeredBy: "李四",
    commitSha: "e4f5g6h",
  },
  {
    id: "dpl-003",
    version: "v1.5.3",
    service: "notification-service",
    environment: "production",
    status: "success",
    startedAt: "2026-05-10T13:00:00Z",
    completedAt: "2026-05-10T13:05:00Z",
    triggeredBy: "张三",
    commitSha: "i7j8k9l",
  },
  {
    id: "dpl-004",
    version: "v4.0.0",
    service: "auth-service",
    environment: "production",
    status: "failed",
    startedAt: "2026-05-10T12:00:00Z",
    completedAt: "2026-05-10T12:15:00Z",
    triggeredBy: "王五",
    commitSha: "m0n1o2p",
  },
  {
    id: "dpl-005",
    version: "v2.1.0",
    service: "inventory-service",
    environment: "staging",
    status: "rolled_back",
    startedAt: "2026-05-09T18:00:00Z",
    completedAt: "2026-05-09T18:10:00Z",
    triggeredBy: "赵六",
    commitSha: "q3r4s5t",
  },
]

export async function GET() {
  const successCount = deployData.filter((d) => d.status === "success").length
  const response: DeployResponse = {
    deploys: deployData,
    total: deployData.length,
    successRate: Math.round((successCount / deployData.length) * 100),
  }
  return NextResponse.json(response)
}
