import { NextResponse } from "next/server"

export interface WipItem {
  lineId: string
  name: string
  count: number
}

export type WipResponse = WipItem[]

export async function GET() {
  const wip: WipResponse = [
    { lineId: "requirement", name: "需求产线", count: 4 },
    { lineId: "coding", name: "编码产线", count: 5 },
    { lineId: "testing", name: "测试产线", count: 3 },
    { lineId: "sre", name: "SRE 产线", count: Math.random() > 0.5 ? 1 : 2 },
  ]

  return NextResponse.json(wip)
}
