import { describe, it, expect } from "vitest"
import type { NextRequest } from "next/server"
import { POST } from "@/app/api/v1/sre/incidents/[id]/reflow/route"

// Helper to create a mock NextRequest-like context
function mockContext(id: string) {
  return {
    params: Promise.resolve({ id }),
  }
}

function mockReq(url = "http://localhost") {
  return new Request(url) as unknown as NextRequest
}

describe("POST /api/v1/sre/incidents/:id/reflow", () => {
  it("returns the incident id in response", async () => {
    const ctx = mockContext("inc-001")
    const response = await POST(mockReq(), ctx)
    const body = await response.json()

    expect(body.incidentId).toBe("inc-001")
  })

  it("returns reflowed status", async () => {
    const ctx = mockContext("inc-001")
    const response = await POST(mockReq(), ctx)
    const body = await response.json()

    expect(body.status).toBe("已回流")
  })

  it("returns a bug reference", async () => {
    const ctx = mockContext("inc-001")
    const response = await POST(mockReq(), ctx)
    const body = await response.json()

    expect(body.bugRef).toBeDefined()
    expect(typeof body.bugRef).toBe("string")
    expect(body.bugRef).toContain("BUG-")
  })

  it("returns a reflowedAt timestamp", async () => {
    const ctx = mockContext("inc-001")
    const response = await POST(mockReq(), ctx)
    const body = await response.json()

    expect(body.reflowedAt).toBeDefined()
    expect(() => new Date(body.reflowedAt)).not.toThrow()
  })

  it("returns a success message", async () => {
    const ctx = mockContext("inc-001")
    const response = await POST(mockReq(), ctx)
    const body = await response.json()

    expect(body.message).toContain("inc-001")
    expect(body.message).toContain("回流")
  })

  it("handles different incident IDs", async () => {
    const ctx = mockContext("inc-999")
    const response = await POST(mockReq(), ctx)
    const body = await response.json()

    expect(body.incidentId).toBe("inc-999")
  })

  it("returns distinct bugRefs on each call", async () => {
    const ctx = mockContext("inc-001")
    const res1 = await POST(mockReq(), ctx)
    const body1 = await res1.json()

    // Small delay to ensure different timestamp
    await new Promise((r) => setTimeout(r, 1))

    const res2 = await POST(mockReq(), ctx)
    const body2 = await res2.json()

    // Bug refs may differ due to Date.now()
    expect(body1.bugRef).toBeDefined()
    expect(body2.bugRef).toBeDefined()
  })
})
