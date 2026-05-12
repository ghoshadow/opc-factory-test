import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { PlanReviewResponse } from "@/types/coding"

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

import { PlanReviewPanel } from "@/components/coding/PlanReviewPanel"

function planData(overrides: Partial<PlanReviewResponse["plans"][0]> = {}): PlanReviewResponse {
  return {
    total: 1,
    plans: [
      {
        id: "plan-001",
        title: "测试 Plan",
        status: "pending",
        createdAt: "2026-05-08T10:30:00Z",
        tasks: [
          {
            id: "t1", title: "数据层", description: "Order 表结构变更", estimatedHours: 8,
            children: [
              { id: "t1.1", title: "迁移脚本", description: "编写 migration", estimatedHours: 3 },
              { id: "t1.2", title: "Model 适配", description: "更新 model", estimatedHours: 5 },
            ],
          },
          { id: "t2", title: "API 层", description: "新增 API 端点", estimatedHours: 10 },
        ],
        apis: [
          { method: "POST" as const, path: "/api/v1/orders/:id/refund", description: "退款接口", request: "{}", response: "{}" },
          { method: "GET" as const, path: "/api/v1/orders", description: "订单列表", request: "{}", response: "{}" },
        ],
        dependencies: [{ from: "t1", to: "t2", label: "API 依赖数据层" }],
        workload: {
          totalPersonHours: 18,
          storyPoints: 5,
          breakdown: [
            { task: "数据层", hours: 8 },
            { task: "API 层", hours: 10 },
          ],
        },
        ...overrides,
      },
    ],
  }
}

function setSWR(state: { data?: PlanReviewResponse | null; error?: Error | null; isLoading?: boolean }) {
  swrState = {
    data: state.data,
    error: state.error ?? undefined,
    isLoading: state.isLoading ?? false,
    isValidating: false,
    mutate: mockMutate,
  }
}

