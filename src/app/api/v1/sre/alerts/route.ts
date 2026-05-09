import { NextResponse } from "next/server"
import type { AlertRule, AlertRuleListResponse } from "@/types/factory"

const rules: AlertRule[] = [
  {
    id: "F-2341",
    name: "Silent Gap",
    metric: "需求产线 Spec 沉默缺口",
    condition: "上次 Spec 更新时间 > 72h",
    threshold: "72h",
    notifyTarget: "需求产线 OPC + SRE 值班",
    routing: "opc",
    enabled: true,
    description: "需求产线 Spec 超过 72 小时未更新时触发告警，提示可能存在需求停滞",
  },
  {
    id: "F-2360",
    name: "Drift",
    metric: "Spec-Code 漂移超阈值",
    condition: "漂移度 > 0.3",
    threshold: "0.3",
    notifyTarget: "编码产线 OPC + SRE 值班",
    routing: "opc",
    enabled: true,
    description: "Spec 与代码实现之间的漂移度超过 0.3 时触发，提示需要同步",
  },
  {
    id: "F-3001",
    name: "High 5xx Rate",
    metric: "支付回调 5xx 率",
    condition: "5xx 率 > 1% (窗口 5min)",
    threshold: "1%",
    notifyTarget: "SRE 值班人员",
    routing: "oncall",
    enabled: true,
    description: "支付回调接口 5xx 错误率超过 1% 时立即通知值班人员",
  },
  {
    id: "F-3002",
    name: "DB Connection Pool",
    metric: "数据库连接池使用率",
    condition: "使用率 > 85%",
    threshold: "85%",
    notifyTarget: "自动扩容触发",
    routing: "auto",
    enabled: true,
    description: "数据库连接池使用率超过 85% 时自动触发扩容，无需人工介入",
  },
  {
    id: "F-3003",
    name: "Order Latency Spike",
    metric: "订单接口 P99 延迟",
    condition: "P99 延迟 > 500ms",
    threshold: "500ms",
    notifyTarget: "SRE 值班 + 编码产线 OPC",
    routing: "oncall",
    enabled: false,
    description: "订单接口 P99 延迟超过 500ms 时通知值班和编码产线 OPC",
  },
  {
    id: "F-3004",
    name: "Redis Memory",
    metric: "Redis 内存使用率",
    condition: "内存使用率 > 90%",
    threshold: "90%",
    notifyTarget: "自动扩容触发",
    routing: "auto",
    enabled: true,
    description: "Redis 内存使用率超过 90% 时自动触发内存扩容",
  },
]

export async function GET() {
  const response: AlertRuleListResponse = {
    rules,
    total: rules.length,
  }
  return NextResponse.json(response)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, metric, condition, threshold, notifyTarget, routing, enabled, description } = body as Partial<AlertRule>

    if (!name || !metric || !condition || !threshold || !notifyTarget || !routing) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["oncall", "opc", "auto"].includes(routing)) {
      return NextResponse.json({ error: "Invalid routing value" }, { status: 400 })
    }

    const newRule: AlertRule = {
      id: `F-${3000 + rules.length + 1}`,
      name: name!,
      metric: metric!,
      condition: condition!,
      threshold: threshold!,
      notifyTarget: notifyTarget!,
      routing: routing as AlertRule["routing"],
      enabled: enabled ?? true,
      description: description ?? "",
    }

    rules.push(newRule)
    return NextResponse.json(newRule, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...fields } = body as Partial<AlertRule> & { id: string }

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const index = rules.findIndex((r) => r.id === id)
    if (index === -1) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 })
    }

    if (fields.routing && !["oncall", "opc", "auto"].includes(fields.routing)) {
      return NextResponse.json({ error: "Invalid routing value" }, { status: 400 })
    }

    rules[index] = { ...rules[index], ...fields }
    return NextResponse.json(rules[index])
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { id } = body as { id: string }

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const index = rules.findIndex((r) => r.id === id)
    if (index === -1) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 })
    }

    rules.splice(index, 1)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
