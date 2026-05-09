import { NextResponse } from "next/server"

interface WipLine {
  key: string
  name: string
  count: number
  cssVar: string
}

interface WipResponse {
  lines: WipLine[]
  total: number
}

const wipData: WipResponse = {
  lines: [
    { key: "requirement", name: "需求产线", count: 4, cssVar: "--chart-1" },
    { key: "coding", name: "编码产线", count: 5, cssVar: "--chart-2" },
    { key: "testing", name: "测试产线", count: 3, cssVar: "--chart-3" },
    { key: "sre", name: "SRE 产线", count: 0, cssVar: "--chart-4" },
  ],
  total: 12,
}

export async function GET() {
  return NextResponse.json(wipData)
}
