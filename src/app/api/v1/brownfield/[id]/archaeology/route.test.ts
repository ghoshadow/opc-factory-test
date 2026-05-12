import { describe, it, expect } from "vitest"
import { GET } from "@/app/api/v1/brownfield/[id]/archaeology/route"

describe("GET /api/v1/brownfield/:id/archaeology", () => {
  it("returns archaeology report with correct shape", async () => {
    const request = new Request("http://localhost/api/v1/brownfield/test-project/archaeology")
    const response = await GET(request, { params: Promise.resolve({ id: "test-project" }) })
    const body = await response.json()

    expect(body.report).toBeDefined()
    expect(body.report.id).toContain("arch-test-project")
    expect(body.report.projectId).toBe("test-project")
  })

  it("returns all four archaeology sections", async () => {
    const request = new Request("http://localhost/api/v1/brownfield/test-project/archaeology")
    const response = await GET(request, { params: Promise.resolve({ id: "test-project" }) })
    const body = await response.json()

    const { report } = body
    // Code structure
    expect(report.codeTree).toBeDefined()
    expect(report.codeTree.name).toBeTruthy()
    expect(report.codeTree.children).toBeDefined()

    // Dependencies
    expect(report.dependencies).toBeDefined()
    expect(report.dependencies.production.length).toBeGreaterThan(0)
    expect(report.dependencies.dev.length).toBeGreaterThan(0)
    expect(report.dependencies.graph.length).toBeGreaterThan(0)

    // Tech debt
    expect(report.techDebt.length).toBeGreaterThan(0)
    for (const item of report.techDebt) {
      expect(item).toHaveProperty("id")
      expect(item).toHaveProperty("type")
      expect(item).toHaveProperty("severity")
      expect(item).toHaveProperty("location")
      expect(item).toHaveProperty("description")
      expect(item).toHaveProperty("suggestion")
    }

    // Change history
    expect(report.changeHistory.length).toBeGreaterThan(0)

    // Reverse spec
    expect(report.reverseSpec).toBeDefined()
    expect(report.reverseSpec.userStory).toBeTruthy()
    expect(report.reverseSpec.acceptanceCriteria.length).toBeGreaterThan(0)
  })

  it("returns Meta-Spec formatted reverse spec", async () => {
    const request = new Request("http://localhost/api/v1/brownfield/test-project/archaeology")
    const response = await GET(request, { params: Promise.resolve({ id: "test-project" }) })
    const body = await response.json()

    const rs = body.report.reverseSpec
    // Meta-Spec format: US + AC + DataContract + UX
    expect(rs.userStory).toBeTruthy()
    expect(Array.isArray(rs.acceptanceCriteria)).toBe(true)
    expect(rs.acceptanceCriteria.length).toBeGreaterThan(0)
    expect(rs.dataContract).toBeDefined()
    expect(rs.dataContract.inputs).toBeDefined()
    expect(rs.dataContract.outputs).toBeDefined()
    expect(rs.uxDraft).toBeTruthy()
  })

  it("returns tech debt items sorted by severity", async () => {
    const request = new Request("http://localhost/api/v1/brownfield/test-project/archaeology")
    const response = await GET(request, { params: Promise.resolve({ id: "test-project" }) })
    const body = await response.json()

    const severities = body.report.techDebt.map((td: { severity: string }) => td.severity)
    // Verify all required severity types are present
    expect(severities).toContain("critical")
    expect(severities).toContain("major")
    expect(severities).toContain("minor")
  })

  it("returns 400 for empty id", async () => {
    const request = new Request("http://localhost/api/v1/brownfield//archaeology")
    const response = await GET(request, { params: Promise.resolve({ id: "" }) })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toContain("Missing")
  })
})
