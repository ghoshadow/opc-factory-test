import { NextResponse } from "next/server"
import type { MaturityResponse, MaturityDimension } from "@/types/factory"

const THRESHOLD = 70

const demoDimensions: MaturityDimension[] = [
  {
    name: "章节完整度",
    key: "chapter_completeness",
    score: 85,
    description: "User Story/AC/数据契约/UX雏形 四个章节是否齐全",
  },
  {
    name: "可测性",
    key: "testability",
    score: 78,
    description: "AC 是否包含 Given/When/Then，是否可被测试产线执行",
  },
  {
    name: "一致性",
    key: "consistency",
    score: 90,
    description: "术语是否一致、US 与 AC 是否对应、数据契约是否自洽",
  },
]

const alternateDimensions: MaturityDimension[] = [
  {
    name: "章节完整度",
    key: "chapter_completeness",
    score: 45,
    description: "User Story/AC/数据契约/UX雏形 四个章节是否齐全",
  },
  {
    name: "可测性",
    key: "testability",
    score: 65,
    description: "AC 是否包含 Given/When/Then，是否可被测试产线执行",
  },
  {
    name: "一致性",
    key: "consistency",
    score: 55,
    description: "术语是否一致、US 与 AC 是否对应、数据契约是否自洽",
  },
]

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const dimensions = id === "demo" ? demoDimensions : alternateDimensions
  const verdict = dimensions.every((d) => d.score >= THRESHOLD) ? "PASS" : "FAIL"

  const response: MaturityResponse = {
    specId: id,
    specTitle: id === "demo" ? "支付回调 退款处理 Spec v2.1" : `需求 Spec ${id}`,
    dimensions,
    threshold: THRESHOLD,
    verdict,
  }

  return NextResponse.json(response)
}
