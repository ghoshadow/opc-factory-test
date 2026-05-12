import { NextResponse } from "next/server"
import type { ReflowRequest, ReflowStatusResponse, ReflowTimelineEntry } from "@/types/factory"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json() as ReflowRequest

    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "标题和描述不能为空" },
        { status: 400 }
      )
    }

    // Simulate reflow processing
    const newEntry: ReflowTimelineEntry = {
      id: `t-${Date.now()}`,
      status: "reflowed_to_intake",
      label: "已回流至 Intake",
      description: `SRE OPC 确认 Bug 内容并回流至需求产线 Intake（标题: ${body.title}）`,
      timestamp: new Date().toISOString(),
    }

    const timeline: ReflowTimelineEntry[] = [
      {
        id: "t1",
        status: "open",
        label: "Bug 单生成",
        description: "Incident Agent / SRE 监控自动生成 Bug 单",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      newEntry,
    ]

    const response: ReflowStatusResponse = {
      bugId: id,
      status: "reflowed_to_intake",
      timeline,
    }

    return NextResponse.json(response)
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 })
  }
}
