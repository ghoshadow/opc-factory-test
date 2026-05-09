import { NextResponse } from "next/server"
import type { LineStatusData } from "@/types/factory"

const mockData: LineStatusData[] = [
  {
    id: "requirements",
    name: "需求产线",
    opc: "陈",
    function: "Spec 产出与审核",
    wip: 4,
    completed: 89,
    anomaly: null,
    status: "NOMINAL",
  },
  {
    id: "coding",
    name: "编码产线",
    opc: "林",
    function: "计划评审 · 设计评审 · 实现 · PR",
    wip: 5,
    completed: 156,
    anomaly: "F-2341 Silent Gap",
    status: "ATTENTION",
  },
  {
    id: "testing",
    name: "测试产线",
    opc: "王",
    function: "测试规划 · 执行 · 缺陷报告",
    wip: 3,
    completed: 42,
    anomaly: null,
    status: "NOMINAL",
  },
  {
    id: "sre",
    name: "SRE 产线",
    opc: "李",
    function: "部署 · 监控 · 事件响应",
    wip: 0,
    completed: 17,
    anomaly: null,
    status: "NOMINAL",
  },
]

export async function GET() {
  return NextResponse.json(mockData)
}
