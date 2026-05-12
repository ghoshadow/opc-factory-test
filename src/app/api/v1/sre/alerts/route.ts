import { NextResponse } from "next/server"
import type { AlertsResponse, AlertRule } from "@/types/factory"

const alertRules: AlertRule[] = [
  {
    id: "alt-001",
    name: "支付网关 P99 延迟过高",
    description: "支付网关 P99 延迟超过 500ms",
    severity: "critical",
    source: "prometheus",
    threshold: "> 500ms",
    currentValue: "487ms",
    status: "ok",
    lastFired: "2026-05-09T08:30:00Z",
  },
  {
    id: "alt-002",
    name: "订单服务 5xx 率飙升",
    description: "订单服务 5xx 错误率超过 1%",
    severity: "critical",
    source: "grafana",
    threshold: "> 1%",
    currentValue: "2.3%",
    status: "firing",
    lastFired: "2026-05-10T15:00:00Z",
  },
  {
    id: "alt-003",
    name: "Redis 连接数接近上限",
    description: "Redis 连接数超过 80% 上限",
    severity: "warning",
    source: "prometheus",
    threshold: "> 80%",
    currentValue: "76%",
    status: "ok",
    lastFired: "2026-05-08T22:00:00Z",
  },
  {
    id: "alt-004",
    name: "通知服务推送延迟",
    description: "通知服务推送延迟超过 10s",
    severity: "warning",
    source: "grafana",
    threshold: "> 10s",
    currentValue: "12s",
    status: "firing",
    lastFired: "2026-05-10T14:45:00Z",
  },
  {
    id: "alt-005",
    name: "SSL 证书即将过期",
    description: "生产环境 SSL 证书 7 天后过期",
    severity: "info",
    source: "internal",
    threshold: "< 7 days",
    currentValue: "5 days",
    status: "firing",
    lastFired: "2026-05-09T00:00:00Z",
  },
  {
    id: "alt-006",
    name: "PostgreSQL 慢查询增多",
    description: "慢查询数量超过基准值",
    severity: "warning",
    source: "prometheus",
    threshold: "> 10/min",
    currentValue: "8/min",
    status: "ok",
    lastFired: "2026-05-07T14:00:00Z",
  },
]

export async function GET() {
  const firingCount = alertRules.filter((a) => a.status === "firing").length
  const response: AlertsResponse = {
    rules: alertRules,
    total: alertRules.length,
    firingCount,
  }
  return NextResponse.json(response)
}
