import { describe, it, expect, beforeEach } from "vitest"
import { GET, PUT } from "@/app/api/v1/coding/plan/route"

describe("GET /api/v1/coding/plan", () => {
  it("returns all plans with total count", async () => {
    const response = await GET()
    const body = await response.json()

    expect(body.plans).toBeDefined()
    expect(Array.isArray(body.plans)).toBe(true)
    expect(body.plans.length).toBeGreaterThan(0)
    expect(body.total).toBe(body.plans.length)
  })

  it("returns plans with correct shape", async () => {
    const response = await GET()
    const body = await response.json()

    for (const plan of body.plans) {
      expect(plan).toHaveProperty("id")
      expect(plan).toHaveProperty("title")
      expect(plan).toHaveProperty("status")
      expect(plan).toHaveProperty("tasks")
      expect(plan).toHaveProperty("apis")
      expect(plan).toHaveProperty("dependencies")
      expect(plan).toHaveProperty("workload")
      expect(plan).toHaveProperty("createdAt")
    }
  })

  it("returns plans with different statuses", async () => {
    const response = await GET()
    const body = await response.json()

    const statuses = body.plans.map((p: { status: string }) => p.status)
    expect(statuses).toContain("pending")
    expect(statuses).toContain("approved")
    expect(statuses).toContain("rejected")
  })
})

describe("PUT /api/v1/coding/plan", () => {
  // ── Approve ──
  it("approves a pending plan", async () => {
    const request = new Request("http://localhost/api/v1/coding/plan", {
      method: "PUT",
      body: JSON.stringify({ id: "plan-001", action: "approve" }),
    })

    const response = await PUT(request)
    const body = await response.json()

    expect(body.plan).toBeDefined()
    expect(body.plan.status).toBe("approved")
  })

  it("returns 400 when id is missing", async () => {
    const request = new Request("http://localhost/api/v1/coding/plan", {
      method: "PUT",
      body: JSON.stringify({ action: "approve" }),
    })

    const response = await PUT(request)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.error).toContain("Missing")
  })

  it("returns 400 when action is missing", async () => {
    const request = new Request("http://localhost/api/v1/coding/plan", {
      method: "PUT",
      body: JSON.stringify({ id: "plan-001" }),
    })

    const response = await PUT(request)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.error).toContain("Missing")
  })

  it("returns 400 for invalid action", async () => {
    const request = new Request("http://localhost/api/v1/coding/plan", {
      method: "PUT",
      body: JSON.stringify({ id: "plan-001", action: "delete" }),
    })

    const response = await PUT(request)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.error).toContain("Invalid action")
  })

  it("returns 404 for non-existent plan", async () => {
    const request = new Request("http://localhost/api/v1/coding/plan", {
      method: "PUT",
      body: JSON.stringify({ id: "nonexistent", action: "approve" }),
    })

    const response = await PUT(request)
    expect(response.status).toBe(404)

    const body = await response.json()
    expect(body.error).toContain("not found")
  })

  // ── Reject ──
  it("rejects a plan with a reason", async () => {
    const request = new Request("http://localhost/api/v1/coding/plan", {
      method: "PUT",
      body: JSON.stringify({
        id: "plan-001",
        action: "reject",
        reason: "需要补充测试计划",
      }),
    })

    const response = await PUT(request)
    const body = await response.json()

    expect(body.plan).toBeDefined()
    expect(body.plan.status).toBe("rejected")
    expect(body.plan.rejectionReason).toBe("需要补充测试计划")
  })

  it("returns 400 when reject is missing reason", async () => {
    const request = new Request("http://localhost/api/v1/coding/plan", {
      method: "PUT",
      body: JSON.stringify({ id: "plan-001", action: "reject" }),
    })

    const response = await PUT(request)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.error).toContain("reason")
  })

  it("returns 400 when reject reason is empty string", async () => {
    const request = new Request("http://localhost/api/v1/coding/plan", {
      method: "PUT",
      body: JSON.stringify({ id: "plan-001", action: "reject", reason: "   " }),
    })

    const response = await PUT(request)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.error).toContain("reason")
  })

  it("returns 400 for malformed request body", async () => {
    const request = new Request("http://localhost/api/v1/coding/plan", {
      method: "PUT",
      body: "not valid json",
    })

    const response = await PUT(request)
    expect(response.status).toBe(400)

    const body = await response.json()
    expect(body.error).toContain("Invalid request body")
  })
})
