import { NextRequest, NextResponse } from "next/server"
import type { SpecVersionsResponse } from "@/types/factory"
import { specs, getVersionList } from "@/lib/spec-store"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!specs[id]) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 })
  }

  const versions = getVersionList(id)

  const response: SpecVersionsResponse = { versions }
  return NextResponse.json(response)
}
