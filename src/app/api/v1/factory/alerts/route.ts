import { NextResponse } from "next/server"
import type { AlertData } from "@/types/factory"

const mockAlerts: AlertData[] = [
  {
    id: "F-2341",
    description: "Silent Gap — 需求产线 Spec 存在静默缺口",
    level: "warning",
    route: "OPC",
    target: "需求产线 OPC (陈)",
    time: "2026-05-09T09:00:00Z",
  },
  {
    id: "F-2360",
    description: "Drift — 编码产线 Spec-Code 漂移",
    level: "warning",
    route: "OPC",
    target: "编码产线 OPC (林)",
    time: "2026-05-09T09:30:00Z",
  },
  {
    id: "F-2371",
    description: "编码产线 CI 管道阻塞 — 最新提交未通过 Lint",
    level: "urgent",
    route: "OPC",
    target: "编码产线 OPC (林)",
    time: "2026-05-09T10:15:00Z",
  },
  {
    id: "F-2380",
    description: "SRE 产线部署失败 — 生产环境回滚",
    level: "urgent",
    route: "值班",
    target: "当值 SRE (李)",
    time: "2026-05-09T10:45:00Z",
  },
  {
    id: "F-2385",
    description: "测试产线用例积压 — 自动化测试队列超过阈值",
    level: "warning",
    route: "自动处置",
    target: "系统自愈触发",
    time: "2026-05-09T11:00:00Z",
  },
]

export async function GET() {
  return NextResponse.json(mockAlerts)
}
