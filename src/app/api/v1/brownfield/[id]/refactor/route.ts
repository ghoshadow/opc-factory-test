import { NextRequest, NextResponse } from "next/server"
import type { RefactorConfirmRequest, RefactorConfirmResponse, RefactorPhase } from "@/types/factory"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body: RefactorConfirmRequest = await req.json()

  if (body.action !== "confirm" && body.action !== "execute") {
    return NextResponse.json(
      { error: "action 必须为 confirm 或 execute" },
      { status: 400 }
    )
  }

  const phase: RefactorPhase = body.action === "confirm" ? "analyzing" : "refactoring"

  const response: RefactorConfirmResponse = {
    id,
    phase,
    message:
      body.action === "confirm"
        ? `重构计划已确认，开始分析阶段。变更范围: 4 个文件，预估 ${6}h`
        : `重构已开始执行，当前阶段: ${phase}`,
  }

  return NextResponse.json(response)
}