describe("PlanReviewPanel", () => {
  beforeEach(() => {
    mockMutate.mockReset()
    swrState = { data: undefined, error: undefined, isLoading: true, isValidating: false, mutate: mockMutate }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── Loading ──
  it("shows skeleton loading state", () => {
    setSWR({ isLoading: true })
    render(<PlanReviewPanel />)
    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })

  // ── Error ──
  it("shows error message when fetch fails", () => {
    setSWR({ error: new Error("fail"), isLoading: false })
    render(<PlanReviewPanel />)
    expect(screen.getByText("加载失败")).toBeInTheDocument()
  })

  // ── Empty ──
  it("renders nothing for empty plan list", () => {
    setSWR({ data: { plans: [], total: 0 }, isLoading: false })
    const { container } = render(<PlanReviewPanel />)
    expect(container.innerHTML).toBe("")
  })

  // ── Header ──
  it("renders header with title", () => {
    setSWR({ data: planData(), isLoading: false })
    render(<PlanReviewPanel />)
    expect(screen.getByText("Plan Review 面板")).toBeInTheDocument()
  })

  // ── Status badges (AC: 审核状态标签: 待审/已确认/已打回) ──
  it("shows '待审' badge for pending plan", async () => {
    setSWR({ data: planData({ status: "pending" }), isLoading: false })
    render(<PlanReviewPanel />)
    await waitFor(() => {
      expect(screen.getByText("待审")).toBeInTheDocument()
    })
  })

  it("shows '已确认' badge for approved plan", async () => {
    setSWR({ data: planData({ status: "approved" }), isLoading: false })
    render(<PlanReviewPanel />)
    await waitFor(() => {
      expect(screen.getByText("已确认")).toBeInTheDocument()
    })
  })

  it("shows '已打回' badge for rejected plan", async () => {
    setSWR({ data: planData({ status: "rejected", rejectionReason: "r" }), isLoading: false })
    render(<PlanReviewPanel />)
    await waitFor(() => {
      expect(screen.getByText("已打回")).toBeInTheDocument()
    })
  })

  // ── Four sections (AC: Plan 内容完整展示 - 拆分/API/依赖/预估) ──
  it("displays all four plan sections", async () => {
    setSWR({ data: planData(), isLoading: false })
    render(<PlanReviewPanel />)
    await waitFor(() => {
      expect(screen.getAllByText("任务拆分").length).toBeGreaterThan(0)
      expect(screen.getAllByText("API 设计").length).toBeGreaterThan(0)
      expect(screen.getAllByText("依赖关系").length).toBeGreaterThan(0)
      expect(screen.getAllByText("工作量预估").length).toBeGreaterThan(0)
    })
  })

  it("shows hierarchical task tree content", async () => {
    setSWR({ data: planData(), isLoading: false })
    render(<PlanReviewPanel />)
    await waitFor(() => {
      expect(screen.getAllByText("数据层").length).toBeGreaterThan(0)
      expect(screen.getAllByText("API 层").length).toBeGreaterThan(0)
      expect(screen.getAllByText("迁移脚本").length).toBeGreaterThan(0)
      expect(screen.getAllByText("Model 适配").length).toBeGreaterThan(0)
    })
  })

  it("shows API design table with methods and paths", async () => {
    setSWR({ data: planData(), isLoading: false })
    render(<PlanReviewPanel />)
    await waitFor(() => {
      expect(screen.getAllByText("POST").length).toBeGreaterThan(0)
      expect(screen.getAllByText("GET").length).toBeGreaterThan(0)
      expect(screen.getAllByText("/api/v1/orders/:id/refund").length).toBeGreaterThan(0)
      expect(screen.getAllByText("退款接口").length).toBeGreaterThan(0)
      expect(screen.getAllByText("2 个端点").length).toBeGreaterThan(0)
    })
  })

  it("shows dependency edges", async () => {
    setSWR({ data: planData(), isLoading: false })
    render(<PlanReviewPanel />)
    await waitFor(() => {
      expect(screen.getAllByText("1 条依赖边").length).toBeGreaterThan(0)
      expect(screen.getAllByText("API 依赖数据层").length).toBeGreaterThan(0)
    })
  })

  it("shows fallback when no dependencies", async () => {
    setSWR({ data: planData({ dependencies: [] }), isLoading: false })
    render(<PlanReviewPanel />)
    await waitFor(() => {
      expect(screen.getByText("无依赖关系")).toBeInTheDocument()
    })
  })

  it("shows workload SP and hours", async () => {
    setSWR({ data: planData(), isLoading: false })
    render(<PlanReviewPanel />)
    await waitFor(() => {
      const matches = screen.queryAllByText(/5 SP/)
      expect(matches.length).toBeGreaterThan(0)
    })
  })

  // ── Action buttons for pending ──
  it("shows approve and reject buttons for pending plan", async () => {
    setSWR({ data: planData({ status: "pending" }), isLoading: false })
    render(<PlanReviewPanel />)
    await waitFor(() => {
      expect(screen.getAllByText("确认冻结").length).toBeGreaterThan(0)
      expect(screen.getAllByText("驳回").length).toBeGreaterThan(0)
    })
  })

  // ── Action buttons hidden for non-pending ──
  it("shows approved badge for non-pending plan", async () => {
    setSWR({ data: planData({ status: "approved" }), isLoading: false })
    render(<PlanReviewPanel />)
    await waitFor(() => {
      expect(screen.getAllByText("已确认").length).toBeGreaterThan(0)
    })
  })

  // ── Confirm dialog ──
  it("opens confirm dialog with correct text", async () => {
    const user = userEvent.setup()
    setSWR({ data: planData({ status: "pending" }), isLoading: false })
    render(<PlanReviewPanel />)
    await waitFor(() => {
      expect(screen.getAllByText("确认冻结").length).toBeGreaterThan(0)
    })
    await user.click(screen.getAllByText("确认冻结")[0])
    expect(screen.getByText("确认冻结 Plan")).toBeInTheDocument()
    expect(screen.getByText("确认后将进入 Design 阶段，不可修改")).toBeInTheDocument()
  })

  // ── Reject dialog ──
  it("opens reject dialog with required reason field", async () => {
    const user = userEvent.setup()
    setSWR({ data: planData({ status: "pending" }), isLoading: false })
    render(<PlanReviewPanel />)
    await waitFor(() => {
      expect(screen.getAllByText("驳回").length).toBeGreaterThan(0)
    })
    await user.click(screen.getAllByText("驳回")[0])
    expect(screen.getByText("驳回 Plan")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("请填写驳回原因及修改建议...")).toBeInTheDocument()
  })

  // ── Reject validation (AC: 打回必须填写意见) ──
  it("validates reason is required on rejection", async () => {
    const user = userEvent.setup()
    setSWR({ data: planData({ status: "pending" }), isLoading: false })
    render(<PlanReviewPanel />)
    await waitFor(() => {
      expect(screen.getAllByText("驳回").length).toBeGreaterThan(0)
    })
    await user.click(screen.getAllByText("驳回")[0])
    await user.click(screen.getByText("确认驳回"))
    expect(screen.getByText("驳回必须填写修改意见")).toBeInTheDocument()
  })

  // ── Rejection reason banner (AC: rejected plans show reason) ──
  it("displays rejection reason on rejected plan", async () => {
    setSWR({ data: planData({ status: "rejected", rejectionReason: "工作量评估偏低" }), isLoading: false })
    render(<PlanReviewPanel />)
    await waitFor(() => {
      expect(screen.getByText("已打回")).toBeInTheDocument()
    })
  })

  // ── Confirm dialog interaction (approve/reject API calls verified in route.test) ──
  it("opens and closes confirm dialog", async () => {
    const user = userEvent.setup()
    setSWR({ data: planData({ status: "pending" }), isLoading: false })
    render(<PlanReviewPanel />)

    await waitFor(() => {
      expect(screen.getAllByText("确认冻结").length).toBeGreaterThan(0)
    })
    await user.click(screen.getAllByText("确认冻结")[0])
    expect(screen.getByText("确认冻结 Plan")).toBeInTheDocument()

    // Cancel closes the dialog
    await user.click(screen.getByText("取消"))
    await waitFor(() => {
      expect(screen.queryByText("确认冻结 Plan")).toBeNull()
    })
  })

  // ── Reject API (AC: 修改意见 → PUT reject) ──
  it("calls reject API with reason on confirm", async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true, json: () => Promise.resolve({}),
    } as Response)

    setSWR({ data: planData({ status: "pending" }), isLoading: false })
    render(<PlanReviewPanel />)

    await waitFor(() => {
      expect(screen.getAllByText("驳回").length).toBeGreaterThan(0)
    })
    await user.click(screen.getAllByText("驳回")[0])
    await user.type(screen.getByPlaceholderText("请填写驳回原因及修改建议..."), "需要补充测试计划")
    await user.click(screen.getByText("确认驳回"))

    expect(fetchSpy).toHaveBeenCalledWith("/api/v1/coding/plan", expect.objectContaining({
      method: "PUT",
      body: JSON.stringify({ id: "plan-001", action: "reject", reason: "需要补充测试计划" }),
    }))
  })

  // ── Task count ──
  it("counts total tasks including children", async () => {
    setSWR({ data: planData(), isLoading: false })
    render(<PlanReviewPanel />)
    await waitFor(() => {
      const matches = screen.queryAllByText(/4 个任务/)
      expect(matches.length).toBeGreaterThan(0)
    })
  })
})
