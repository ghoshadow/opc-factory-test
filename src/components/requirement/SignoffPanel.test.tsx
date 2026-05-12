import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { MetaSpec } from "@/types/spec"

const mockMutate = vi.fn()
let swrState: Record<string, unknown> = {
  data: undefined,
  error: undefined,
  isLoading: true,
  isValidating: false,
  mutate: mockMutate,
}

vi.mock("swr", () => ({
  default: vi.fn(() => swrState),
}))

import { SignoffPanel } from "@/components/requirement/SignoffPanel"

function specData(overrides: Partial<MetaSpec> = {}): MetaSpec {
  return {
    id: "spec-001",
    version: 3,
    userStory: "As a factory operator...",
    acceptanceCriteria: [],
    dataContract: { inputs: [], outputs: [] },
    uxDraft: "",
    status: "in_review",
    changeTrace: [],
    ...overrides,
  }
}

function setSWR(state: { data?: MetaSpec | null; error?: Error | null; isLoading?: boolean }) {
  swrState = {
    data: state.data,
    error: state.error ?? undefined,
    isLoading: state.isLoading ?? false,
    isValidating: false,
    mutate: mockMutate,
  }
}

describe("SignoffPanel", () => {
  beforeEach(() => {
    mockMutate.mockReset()
    swrState = { data: undefined, error: undefined, isLoading: true, isValidating: false, mutate: mockMutate }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── Hidden for non-signoff statuses (AC-3) ──

  it("renders nothing when spec is in draft status", () => {
    setSWR({ data: specData({ status: "draft" }), isLoading: false })
    const { container } = render(<SignoffPanel specId="spec-001" />)
    expect(container.innerHTML).toBe("")
  })

  it("renders nothing when spec is in ready_for_review status", () => {
    setSWR({ data: specData({ status: "ready_for_review" }), isLoading: false })
    const { container } = render(<SignoffPanel specId="spec-001" />)
    expect(container.innerHTML).toBe("")
  })

  // ── in_review: Action buttons (AC-1) ──

  it("shows approve and reject buttons when status is in_review", () => {
    setSWR({ data: specData({ status: "in_review" }), isLoading: false })
    render(<SignoffPanel specId="spec-001" />)
    expect(screen.getAllByText("签收").length).toBeGreaterThan(0)
    expect(screen.getAllByText("打回").length).toBeGreaterThan(0)
  })

  it("shows panel header", () => {
    setSWR({ data: specData({ status: "in_review" }), isLoading: false })
    render(<SignoffPanel specId="spec-001" />)
    expect(screen.getAllByText("签收审核").length).toBeGreaterThan(0)
  })

  // ── Confirm dialog (AC-1) ──

  it("opens confirm dialog when approve button is clicked", async () => {
    const user = userEvent.setup()
    setSWR({ data: specData({ status: "in_review" }), isLoading: false })
    render(<SignoffPanel specId="spec-001" />)
    await user.click(screen.getAllByText("签收")[0])
    expect(screen.getByText((content: string) => content.includes("确认签收 Spec"))).toBeInTheDocument()
    expect(screen.getByText("签收后将流转至编码产线，无法撤回。")).toBeInTheDocument()
  })

  it("closes confirm dialog when cancel is clicked", async () => {
    const user = userEvent.setup()
    setSWR({ data: specData({ status: "in_review" }), isLoading: false })
    render(<SignoffPanel specId="spec-001" />)
    await user.click(screen.getAllByText("签收")[0])
    for (const btn of screen.getAllByText("取消")) {
      await user.click(btn)
    }
    expect(screen.queryByText((content: string) => content.includes("确认签收 Spec"))).toBeNull()
  })

  // ── Reject form (AC-4, AC-5) ──

  it("opens reject form with required comment textarea", async () => {
    const user = userEvent.setup()
    setSWR({ data: specData({ status: "in_review" }), isLoading: false })
    render(<SignoffPanel specId="spec-001" />)
    await user.click(screen.getAllByText("打回")[0])
    expect(screen.getByText("打回原因")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("请说明打回原因...")).toBeInTheDocument()
  })

  it("disables submit button when comment is empty (AC-5)", async () => {
    const user = userEvent.setup()
    setSWR({ data: specData({ status: "in_review" }), isLoading: false })
    render(<SignoffPanel specId="spec-001" />)
    await user.click(screen.getAllByText("打回")[0])
    const submitBtn = screen.getAllByText("确认打回")[0]
    expect(submitBtn).toBeDisabled()
  })

  it("enables submit button when comment is filled", async () => {
    const user = userEvent.setup()
    setSWR({ data: specData({ status: "in_review" }), isLoading: false })
    render(<SignoffPanel specId="spec-001" />)
    await user.click(screen.getAllByText("打回")[0])
    await user.type(screen.getAllByPlaceholderText("请说明打回原因...")[0], "AC-3 不完整")
    expect(screen.getAllByText("确认打回")[0]).toBeEnabled()
  })

  it("closes reject form when cancel is clicked", async () => {
    const user = userEvent.setup()
    setSWR({ data: specData({ status: "in_review" }), isLoading: false })
    render(<SignoffPanel specId="spec-001" />)
    await user.click(screen.getAllByText("打回")[0])
    expect(screen.getAllByText("打回原因").length).toBeGreaterThan(0)
    for (const btn of screen.getAllByText("取消")) {
      await user.click(btn)
    }
    // After cancel, the reject form should be gone — verify by checking the buttons are back
    expect(screen.getAllByText("签收").length).toBeGreaterThan(0)
    expect(screen.getAllByText("打回").length).toBeGreaterThan(0)
  })

  // ── Signed-off signature display (AC-2, AC-7) ──

  it("shows signed-off signature when status is signed_off", () => {
    setSWR({
      data: specData({
        status: "signed_off",
        changeTrace: [
          {
            source: "signoff",
            timestamp: "2026-05-10T14:30:00Z",
            description: "已签收 — 审核人: 张三",
            versionFrom: 3,
            versionTo: 4,
          },
        ],
      }),
      isLoading: false,
    })
    render(<SignoffPanel specId="spec-001" />)
    expect(screen.getByText("已签收 → 流转至编码产线")).toBeInTheDocument()
    expect(screen.getByText(/审核人: 需求产线 OPC/)).toBeInTheDocument()
  })

  // ── Rework signature display (AC-6, AC-7) ──

  it("shows rework signature with comment when status is rework", () => {
    setSWR({
      data: specData({
        status: "rework",
        changeTrace: [
          {
            source: "signoff",
            timestamp: "2026-05-10T14:30:00Z",
            description: "已打回 — 审核人: 张三。原因: AC-3 覆盖场景不完整",
            versionFrom: 3,
            versionTo: 4,
          },
        ],
      }),
      isLoading: false,
    })
    render(<SignoffPanel specId="spec-001" />)
    expect(screen.getByText("已打回 → 回流需求产线")).toBeInTheDocument()
    expect(screen.getByText("打回原因:")).toBeInTheDocument()
    expect(screen.getByText("已打回 — 审核人: 张三。原因: AC-3 覆盖场景不完整")).toBeInTheDocument()
  })

  // ── Approve API call ──

  it("calls signoff API on approve confirm", async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(specData({ status: "signed_off" })),
    } as Response)

    setSWR({ data: specData({ status: "in_review" }), isLoading: false })
    render(<SignoffPanel specId="spec-001" />)

    await user.click(screen.getAllByText("签收")[0])
    await user.click(screen.getByText("确认签收"))

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/v1/specs/spec-001/signoff",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("approve"),
      })
    )
  })

  // ── Reject API call ──

  it("calls signoff API on reject confirm", async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(specData({ status: "rework" })),
    } as Response)

    setSWR({ data: specData({ status: "in_review" }), isLoading: false })
    render(<SignoffPanel specId="spec-001" />)

    await user.click(screen.getAllByText("打回")[0])
    await user.type(screen.getAllByPlaceholderText("请说明打回原因...")[0], "AC-3 不完整")
    await user.click(screen.getAllByText("确认打回")[0])

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/v1/specs/spec-001/signoff",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("reject"),
      })
    )
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/v1/specs/spec-001/signoff",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("AC-3 不完整"),
      })
    )
  })

  // ── Error display ──

  it("shows error message on API failure", async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Cannot signoff spec" }),
    } as Response)

    setSWR({ data: specData({ status: "in_review" }), isLoading: false })
    render(<SignoffPanel specId="spec-001" />)

    await user.click(screen.getAllByText("签收")[0])
    await user.click(screen.getByText("确认签收"))

    expect(screen.getByText("Cannot signoff spec")).toBeInTheDocument()
  })

  // ── Null spec → nothing rendered ──

  it("renders nothing when spec data is null", () => {
    setSWR({ data: null, isLoading: false })
    const { container } = render(<SignoffPanel specId="spec-001" />)
    expect(container.innerHTML).toBe("")
  })
})
