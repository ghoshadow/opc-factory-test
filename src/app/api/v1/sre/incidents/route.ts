import { NextResponse } from "next/server"
import type { IncidentResponse, Incident } from "@/types/factory"

const incidents: Incident[] = [
  {
    id: "inc-001",
    title: "支付服务间歇性超时",
    severity: "critical",
    status: "investigating",
    service: "payment-gateway",
    openedAt: "2026-05-10T15:00:00Z",
    owner: "张三",
  },
  {
    id: "inc-002",
    title: "订单服务 5xx 错误率飙升",
    severity: "critical",
    status: "open",
    service: "order-service",
    openedAt: "2026-05-10T14:30:00Z",
    owner: "李四",
  },
  {
    id: "inc-003",
    title: "通知推送延迟升高",
    severity: "warning",
    status: "mitigated",
    service: "notification-service",
    openedAt: "2026-05-10T12:00:00Z",
    owner: "王五",
  },
  {
    id: "inc-004",
    title: "Redis 内存使用率过高",
    severity: "warning",
    status: "resolved",
    service: "redis-cache",
    openedAt: "2026-05-09T20:00:00Z",
    owner: "赵六",
  },
  {
    id: "inc-005",
    title: "SSL 证书即将过期",
    severity: "info",
    status: "open",
    service: "infrastructure",
    openedAt: "2026-05-09T00:00:00Z",
    owner: "张三",
  },
  {
    id: "inc-006",
    title: "数据库连接池耗尽",
    severity: "critical",
    status: "resolved",
    service: "postgresql",
    openedAt: "2026-05-08T16:00:00Z",
    owner: "李四",
  },
]

export async function GET() {
  const openCount = incidents.filter((i) => i.status === "open" || i.status === "investigating").length
  const response: IncidentResponse = {
    incidents,
    total: incidents.length,
    openCount,
  }
  return NextResponse.json(response)
}
