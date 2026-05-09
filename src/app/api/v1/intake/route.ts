import { NextResponse } from "next/server"
import { intakeSchema } from "@/lib/validations/intake"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "请求体必须为 JSON 格式" },
      { status: 400 }
    )
  }

  const parsed = intakeSchema.safeParse(body)

  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".")
      if (!fields[key]) {
        fields[key] = issue.message
      }
    }

    return NextResponse.json(
      { error: "请求参数校验失败", fields },
      { status: 400 }
    )
  }

  const { type, title, description, priority } = parsed.data

  const item = {
    id: crypto.randomUUID(),
    type,
    title,
    description,
    priority,
    status: "queued" as const,
    createdAt: new Date().toISOString(),
  }

  return NextResponse.json(item, { status: 201 })
}
