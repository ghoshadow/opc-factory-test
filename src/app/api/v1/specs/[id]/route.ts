import { NextRequest, NextResponse } from "next/server"
import { specs, saveVersionSnapshot } from "@/lib/spec-store"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const spec = specs[id]

  if (!spec) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 })
  }

  return NextResponse.json(spec)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  if (!specs[id]) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 })
  }

  const prevVersion = specs[id].version
  specs[id] = {
    ...specs[id],
    ...body,
    id: specs[id].id,
    version: prevVersion + 1,
  }

  // Save a version snapshot for history
  saveVersionSnapshot(id)

  return NextResponse.json(specs[id])
}
