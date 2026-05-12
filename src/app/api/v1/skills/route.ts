import { NextRequest, NextResponse } from "next/server"
import type { LineId, SkillsResponse } from "@/types/factory"
import { getSkills } from "@/data/skills"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const line = searchParams.get("line") as LineId | null

  const all = getSkills()
  const filtered = line ? all.filter((s) => s.line === line) : all

  const response: SkillsResponse = { skills: filtered }
  return NextResponse.json(response)
}
