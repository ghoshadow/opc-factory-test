import { describe, it, expect } from "vitest"
import { GET, POST, PUT, DELETE } from "@/app/api/v1/sre/alerts/route"
import { NextRequest } from "next/server"

function mockRequest(body: unknown, method = "POST"): NextRequest {
  return new NextRequest("http://localhost/api/v1/sre/alerts", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("GET /api/v1/sre/alerts", () => {
  it("returns rules array with total", async () => {
    const response = await GET()
    const body = await response.json()

    expect(body.rules).toBeDefined()
    expect(Array.isArray(body.rules)).toBe(true)
    expect(body.rules.length).toBeGreaterThan(0)
    expect(body.total).toBe(body.rules.length)
  })

  it("returns rules with correct shape", async () => {
    const response = await GET()
    const body = await response.json()

    for (const rule of body.rules) {
      expect(rule).toHaveProperty("id")
      expect(rule).toHaveProperty("name")
      expect(rule).toHaveProperty("metric")
      expect(rule).toHaveProperty("condition")
      expect(rule).toHaveProperty("threshold")
      expect(rule).toHaveProperty("severity")
      expect(rule).toHaveProperty("enabled")
      expect(rule).toHaveProperty("routing")
      expect(rule).toHaveProperty("description")
      expect(rule).toHaveProperty("createdAt")
      expect(rule).toHaveProperty("updatedAt")
    }
  })

  it("returns valid severity values", async () => {
    const response = await GET()
    const body = await response.json()

    const validSeverities = ["critical", "warning", "info"]
    for (const rule of body.rules) {
      expect(validSeverities).toContain(rule.severity)
    }
  })

  it("returns valid condition values", async () => {
    const response = await GET()
    const body = await response.json()

    const validConditions = ["gt", "lt", "gte", "lte", "eq", "neq"]
    for (const rule of body.rules) {
      expect(validConditions).toContain(rule.condition)
    }
  })

  it("each rule has routing array with valid targets", async () => {
    const response = await GET()
    const body = await response.json()

    const validTargets = ["oncall", "opc", "auto_remediation"]
    for (const rule of body.rules) {
      expect(Array.isArray(rule.routing)).toBe(true)
      for (const route of rule.routing) {
        expect(validTargets).toContain(route.target)
        expect(typeof route.enabled).toBe("boolean")
      }
    }
  })

  it("returns at least one critical severity rule", async () => {
    const response = await GET()
    const body = await response.json()

    const severities = body.rules.map((r: { severity: string }) => r.severity)
    expect(severities).toContain("critical")
  })
})

describe("POST /api/v1/sre/alerts", () => {
  it("creates a new rule with 201 status", async () => {
    const response = await POST(
      mockRequest({
        name: "Test Rule",
        metric: "test_metric",
        condition: "gt",
        threshold: 100,
        severity: "critical",
        description: "Test description",
      })
    )
    expect(response.status).toBe(201)
  })

  it("returns created rule with id", async () => {
    const response = await POST(
      mockRequest({
        name: "Test Rule 2",
        metric: "test_metric_2",
        threshold: 50,
      })
    )
    const body = await response.json()
    expect(body).toHaveProperty("id")
    expect(body.name).toBe("Test Rule 2")
    expect(body.metric).toBe("test_metric_2")
  })

  it("fills defaults for missing fields", async () => {
    const response = await POST(mockRequest({}))
    const body = await response.json()
    expect(body.name).toBe("未命名规则")
    expect(body.severity).toBe("warning")
    expect(body.enabled).toBe(true)
  })

  it("returns 400 for invalid JSON", async () => {
    const req = new NextRequest("http://localhost/api/v1/sre/alerts", {
      method: "POST",
      body: "not json",
    })
    const response = await POST(req)
    expect(response.status).toBe(400)
  })
})

describe("PUT /api/v1/sre/alerts", () => {
  it("returns 404 for non-existent rule", async () => {
    const response = await PUT(
      mockRequest({ id: "non-existent", name: "Test" })
    )
    expect(response.status).toBe(404)
  })

  it("returns 400 for invalid JSON", async () => {
    const req = new NextRequest("http://localhost/api/v1/sre/alerts", {
      method: "PUT",
      body: "not json",
    })
    const response = await PUT(req)
    expect(response.status).toBe(400)
  })
})

describe("DELETE /api/v1/sre/alerts", () => {
  it("returns 404 for non-existent rule", async () => {
    const response = await DELETE(
      mockRequest({ id: "non-existent" }, "DELETE")
    )
    expect(response.status).toBe(404)
  })

  it("returns 400 for invalid JSON", async () => {
    const req = new NextRequest("http://localhost/api/v1/sre/alerts", {
      method: "DELETE",
      body: "not json",
    })
    const response = await DELETE(req)
    expect(response.status).toBe(400)
  })
})
