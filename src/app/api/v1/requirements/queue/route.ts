import { NextRequest, NextResponse } from "next/server"
import type { QueueItem, QueueResponse } from "@/types/requirement"
import { getIntakeItems } from "@/lib/store/intake"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const priority = searchParams.get("priority")

  // Get accepted items from intake store
  const acceptedIntake = getIntakeItems().filter(
    (item) => item.status === "accepted"
  )

  // Build queue items with specId linking
  let items: QueueItem[] = acceptedIntake.map((item) => ({
    id: `Q-${item.id}`,
    intakeId: item.id,
    title: item.title,
    type: item.type,
    priority: item.priority,
    status: "queued" as const,
    acceptedAt: new Date().toISOString(),
    specId: item.id === "SYM-37" ? "spec-001" : undefined,
  }))

  // Filter
  if (status) {
    items = items.filter((item) => item.status === status)
  }
  if (priority) {
    items = items.filter((item) => item.priority === priority)
  }

  // Sort by priority
  const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 }
  items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  const response: QueueResponse = { items, total: items.length }
  return NextResponse.json(response)
}
