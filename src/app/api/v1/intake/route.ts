import { NextRequest, NextResponse } from "next/server"
import type { IntakeItem, IntakePriority, IntakeStatus, IntakeType } from "@/types/requirement"

const mockItems: IntakeItem[] = [
  {
    id: "SYM-41",
    type: "功能需求",
    title: "Intake 队列页面",
    priority: "P0",
    status: "triaging",
    submittedAt: "2026-05-09T08:00:00Z",
    description: "实现 Intake 队列页面，展示所有入厂需求，支持按优先级排序和筛选。",
  },
  {
    id: "SYM-40",
    type: "初步需求",
    title: "L2 路由与导航",
    priority: "P1",
    status: "queued",
    submittedAt: "2026-05-08T10:30:00Z",
    description: "为 L2 需求管理层建立路由结构和导航入口。",
  },
  {
    id: "SYM-39",
    type: "技术需求",
    title: "DataTable 通用组件",
    priority: "P2",
    status: "queued",
    submittedAt: "2026-05-07T14:00:00Z",
    description: "实现通用的 DataTable 组件，支持排序和行点击。",
  },
  {
    id: "SYM-38",
    type: "Bug 报告",
    title: "MetricCard 趋势图标显示异常",
    priority: "P1",
    status: "queued",
    submittedAt: "2026-05-07T09:15:00Z",
    description: "在暗色主题下，MetricCard 的趋势图标对比度不足。",
  },
  {
    id: "SYM-37",
    type: "初步需求",
    title: "Spec 编辑器基础功能",
    priority: "P2",
    status: "accepted",
    submittedAt: "2026-05-06T16:45:00Z",
    description: "实现 Spec 文档的创建和编辑功能，支持 Markdown 预览。",
  },
  {
    id: "SYM-36",
    type: "功能需求",
    title: "Checker 自动验证流程",
    priority: "P0",
    status: "queued",
    submittedAt: "2026-05-06T11:00:00Z",
    description: "实现 Checker 自动验证流程，在编码产线完成后自动触发质量检查。",
  },
  {
    id: "SYM-35",
    type: "初步需求",
    title: "产线 Pipeline 可视化",
    priority: "P3",
    status: "queued",
    submittedAt: "2026-05-05T08:30:00Z",
    description: "为每条产线提供 Pipeline 流程可视化组件。",
  },
  {
    id: "SYM-34",
    type: "技术需求",
    title: "SWR 数据获取标准化",
    priority: "P3",
    status: "rejected",
    submittedAt: "2026-05-04T13:00:00Z",
    description: "标准化 SWR 数据获取模式，统一错误处理和 Loading 状态。",
  },
]

const priorityOrder: Record<IntakePriority, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const type = searchParams.get("type")
  const priority = searchParams.get("priority")

  let filtered = [...mockItems]

  if (status) {
    filtered = filtered.filter((item) => item.status === status)
  }
  if (type) {
    filtered = filtered.filter((item) => item.type === type)
  }
  if (priority) {
    filtered = filtered.filter((item) => item.priority === priority)
  }

  // Sort by priority: P0 > P1 > P2 > P3
  filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return NextResponse.json({ items: filtered, total: filtered.length })
}
