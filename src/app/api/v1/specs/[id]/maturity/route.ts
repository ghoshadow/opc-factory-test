import { NextResponse } from "next/server"
import type { MaturityReviewResponse, MaturityDimension } from "@/types/requirement"
import { specs } from "@/lib/spec-store"

function generateMockReview(specId: string, specTitle: string): MaturityReviewResponse {
  const dimensions: MaturityDimension[] = [
    {
      key: "completeness",
      name: "完整性",
      score: 78,
      maxScore: 100,
      status: "warning",
      details: [
        "User Story 已定义核心流程",
        "验收标准覆盖主路径，边界场景缺失（未定义错误状态）",
        "数据契约输入/输出字段完整，约束描述需加强",
      ],
    },
    {
      key: "testability",
      name: "可测试性",
      score: 65,
      maxScore: 100,
      status: "warning",
      details: [
        "AC 格式符合 Given-When-Then，部分条件不够具体",
        "数据契约字段类型明确，缺少无效输入测试用例",
        "UX 雏形偏抽象，难以提取可操作的测试步骤",
      ],
    },
    {
      key: "consistency",
      name: "一致性",
      score: 90,
      maxScore: 100,
      status: "pass",
      details: [
        "AC 与 User Story 目标对齐",
        "数据契约字段与 UX 雏形一致",
        "术语使用统一，无冲突",
      ],
    },
    {
      key: "clarity",
      name: "清晰度",
      score: 72,
      maxScore: 100,
      status: "warning",
      details: [
        "User Story 角色与目标明确",
        "AC 部分步骤描述冗长，可拆分",
        "UX 雏形缺少交互状态说明",
      ],
    },
  ]

  const overallScore = Math.round(
    dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
  )
  const threshold = 80
  const passed = overallScore >= threshold

  return {
    specId,
    specTitle,
    dimensions,
    overallScore,
    threshold,
    passed,
    reviewedAt: new Date().toISOString(),
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const spec = specs[id]

  if (!spec) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 })
  }

  const review = generateMockReview(id, `Spec: ${id}`)
  return NextResponse.json(review)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const spec = specs[id]

  if (!spec) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 })
  }

  // Simulate re-evaluation: random score shift ±5
  const review = generateMockReview(id, `Spec: ${id}`)

  return NextResponse.json(review)
}
