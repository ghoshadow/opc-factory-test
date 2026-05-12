import { NextResponse } from "next/server"
import type { RollbackResponse, RollbackTarget } from "@/types/factory"

const rollbackTargets: RollbackTarget[] = [
  {
    id: "rbk-001",
    service: "payment-gateway",
    currentVersion: "v3.2.1",
    targetVersion: "v3.1.0",
    readiness: "ready",
    estimatedDowntime: "< 2 min",
    lastValidated: "2026-05-10T14:30:00Z",
  },
  {
    id: "rbk-002",
    service: "order-service",
    currentVersion: "v2.8.0",
    targetVersion: "v2.7.5",
    readiness: "ready",
    estimatedDowntime: "< 3 min",
    lastValidated: "2026-05-10T12:00:00Z",
  },
  {
    id: "rbk-003",
    service: "notification-service",
    currentVersion: "v1.5.3",
    targetVersion: "v1.5.2",
    readiness: "ready",
    estimatedDowntime: "< 1 min",
    lastValidated: "2026-05-10T10:00:00Z",
  },
  {
    id: "rbk-004",
    service: "auth-service",
    currentVersion: "v4.0.0",
    targetVersion: "v3.9.1",
    readiness: "preparing",
    estimatedDowntime: "< 5 min",
    lastValidated: "2026-05-09T18:00:00Z",
  },
  {
    id: "rbk-005",
    service: "inventory-service",
    currentVersion: "v2.1.0",
    targetVersion: "v2.0.0",
    readiness: "not_ready",
    estimatedDowntime: "未知",
    lastValidated: "2026-05-08T09:00:00Z",
  },
]

export async function GET() {
  const readyCount = rollbackTargets.filter((t) => t.readiness === "ready").length
  const response: RollbackResponse = {
    targets: rollbackTargets,
    total: rollbackTargets.length,
    readyCount,
  }
  return NextResponse.json(response)
}
