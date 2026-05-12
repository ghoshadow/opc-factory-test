import { NextRequest, NextResponse } from "next/server"
import type { SignoffAction } from "@/types/spec"
import { specs, saveVersionSnapshot } from "@/lib/spec-store"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const spec = specs[id]

  if (!spec) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 })
  }

  if (spec.status !== "in_review") {
    return NextResponse.json(
      { error: "Spec is not in review — signoff not allowed" },
      { status: 409 }
    )
  }

  let body: SignoffAction
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { action, comment, reviewerName, timestamp } = body

  if (!action || !reviewerName || !String(reviewerName).trim() || !timestamp || !String(timestamp).trim()) {
    return NextResponse.json(
      { error: "action, reviewerName, and timestamp are required" },
      { status: 400 }
    )
  }

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json(
      { error: 'action must be "approve" or "reject"' },
      { status: 400 }
    )
  }

  if (action === "reject" && (!comment || comment.trim().length === 0)) {
    return NextResponse.json(
      { error: "comment is required when action is reject" },
      { status: 400 }
    )
  }

  const newStatus = action === "approve" ? "signed_off" : "rework"
  const newVersion = spec.version + 1
  const description =
    action === "approve"
      ? `签收 — 审核人: ${reviewerName} — 流转至编码产线`
      : `打回 — 审核人: ${reviewerName} — 回流需求产线。原因: ${comment}`

  specs[id] = {
    ...spec,
    status: newStatus,
    version: newVersion,
    changeTrace: [
      ...spec.changeTrace,
      {
        source: "signoff",
        timestamp,
        description,
        versionFrom: spec.version,
        versionTo: newVersion,
      },
    ],
  }

  saveVersionSnapshot(id)

  return NextResponse.json(specs[id])
}
