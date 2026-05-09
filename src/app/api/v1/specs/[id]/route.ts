import { NextRequest, NextResponse } from "next/server"
import type { MetaSpec } from "@/types/spec"
import { specs } from "../store"

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

  specs[id] = {
    ...specs[id],
    ...body,
    id: specs[id].id,
    version: specs[id].version + 1,
  }

  return NextResponse.json(specs[id])
}
