import { NextRequest, NextResponse } from "next/server"
import type { IntakeItem, IntakePriority } from "@/types/requirement"
import { intakeSchema } from "@/lib/validations/intake"
import { getIntakeItems, addIntakeItem, nextIntakeId } from "@/lib/store/intake"

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

  let filtered = [...getIntakeItems()]

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = intakeSchema.safeParse(body)

    if (!parsed.success) {
      const fields: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".")
        if (!fields[key]) {
          fields[key] = issue.message
        }
      }
      return NextResponse.json({ error: "参数验证失败", fields }, { status: 400 })
    }

    const now = new Date().toISOString()
    const id = nextIntakeId()

    const newItem: IntakeItem = {
      id,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      status: "queued",
      submittedAt: now,
    }

    addIntakeItem(newItem)

    return NextResponse.json({ id, status: "queued", createdAt: now }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "请求体格式无效，需要 JSON 格式" }, { status: 400 })
  }
}
