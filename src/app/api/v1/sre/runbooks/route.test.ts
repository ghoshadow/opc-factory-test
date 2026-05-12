import { describe, it, expect } from "vitest"
import type { NextRequest } from "next/server"
import { GET, POST, PUT } from "@/app/api/v1/sre/runbooks/route"

function makeRequest(body: unknown): NextRequest {
  return new Request("http://localhost/api/v1/sre/runbooks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as NextRequest
}

describe("GET /api/v1/sre/runbooks", () => {
  it("returns runbooks list with total", async () => {
    const response = await GET()
    const body = await response.json()

    expect(body.runbooks).toBeDefined()
    expect(Array.isArray(body.runbooks)).toBe(true)
    expect(body.runbooks.length).toBeGreaterThan(0)
    expect(body.total).toBe(body.runbooks.length)
  })

  it("returns runbooks with correct shape", async () => {
    const response = await GET()
    const body = await response.json()

    for (const rb of body.runbooks) {
      expect(rb).toHaveProperty("id")
      expect(rb).toHaveProperty("name")
      expect(rb).toHaveProperty("description")
      expect(rb).toHaveProperty("service")
      expect(rb).toHaveProperty("version")
      expect(rb).toHaveProperty("startStopSteps")
      expect(rb).toHaveProperty("scaleSteps")
      expect(rb).toHaveProperty("troubleshootTree")
      expect(rb).toHaveProperty("emergencyPlan")
      expect(rb).toHaveProperty("topologyExport")
      expect(rb).toHaveProperty("createdAt")
      expect(rb).toHaveProperty("updatedAt")
    }
  })

  it("returns startStopSteps as arrays", async () => {
    const response = await GET()
    const body = await response.json()

    for (const rb of body.runbooks) {
      expect(Array.isArray(rb.startStopSteps)).toBe(true)
      expect(Array.isArray(rb.scaleSteps)).toBe(true)
    }
  })

  it("returns valid version numbers", async () => {
    const response = await GET()
    const body = await response.json()

    for (const rb of body.runbooks) {
      expect(typeof rb.version).toBe("number")
      expect(rb.version).toBeGreaterThan(0)
    }
  })

  it("returns troubleshootTree as array", async () => {
    const response = await GET()
    const body = await response.json()

    for (const rb of body.runbooks) {
      expect(Array.isArray(rb.troubleshootTree)).toBe(true)
    }
  })

  it("returns valid ISO date strings", async () => {
    const response = await GET()
    const body = await response.json()

    for (const rb of body.runbooks) {
      // Parse and re-format to verify it's a valid ISO date
      const createdAt = new Date(rb.createdAt)
      const updatedAt = new Date(rb.updatedAt)
      expect(createdAt.toISOString()).toBeTruthy()
      expect(updatedAt.toISOString()).toBeTruthy()
      expect(isNaN(createdAt.getTime())).toBe(false)
      expect(isNaN(updatedAt.getTime())).toBe(false)
    }
  })
})

describe("POST /api/v1/sre/runbooks", () => {
  it("creates a new runbook with provided fields", async () => {
    const req = makeRequest({
      name: "新服务运维手册",
      description: "新服务的运维指南",
      service: "new-service",
      startStopSteps: ["启动: pm2 start"],
      scaleSteps: ["扩容: pm2 scale"],
      troubleshootTree: [],
      emergencyPlan: "## 应急",
      topologyExport: "digraph {}",
    })
    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.name).toBe("新服务运维手册")
    expect(body.service).toBe("new-service")
    expect(body.version).toBe(1)
    expect(body.id).toMatch(/^rb-/)
  })

  it("fills default values for missing fields", async () => {
    const req = makeRequest({})
    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.name).toBe("未命名 Runbook")
    expect(body.service).toBe("")
    expect(body.version).toBe(1)
  })

  it("returns created and updated timestamps", async () => {
    const req = makeRequest({ name: "test" })
    const response = await POST(req)
    const body = await response.json()

    expect(body.createdAt).toBeDefined()
    expect(body.updatedAt).toBeDefined()
    expect(body.createdAt).toBe(body.updatedAt)
  })

  it("returns 400 for invalid JSON body", async () => {
    const req = new Request("http://localhost/api/v1/sre/runbooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json",
    }) as unknown as NextRequest
    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe("Invalid JSON body")
  })
})

describe("PUT /api/v1/sre/runbooks", () => {
  it("updates an existing runbook", async () => {
    // First, get existing runbooks to find a valid ID
    const listResponse = await GET()
    const listBody = await listResponse.json()
    const existing = listBody.runbooks[0]

    const req = makeRequest({
      id: existing.id,
      name: "更新后的名称",
      description: existing.description,
      service: existing.service,
      startStopSteps: existing.startStopSteps,
      scaleSteps: existing.scaleSteps,
      troubleshootTree: existing.troubleshootTree,
      emergencyPlan: existing.emergencyPlan,
      topologyExport: existing.topologyExport,
    })
    const response = await PUT(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.name).toBe("更新后的名称")
    expect(body.version).toBe(existing.version + 1)
  })

  it("increments version on update", async () => {
    const listResponse = await GET()
    const listBody = await listResponse.json()
    const existing = listBody.runbooks[0]

    const req = makeRequest({
      id: existing.id,
      name: existing.name,
      description: existing.description,
      service: existing.service,
      startStopSteps: existing.startStopSteps,
      scaleSteps: existing.scaleSteps,
      troubleshootTree: existing.troubleshootTree,
      emergencyPlan: existing.emergencyPlan,
      topologyExport: existing.topologyExport,
    })
    const response = await PUT(req)
    const body = await response.json()

    expect(body.version).toBe(existing.version + 1)
  })

  it("returns 404 for non-existent runbook", async () => {
    const req = makeRequest({
      id: "rb-nonexistent",
      name: "test",
      description: "",
      service: "",
      startStopSteps: [],
      scaleSteps: [],
      troubleshootTree: [],
      emergencyPlan: "",
      topologyExport: "",
    })
    const response = await PUT(req)
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBe("Runbook not found")
  })

  it("returns 400 for invalid JSON body on PUT", async () => {
    const req = new Request("http://localhost/api/v1/sre/runbooks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: "invalid json",
    }) as unknown as NextRequest
    const response = await PUT(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe("Invalid JSON body")
  })

  it("updates updatedAt timestamp on edit", async () => {
    const listResponse = await GET()
    const listBody = await listResponse.json()
    const existing = listBody.runbooks[0]

    const req = makeRequest({
      id: existing.id,
      name: "Another update",
      description: existing.description,
      service: existing.service,
      startStopSteps: existing.startStopSteps,
      scaleSteps: existing.scaleSteps,
      troubleshootTree: existing.troubleshootTree,
      emergencyPlan: existing.emergencyPlan,
      topologyExport: existing.topologyExport,
    })
    const response = await PUT(req)
    const body = await response.json()

    expect(new Date(body.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(existing.updatedAt).getTime(),
    )
  })
})
