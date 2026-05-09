import { describe, it, expect, beforeEach } from "vitest"
import { POST } from "@/app/api/v1/specs/[id]/signoff/route"
import { specs } from "@/app/api/v1/specs/store"
import type { NextRequest } from "next/server"

const initialSpec = {
  id: "spec-001",
  version: 3,
  userStory: "As a factory operator, I want to view real-time WIP statistics",
  acceptanceCriteria: [],
  dataContract: { inputs: [], outputs: [] },
  uxDraft: "",
  status: "in_review" as const,
  changeTrace: [],
}

function makeParams(id: string) {
  return Promise.resolve({ id })
}

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/v1/specs/spec-001/signoff", {
    method: "POST",
    body: JSON.stringify(body),
  }) as unknown as NextRequest
}

describe("POST /api/v1/specs/:id/signoff", () => {
  beforeEach(() => {
    // Reset spec-001 to in_review before each test
    specs["spec-001"] = { ...initialSpec, changeTrace: [], acceptanceCriteria: [], dataContract: { inputs: [], outputs: [] } }
  })

  // ── Approve ──

  it("approves a spec in in_review status", async () => {
    const req = makeRequest({
      action: "approve",
      reviewerName: "张三",
      timestamp: "2026-05-10T14:30:00Z",
    })
    const res = await POST(req, { params: makeParams("spec-001") })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.status).toBe("signed_off")
    expect(body.version).toBe(4)
    expect(body.changeTrace).toHaveLength(1)
    expect(body.changeTrace[0].source).toBe("signoff")
    expect(body.changeTrace[0].versionFrom).toBe(3)
    expect(body.changeTrace[0].versionTo).toBe(4)
  })

  // ── Reject ──

  it("rejects a spec with a comment", async () => {
    const req = makeRequest({
      action: "reject",
      comment: "AC-3 覆盖场景不完整",
      reviewerName: "张三",
      timestamp: "2026-05-10T14:30:00Z",
    })
    const res = await POST(req, { params: makeParams("spec-001") })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.status).toBe("rework")
    expect(body.version).toBe(4)
    expect(body.changeTrace).toHaveLength(1)
    expect(body.changeTrace[0].source).toBe("signoff")
    expect(body.changeTrace[0].description).toContain("AC-3 覆盖场景不完整")
  })

  // ── Validation ──

  it("returns 400 when action is missing", async () => {
    const req = makeRequest({
      reviewerName: "张三",
      timestamp: "2026-05-10T14:30:00Z",
    })
    const res = await POST(req, { params: makeParams("spec-001") })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain("action")
  })

  it("returns 400 for invalid action", async () => {
    const req = makeRequest({
      action: "delete",
      reviewerName: "张三",
      timestamp: "2026-05-10T14:30:00Z",
    })
    const res = await POST(req, { params: makeParams("spec-001") })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain("action")
  })

  it("returns 400 when reject is missing comment", async () => {
    const req = makeRequest({
      action: "reject",
      reviewerName: "张三",
      timestamp: "2026-05-10T14:30:00Z",
    })
    const res = await POST(req, { params: makeParams("spec-001") })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain("comment")
  })

  it("returns 400 when reject comment is empty string", async () => {
    const req = makeRequest({
      action: "reject",
      comment: "   ",
      reviewerName: "张三",
      timestamp: "2026-05-10T14:30:00Z",
    })
    const res = await POST(req, { params: makeParams("spec-001") })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain("comment")
  })

  it("returns 400 when reviewerName is missing", async () => {
    const req = makeRequest({
      action: "approve",
      timestamp: "2026-05-10T14:30:00Z",
    })
    const res = await POST(req, { params: makeParams("spec-001") })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain("reviewerName")
  })

  it("returns 400 when reviewerName is empty", async () => {
    const req = makeRequest({
      action: "approve",
      reviewerName: "   ",
      timestamp: "2026-05-10T14:30:00Z",
    })
    const res = await POST(req, { params: makeParams("spec-001") })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain("reviewerName")
  })

  it("returns 400 when timestamp is missing", async () => {
    const req = makeRequest({
      action: "approve",
      reviewerName: "张三",
    })
    const res = await POST(req, { params: makeParams("spec-001") })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain("timestamp")
  })

  it("returns 400 for malformed JSON body", async () => {
    const req = new Request("http://localhost/api/v1/specs/spec-001/signoff", {
      method: "POST",
      body: "not valid json",
    }) as unknown as NextRequest
    const res = await POST(req, { params: makeParams("spec-001") })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain("Invalid JSON body")
  })

  // ── NotFound ──

  it("returns 404 for non-existent spec", async () => {
    const req = makeRequest({
      action: "approve",
      reviewerName: "张三",
      timestamp: "2026-05-10T14:30:00Z",
    })
    const res = await POST(req, { params: makeParams("nonexistent") })
    expect(res.status).toBe(404)
  })

  // ── Invalid state ──

  it("returns 409 when spec is not in_review", async () => {
    specs["spec-001"] = { ...initialSpec, status: "draft", changeTrace: [], acceptanceCriteria: [], dataContract: { inputs: [], outputs: [] } }
    const req = makeRequest({
      action: "approve",
      reviewerName: "张三",
      timestamp: "2026-05-10T14:30:00Z",
    })
    const res = await POST(req, { params: makeParams("spec-001") })
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toContain("not in review")
  })

  // ── Change trace accumulation ──

  it("appends to existing changeTrace", async () => {
    specs["spec-001"] = {
      ...initialSpec,
      changeTrace: [
        {
          source: "review_board" as const,
          timestamp: "2026-05-08T10:00:00Z",
          description: "Previous review",
          versionFrom: 2,
          versionTo: 3,
        },
      ],
      acceptanceCriteria: [],
      dataContract: { inputs: [], outputs: [] },
    }
    const req = makeRequest({
      action: "approve",
      reviewerName: "张三",
      timestamp: "2026-05-10T14:30:00Z",
    })
    const res = await POST(req, { params: makeParams("spec-001") })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.changeTrace).toHaveLength(2)
    expect(body.changeTrace[1].source).toBe("signoff")
  })
})
