import { NextResponse } from "next/server"

export interface WipLine {
  key: string
  name: string
  count: number
  cssVar: string
}

export interface WipResponse {
  lines: WipLine[]
  total: number
}

const wipData: WipResponse = {
  lines: [
    { key: "requirement", name: "需求产线", count: 12, cssVar: "--chart-1" },
    { key: "coding", name: "编码产线", count: 23, cssVar: "--chart-2" },
    { key: "testing", name: "测试产线", count: 8, cssVar: "--chart-3" },
    { key: "sre", name: "SRE 产线", count: 3, cssVar: "--chart-4" },
  ],
  total: 46,
}

export async function GET() {
  return NextResponse.json(wipData)
}
