import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReflowBugListResponse } from "@/types/factory"

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

import { BugReflow } from "@/components/sre/BugReflow"

function bugListData(
  overrides: Partial<ReflowBugListResponse> = {}
): ReflowBugListResponse {
  return {
    bugs: [
      {
        id: "BUG-201",
        title: "支付回调超时导致订单状态不一致",
        description: "支付回调接口偶发超时",
        priority: "P0",
        module: "支付模块",
        status: "open",
        source: "Incident Agent",
        createdAt: "2026-05-09T08:15:00Z",
        timeline: [
          {
            id: "t1",
            status: "open",
            label: "Bug 单生成",
            description: "Incident Agent 检测到告警",
            timestamp: "2026-05-09T08:15:00Z",
          },
        ],
      },
      {
        id: "BUG-202",
        title: "数据库连接池耗尽",
        description: "高峰期数据库连接池耗尽",
        priority: "P1",
        module: "基础设施",
        status: "open",
        source: "SRE Monitor",
        createdAt: "2026-05-09T09:30:00Z",
        timeline: [
          {
            id: "t1",
            status: "open",
            label: "Bug 单生成",
            description: "SRE 监控系统检测到告警",
            timestamp: "2026-05-09T09:30:00Z",
          },
        ],
      },
      {
        id: "BUG-203",
        title: "缓存雪崩导致首页加载超时",
        description: "缓存集中过期导致数据库瞬时 QPS 飙升",
        priority: "P0",
        module: "基础设施",
        status: "reflowed_to_intake",
        source: "Incident Agent",
        createdAt: "2026-05-08T14:00:00Z",
        timeline: [
          {
            id: "t1",
            status: "open",
            label: "Bug 单生成",
            description: "Incident Agent 检测到告警",
            timestamp: "2026-05-08T14:00:00Z",
          },
          {
            id: "t2",
            status: "reflowed_to_intake",
            label: "已回流至 Intake",
            description: "SRE OPC 确认并回流",
            timestamp: "2026-05-08T14:30:00Z",
          },
        ],
      },
    ],
    total: 3,
    ...overrides,
  }
}

function setSWR(state: {
  data?: ReflowBugListResponse | null
  error?: Error | null
  isLoading?: boolean
}) {
  swrState.data = state.data
  swrState.error = state.error ?? undefined
  swrState.isLoading = state.isLoading ?? false
  swrState.isValidating = false
  swrState.mutate = mockMutate
}

function renderBugReflow(
  state: {
    data?: ReflowBugListResponse | null
    error?: Error | null
    isLoading?: boolean
  } = {}
) {
  cleanup()
  setSWR(state)
  return render(<BugReflow />)
}

describe("BugReflow", () => {
  beforeEach(() => {
    mockMutate.mockReset()
    swrState.data = undefined
    swrState.error = undefined
    swrState.isLoading = true
    swrState.isValidating = false
    swrState.mutate = mockMutate
  })

  // ── Loading ──
  it("shows skeleton loading state", () => {
    renderBugReflow({ isLoading: true })
    expect(
      document.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(0)
  })

  // ── Error ──
  it("shows error message when fetch fails", () => {
    renderBugReflow({ error: new Error("fail"), isLoading: false })
    expect(screen.getByText("加载失败")).toBeInTheDocument()
    expect(
      screen.getByText("无法获取 Bug 列表，请稍后重试")
    ).toBeInTheDocument()
  })

  // ── Null ──
  it("renders nothing for null data", () => {
    const { container } = renderBugReflow({ data: null, isLoading: false })
    expect(container.innerHTML).toBe("")
  })

  // ── Header ──
  it("renders header with title", () => {
    renderBugReflow({ data: bugListData(), isLoading: false })
    expect(screen.getByText("Bug 回流管理")).toBeInTheDocument()
    expect(
      screen.getByText("SRE 确认 Bug 内容并回流至需求产线")
    ).toBeInTheDocument()
  })

  // ── Bug list count ──
  it("shows bug count in header", () => {
    renderBugReflow({ data: bugListData(), isLoading: false })
    expect(screen.getByText("个 Bug")).toBeInTheDocument()
  })

  // ── Bug list items ──
  it("renders bug list items with titles", () => {
    renderBugReflow({ data: bugListData(), isLoading: false })
    expect(screen.getByText("支付回调超时导致订单状态不一致")).toBeInTheDocument()
    expect(screen.getByText("数据库连接池耗尽")).toBeInTheDocument()
    expect(screen.getByText("缓存雪崩导致首页加载超时")).toBeInTheDocument()
  })

  // ── Priority badges ──
  it("shows priority badges for bugs", () => {
    renderBugReflow({ data: bugListData(), isLoading: false })
    const p0Badges = screen.getAllByText("P0")
    expect(p0Badges.length).toBeGreaterThanOrEqual(2)
  })

  // ── Status labels ──
  it("shows status labels for bugs", () => {
    renderBugReflow({ data: bugListData(), isLoading: false })
    expect(screen.getAllByText("待回流").length).toBeGreaterThan(0)
    expect(screen.getAllByText("已回流至 Intake").length).toBeGreaterThan(0)
  })

  // ── Bug Detail ──
  it("navigates to bug detail on click", async () => {
    renderBugReflow({ data: bugListData(), isLoading: false })
    const user = userEvent.setup()
    await user.click(screen.getByText("支付回调超时导致订单状态不一致"))
    expect(screen.getByText("返回列表")).toBeInTheDocument()
    expect(screen.getByText("Bug 描述")).toBeInTheDocument()
    expect(screen.getByText("状态追踪")).toBeInTheDocument()
  })

  it("shows reflow button for open bugs in detail view", async () => {
    renderBugReflow({ data: bugListData(), isLoading: false })
    const user = userEvent.setup()
    await user.click(screen.getByText("支付回调超时导致订单状态不一致"))
    expect(screen.getByText("回流至 Intake")).toBeInTheDocument()
  })

  // ── Back navigation ──
  it("returns to list view on back button click", async () => {
    renderBugReflow({ data: bugListData(), isLoading: false })
    const user = userEvent.setup()
    await user.click(screen.getByText("支付回调超时导致订单状态不一致"))
    expect(screen.getByText("返回列表")).toBeInTheDocument()
    await user.click(screen.getByText("返回列表"))
    expect(screen.getByText("Bug 回流管理")).toBeInTheDocument()
  })

  // ── Reflow confirmation dialog ──
  it("opens reflow confirmation dialog on reflow button click", async () => {
    renderBugReflow({ data: bugListData(), isLoading: false })
    const user = userEvent.setup()
    await user.click(screen.getByText("支付回调超时导致订单状态不一致"))
    await user.click(screen.getByText("回流至 Intake"))
    expect(screen.getAllByText("确认回流").length).toBeGreaterThanOrEqual(1)
    expect(
      screen.getByText("确认 Bug 内容后回流至需求产线 Intake")
    ).toBeInTheDocument()
  })

  // ── Status timeline in detail ──
  it("shows status timeline entries in detail view", async () => {
    renderBugReflow({ data: bugListData(), isLoading: false })
    const user = userEvent.setup()
    await user.click(screen.getByText("缓存雪崩导致首页加载超时"))
    const entries = screen.getAllByText("已回流至 Intake")
    expect(entries.length).toBeGreaterThanOrEqual(1)
  })

  // ── Empty bug list ──
  it("renders with empty bug list", () => {
    renderBugReflow({ data: { bugs: [], total: 0 }, isLoading: false })
    expect(screen.getByText("Bug 回流管理")).toBeInTheDocument()
  })
})
