import { describe, it, expect } from "vitest"
import { GET } from "@/app/api/v1/sre/incidents/route"

describe("GET /api/v1/sre/incidents", () => {
  it("returns incidents list with total", async () => {
    const response = await GET()
    const body = await response.json()

    expect(body.incidents).toBeDefined()
    expect(Array.isArray(body.incidents)).toBe(true)
    expect(body.incidents.length).toBeGreaterThan(0)
    expect(body.total).toBe(body.incidents.length)
  })

  it("returns incidents with correct shape", async () => {
    const response = await GET()
    const body = await response.json()

    for (const inc of body.incidents) {
      expect(inc).toHaveProperty("id")
      expect(inc).toHaveProperty("description")
      expect(inc).toHaveProperty("severity")
      expect(inc).toHaveProperty("status")
      expect(inc).toHaveProperty("service")
      expect(inc).toHaveProperty("discoveredAt")
      expect(inc).toHaveProperty("alertSource")
      expect(inc).toHaveProperty("diagnosis")
      expect(inc).toHaveProperty("bugPreview")
    }
  })

  it("returns valid severity values", async () => {
    const response = await GET()
    const body = await response.json()

    const validSeverities = ["P0", "P1", "P2", "P3"]
    for (const inc of body.incidents) {
      expect(validSeverities).toContain(inc.severity)
    }
  })

  it("returns valid status values", async () => {
    const response = await GET()
    const body = await response.json()

    const validStatuses = ["待诊断", "已诊断", "已回流"]
    for (const inc of body.incidents) {
      expect(validStatuses).toContain(inc.status)
    }
  })

  it("includes some incidents without diagnosis", async () => {
    const response = await GET()
    const body = await response.json()

    const pendingDiagnosis = body.incidents.filter(
      (i: { status: string }) => i.status === "待诊断"
    )
    expect(pendingDiagnosis.length).toBeGreaterThan(0)
    for (const inc of pendingDiagnosis) {
      expect(inc.diagnosis).toBeNull()
    }
  })

  it("includes some incidents with diagnosis", async () => {
    const response = await GET()
    const body = await response.json()

    const diagnosed = body.incidents.filter(
      (i: { status: string }) => i.status !== "待诊断"
    )
    // At least some should have diagnosis
    const withDiagnosis = diagnosed.filter(
      (i: { diagnosis: unknown }) => i.diagnosis !== null
    )
    expect(withDiagnosis.length).toBeGreaterThan(0)
  })

  it("diagnosis has correct shape when present", async () => {
    const response = await GET()
    const body = await response.json()

    const withDiagnosis = body.incidents.filter(
      (i: { diagnosis: unknown }) => i.diagnosis !== null
    )
    for (const inc of withDiagnosis) {
      expect(inc.diagnosis).toHaveProperty("rootCause")
      expect(inc.diagnosis).toHaveProperty("impactScope")
      expect(inc.diagnosis).toHaveProperty("priority")
      expect(inc.diagnosis).toHaveProperty("confidence")
      expect(inc.diagnosis).toHaveProperty("relatedServices")
      expect(inc.diagnosis).toHaveProperty("suggestion")
      expect(Array.isArray(inc.diagnosis.relatedServices)).toBe(true)
      expect(inc.diagnosis.confidence).toBeGreaterThan(0)
      expect(inc.diagnosis.confidence).toBeLessThanOrEqual(100)
    }
  })

  it("bug preview has correct shape when present", async () => {
    const response = await GET()
    const body = await response.json()

    const withBug = body.incidents.filter(
      (i: { bugPreview: unknown }) => i.bugPreview !== null
    )
    for (const inc of withBug) {
      expect(inc.bugPreview).toHaveProperty("title")
      expect(inc.bugPreview).toHaveProperty("module")
      expect(inc.bugPreview).toHaveProperty("severity")
      expect(inc.bugPreview).toHaveProperty("description")
    }
  })
})
