import { NextRequest, NextResponse } from "next/server"
import type { InstallSkillRequest, InstallSkillResponse, SkillStatus } from "@/types/factory"
import { updateSkillStatus, getSkillById } from "@/data/skills"

export async function POST(request: NextRequest) {
  const body: InstallSkillRequest = await request.json()

  if (!body.skillId || !body.action) {
    return NextResponse.json(
      { error: "skillId and action are required" },
      { status: 400 }
    )
  }

  if (body.action !== "install" && body.action !== "uninstall") {
    return NextResponse.json(
      { error: "action must be 'install' or 'uninstall'" },
      { status: 400 }
    )
  }

  const existing = getSkillById(body.skillId)
  if (!existing) {
    return NextResponse.json(
      { error: "skill not found" },
      { status: 404 }
    )
  }

  const newStatus: SkillStatus = body.action === "install" ? "installed" : "available"
  updateSkillStatus(body.skillId, newStatus)

  const response: InstallSkillResponse = { skillId: body.skillId, status: newStatus }
  return NextResponse.json(response)
}
