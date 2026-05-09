import { NextResponse } from "next/server"
import type { ReflowStatusResponse, ReflowTimelineEntry } from "@/types/factory"

// In-memory store for reflow status timelines
const statusStore: Record<string, ReflowTimelineEntry[]> = {
  "BUG-201": [
    {
      id: "t1",
      status: "open",
      label: "Bug 单生成",
      description: "Incident Agent 检测到支付回调超时告警，自动生成 Bug 单",
      timestamp: "2026-05-09T08:15:00Z",
    },
  ],
  "BUG-202": [
    {
      id: "t1",
      status: "open",
      label: "Bug 单生成",
      description: "SRE 监控系统检测到连接池耗尽告警，自动创建 Bug 单",
      timestamp: "2026-05-09T09:30:00Z",
    },
  ],
  "BUG-203": [
    {
      id: "t1",
      status: "open",
      label: "Bug 单生成",
      description: "Incident Agent 检测到首页响应超时告警，自动生成 Bug 单",
      timestamp: "2026-05-08T14:00:00Z",
    },
    {
      id: "t2",
      status: "reflowed_to_intake",
      label: "已回流至 Intake",
      description: "SRE OPC 确认 Bug 内容并回流至需求产线 Intake",
      timestamp: "2026-05-08T14:30:00Z",
    },
    {
      id: "t3",
      status: "coding_in_progress",
      label: "编码产线处理中",
      description: "需求产线已接收，编码产线正在进行修复",
      timestamp: "2026-05-09T10:00:00Z",
    },
  ],
  "BUG-204": [
    {
      id: "t1",
      status: "open",
      label: "Bug 单生成",
      description: "SRE 监控检测到 Kafka 消费延迟告警",
      timestamp: "2026-05-07T11:00:00Z",
    },
    {
      id: "t2",
      status: "reflowed_to_intake",
      label: "已回流至 Intake",
      description: "SRE OPC 确认 Bug 内容并回流至需求产线",
      timestamp: "2026-05-07T11:20:00Z",
    },
    {
      id: "t3",
      status: "coding_in_progress",
      label: "编码产线处理中",
      description: "编码产线已接收，进行 consumer 扩容和代码修复",
      timestamp: "2026-05-07T14:00:00Z",
    },
    {
      id: "t4",
      status: "fixed",
      label: "已修复",
      description: "consumer 扩容至 20 实例，添加积压监控告警规则",
      timestamp: "2026-05-08T09:00:00Z",
    },
  ],
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const timeline = statusStore[id]

  if (!timeline) {
    return NextResponse.json({ error: "Bug not found" }, { status: 404 })
  }

  const currentStatus = timeline[timeline.length - 1].status
  const response: ReflowStatusResponse = {
    bugId: id,
    status: currentStatus,
    timeline,
  }
  return NextResponse.json(response)
}
