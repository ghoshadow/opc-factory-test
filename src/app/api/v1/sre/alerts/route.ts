import { NextRequest, NextResponse } from "next/server"
import type { AlertRule, AlertRuleListResponse } from "@/types/factory"
import { defaultRouting } from "@/lib/alert-constants"

const sampleRules: AlertRule[] = [
  {
    id: "ar-001",
    name: "F-2341: Silent Gap",
    metric: "spec_silent_gap_hours",
    condition: "gt",
    threshold: 48,
    severity: "warning",
    enabled: true,
    routing: [
      { target: "oncall", label: "SRE 值班人员", enabled: true },
      { target: "opc", label: "对应产线 OPC", enabled: true },
      { target: "auto_remediation", label: "自愈触发", enabled: false },
    ],
    description: "需求产线 Spec 静默缺口 — 超过 48h 未更新触发告警",
    createdAt: "2026-04-10T08:00:00Z",
    updatedAt: "2026-05-08T14:00:00Z",
  },
  {
    id: "ar-002",
    name: "F-2360: Spec-Code Drift",
    metric: "spec_code_drift_pct",
    condition: "gt",
    threshold: 10,
    severity: "critical",
    enabled: true,
    routing: [
      { target: "oncall", label: "SRE 值班人员", enabled: true },
      { target: "opc", label: "对应产线 OPC", enabled: true },
      { target: "auto_remediation", label: "自愈触发", enabled: true },
    ],
    description: "Spec-Code 漂移超过 10% 阈值触发严重告警",
    createdAt: "2026-04-12T09:00:00Z",
    updatedAt: "2026-05-09T10:00:00Z",
  },
  {
    id: "ar-003",
    name: "支付回调 5xx 率",
    metric: "payment_callback_5xx_rate",
    condition: "gt",
    threshold: 0.1,
    severity: "critical",
    enabled: true,
    routing: [
      { target: "oncall", label: "SRE 值班人员", enabled: true },
      { target: "opc", label: "对应产线 OPC", enabled: false },
      { target: "auto_remediation", label: "自愈触发", enabled: false },
    ],
    description: "支付回调 5xx 错误率超过 0.1%",
    createdAt: "2026-04-15T10:00:00Z",
    updatedAt: "2026-05-07T16:00:00Z",
  },
  {
    id: "ar-004",
    name: "订单服务 P99 延迟",
    metric: "order_service_p99_latency_ms",
    condition: "gt",
    threshold: 500,
    severity: "warning",
    enabled: true,
    routing: [
      { target: "oncall", label: "SRE 值班人员", enabled: true },
      { target: "opc", label: "对应产线 OPC", enabled: false },
      { target: "auto_remediation", label: "自愈触发", enabled: false },
    ],
    description: "订单服务 P99 延迟超过 500ms",
    createdAt: "2026-04-20T11:00:00Z",
    updatedAt: "2026-05-06T12:00:00Z",
  },
]

export async function GET() {
  const response: AlertRuleListResponse = {
    rules: sampleRules,
    total: sampleRules.length,
  }
  return NextResponse.json(response)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newRule: AlertRule = {
      id: `ar-${Date.now()}`,
      name: body.name || "未命名规则",
      metric: body.metric || "",
      condition: body.condition || "gt",
      threshold: body.threshold ?? 0,
      severity: body.severity || "warning",
      enabled: body.enabled ?? true,
      routing: body.routing || defaultRouting,
      description: body.description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    sampleRules.push(newRule)
    return NextResponse.json(newRule, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const idx = sampleRules.findIndex((r) => r.id === id)
    if (idx === -1) {
      return NextResponse.json({ error: "Alert rule not found" }, { status: 404 })
    }
    sampleRules[idx] = {
      ...sampleRules[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return NextResponse.json(sampleRules[idx])
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body
    const idx = sampleRules.findIndex((r) => r.id === id)
    if (idx === -1) {
      return NextResponse.json({ error: "Alert rule not found" }, { status: 404 })
    }
    const removed = sampleRules.splice(idx, 1)[0]
    return NextResponse.json(removed)
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
}
