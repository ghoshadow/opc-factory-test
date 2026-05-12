import { describe, it, expect, beforeEach, vi } from "vitest"
import { NextRequest } from "next/server"
import { GET, POST } from "@/app/api/v1/intake/route"

// ── Helpers ────────────────────────────────────────────────────────
function buildRequest(overrides: {
  url?: string
  body?: unknown
  method?: string
} = {}): NextRequest {
  const { url, body, method } = overrides
  const fullUrl = url ?? "http://localhost/api/v1/intake"
  return new NextRequest(fullUrl, {
    method: method ?? "GET",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
}

// ── GET ────────────────────────────────────────────────────────────
describe("GET /api/v1/intake", () => {
  it("returns all items sorted by priority (P0 → P3)", async () => {
    const response = await GET(buildRequest())
    const body = await response.json()

    expect(body.items).toBeDefined()
    expect(Array.isArray(body.items)).toBe(true)
    expect(body.items.length).toBeGreaterThan(0)
    expect(body.total).toBe(body.items.length)

    // Verify priority ordering
    const priorities = body.items.map((i: { priority: string }) => i.priority)
    const expected = [...priorities].sort()
    // P0 < P1 < P2 < P3 lexicographically after "P" prefix
    expect(priorities).toEqual(expected)
  })

  it("returns items with correct shape", async () => {
    const response = await GET(buildRequest())
    const body = await response.json()

    for (const item of body.items) {
      expect(item).toHaveProperty("id")
      expect(item).toHaveProperty("type")
      expect(item).toHaveProperty("title")
      expect(item).toHaveProperty("priority")
      expect(item).toHaveProperty("status")
      expect(item).toHaveProperty("submittedAt")
      expect(item).toHaveProperty("description")
    }
  })

  it("filters by status", async () => {
    const response = await GET(
      buildRequest({ url: "http://localhost/api/v1/intake?status=queued" }),
    )
    const body = await response.json()

    expect(body.items.length).toBeGreaterThan(0)
    for (const item of body.items) {
      expect(item.status).toBe("queued")
    }
  })

  it("filters by type", async () => {
    const response = await GET(
      buildRequest({ url: "http://localhost/api/v1/intake?type=Bug 报告" }),
    )
    const body = await response.json()

    expect(body.items.length).toBeGreaterThan(0)
    for (const item of body.items) {
      expect(item.type).toBe("Bug 报告")
    }
  })

  it("filters by priority", async () => {
    const response = await GET(
      buildRequest({ url: "http://localhost/api/v1/intake?priority=P0" }),
    )
    const body = await response.json()

    for (const item of body.items) {
      expect(item.priority).toBe("P0")
    }
  })

  it("returns empty items for unmatched filter", async () => {
    const response = await GET(
      buildRequest({ url: "http://localhost/api/v1/intake?status=nonexistent" }),
    )
    const body = await response.json()

    expect(body.items).toEqual([])
    expect(body.total).toBe(0)
  })
})

// ── POST ───────────────────────────────────────────────────────────
describe("POST /api/v1/intake", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("returns 201 with id, status=queued, and createdAt on valid input", async () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "550e8400-e29b-41d4-a716-446655440000",
    )

    const response = await POST(
      buildRequest({
        method: "POST",
        body: {
          type: "功能需求",
          title: "测试需求",
          description: "这是一个测试需求的描述，用于验证 API 是否正常工作。",
          priority: "P1",
        },
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.id).toBe("SYM-550e8400-e29b-41d4-a716-446655440000")
    expect(body.status).toBe("queued")
    expect(body.createdAt).toBeDefined()
    expect(new Date(body.createdAt).toISOString()).toBe(body.createdAt)
  })

  it("returns 400 with field errors when title is missing", async () => {
    const response = await POST(
      buildRequest({
        method: "POST",
        body: {
          type: "功能需求",
          title: "",
          description: "描述",
          priority: "P1",
        },
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe("参数验证失败")
    expect(body.fields).toBeDefined()
    expect(body.fields.title).toBeDefined()
  })

  it("returns 400 with field errors when type is invalid", async () => {
    const response = await POST(
      buildRequest({
        method: "POST",
        body: {
          type: "无效类型",
          title: "测试",
          description: "描述",
          priority: "P1",
        },
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.fields.type).toBeDefined()
  })

  it("returns 400 with field errors when description exceeds 5000 chars", async () => {
    const response = await POST(
      buildRequest({
        method: "POST",
        body: {
          type: "功能需求",
          title: "测试",
          description: "x".repeat(5001),
          priority: "P1",
        },
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.fields.description).toBeDefined()
  })

  it("returns 400 with field errors when priority is invalid", async () => {
    const response = await POST(
      buildRequest({
        method: "POST",
        body: {
          type: "功能需求",
          title: "测试",
          description: "描述",
          priority: "P5",
        },
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.fields.priority).toBeDefined()
  })

  it("returns 400 for malformed JSON body", async () => {
    const request = new NextRequest("http://localhost/api/v1/intake", {
      method: "POST",
      body: "not valid json",
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBeDefined()
  })
})
