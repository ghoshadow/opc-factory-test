import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import type { Runbook, RunbookListResponse } from "@/types/factory"

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

import { RunbookList } from "@/components/sre/RunbookList"

function runbookData(overrides: Partial<Runbook> = {}): Runbook {
  return {
    id: "rb-001",
    name: "支付服务运维手册",
    description: "支付网关服务的启动、停止、扩容及故障排查",
    service: "payment-gateway",
    version: 3,
    startStopSteps: ["启动服务: pm2 start"],
    scaleSteps: ["扩容: pm2 scale"],
    troubleshootTree: [],
    emergencyPlan: "## 应急响应",
    topologyExport: "digraph {}",
    createdAt: "2026-04-15T08:00:00Z",
    updatedAt: "2026-05-09T10:30:00Z",
    ...overrides,
  }
}

function listData(runbooks: Runbook[]): RunbookListResponse {
  return { runbooks, total: runbooks.length }
}

function setSWR(state: {
  data?: RunbookListResponse | null
  error?: Error | null
  isLoading?: boolean
}) {
  swrState = {
    data: state.data,
    error: state.error ?? undefined,
    isLoading: state.isLoading ?? false,
    isValidating: false,
    mutate: mockMutate,
  }
}

describe("RunbookList", () => {
  const onSelect = vi.fn()
  const onCreateNew = vi.fn()

  beforeEach(() => {
    mockMutate.mockReset()
    onSelect.mockReset()
    onCreateNew.mockReset()
    swrState = {
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: mockMutate,
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
    cleanup()
  })

  // ── Loading ──
  it("shows skeleton loading state", () => {
    setSWR({ isLoading: true })
    render(<RunbookList onSelect={onSelect} onCreateNew={onCreateNew} />)
    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })

  // ── Error ──
  it("shows error message when fetch fails", () => {
    setSWR({ error: new Error("fail"), isLoading: false })
    render(<RunbookList onSelect={onSelect} onCreateNew={onCreateNew} />)
    expect(screen.getByText("加载失败")).toBeInTheDocument()
    expect(screen.getByText("无法获取 Runbook 列表，请稍后重试")).toBeInTheDocument()
  })

  // ── Empty ──
  it("shows empty state when no runbooks", () => {
    setSWR({ data: listData([]), isLoading: false })
    render(<RunbookList onSelect={onSelect} onCreateNew={onCreateNew} />)
    expect(screen.getByText("暂无 Runbook")).toBeInTheDocument()
  })

  // ── List items ──
  it("renders runbook names", () => {
    const runbooks = [
      runbookData({ id: "rb-001", name: "支付服务运维手册" }),
      runbookData({ id: "rb-002", name: "订单服务运维手册" }),
    ]
    setSWR({ data: listData(runbooks), isLoading: false })
    render(<RunbookList onSelect={onSelect} onCreateNew={onCreateNew} />)
    expect(screen.getByText("支付服务运维手册")).toBeInTheDocument()
    expect(screen.getByText("订单服务运维手册")).toBeInTheDocument()
  })

  it("renders runbook descriptions", () => {
    const runbooks = [runbookData({ id: "rb-001", description: "支付网关运维" })]
    setSWR({ data: listData(runbooks), isLoading: false })
    render(<RunbookList onSelect={onSelect} onCreateNew={onCreateNew} />)
    expect(screen.getByText("支付网关运维")).toBeInTheDocument()
  })

  it("renders service names", () => {
    const runbooks = [runbookData({ id: "rb-001", service: "payment-gateway" })]
    setSWR({ data: listData(runbooks), isLoading: false })
    render(<RunbookList onSelect={onSelect} onCreateNew={onCreateNew} />)
    expect(screen.getByText("payment-gateway")).toBeInTheDocument()
  })

  it("renders version numbers", () => {
    const runbooks = [runbookData({ id: "rb-001", version: 3 })]
    setSWR({ data: listData(runbooks), isLoading: false })
    render(<RunbookList onSelect={onSelect} onCreateNew={onCreateNew} />)
    expect(screen.getByText("v3")).toBeInTheDocument()
  })

  // ── Footer ──
  it("shows total count in footer", () => {
    const runbooks = [runbookData({ id: "rb-001" }), runbookData({ id: "rb-002" })]
    setSWR({ data: listData(runbooks), isLoading: false })
    render(<RunbookList onSelect={onSelect} onCreateNew={onCreateNew} />)
    expect(screen.getByText("共 2 个 Runbook")).toBeInTheDocument()
  })

  // ── Selection ──
  it("calls onSelect when clicking a runbook", () => {
    const runbooks = [runbookData({ id: "rb-001", name: "支付服务运维手册" })]
    setSWR({ data: listData(runbooks), isLoading: false })
    render(<RunbookList onSelect={onSelect} onCreateNew={onCreateNew} />)
    fireEvent.click(screen.getByText("支付服务运维手册"))
    expect(onSelect).toHaveBeenCalledWith(runbooks[0])
  })

  // ── Create new ──
  it("calls onCreateNew when clicking create button", () => {
    setSWR({ data: listData([]), isLoading: false })
    render(<RunbookList onSelect={onSelect} onCreateNew={onCreateNew} />)
    fireEvent.click(screen.getByText("新建 Runbook"))
    expect(onCreateNew).toHaveBeenCalled()
  })

  // ── Search ──
  it("filters runbooks by name", () => {
    const runbooks = [
      runbookData({ id: "rb-001", name: "支付服务运维手册", service: "pg", description: "支付相关描述" }),
      runbookData({ id: "rb-002", name: "订单服务运维手册", service: "os", description: "订单相关描述" }),
    ]
    setSWR({ data: listData(runbooks), isLoading: false })
    render(<RunbookList onSelect={onSelect} onCreateNew={onCreateNew} />)

    const input = screen.getByPlaceholderText("搜索 Runbook...")
    fireEvent.change(input, { target: { value: "支付" } })

    expect(screen.getByText("支付服务运维手册")).toBeInTheDocument()
    expect(screen.queryByText("订单服务运维手册")).not.toBeInTheDocument()
  })

  it("filters runbooks by service", () => {
    const runbooks = [
      runbookData({ id: "rb-001", name: "rb1", service: "payment-gateway" }),
      runbookData({ id: "rb-002", name: "rb2", service: "notification" }),
    ]
    setSWR({ data: listData(runbooks), isLoading: false })
    render(<RunbookList onSelect={onSelect} onCreateNew={onCreateNew} />)

    const input = screen.getByPlaceholderText("搜索 Runbook...")
    fireEvent.change(input, { target: { value: "payment" } })

    expect(screen.getByText("rb1")).toBeInTheDocument()
    expect(screen.queryByText("rb2")).not.toBeInTheDocument()
  })

  it("filters runbooks by description", () => {
    const runbooks = [
      runbookData({ id: "rb-001", name: "rb1", description: "支付网关运维" }),
      runbookData({ id: "rb-002", name: "rb2", description: "通知服务运维" }),
    ]
    setSWR({ data: listData(runbooks), isLoading: false })
    render(<RunbookList onSelect={onSelect} onCreateNew={onCreateNew} />)

    const input = screen.getByPlaceholderText("搜索 Runbook...")
    fireEvent.change(input, { target: { value: "支付" } })

    expect(screen.getByText("rb1")).toBeInTheDocument()
    expect(screen.queryByText("rb2")).not.toBeInTheDocument()
  })

  it("shows no match message when search has no results", () => {
    const runbooks = [runbookData({ id: "rb-001", name: "支付服务" })]
    setSWR({ data: listData(runbooks), isLoading: false })
    render(<RunbookList onSelect={onSelect} onCreateNew={onCreateNew} />)

    const input = screen.getByPlaceholderText("搜索 Runbook...")
    fireEvent.change(input, { target: { value: "nonexistent" } })

    expect(screen.getByText("无匹配结果")).toBeInTheDocument()
  })

  // ── Selected state ──
  it("applies selected style when selectedId matches", () => {
    const name = "unique-runbook-name"
    const runbooks = [runbookData({ id: "rb-001", name })]
    setSWR({ data: listData(runbooks), isLoading: false })
    render(<RunbookList onSelect={onSelect} onCreateNew={onCreateNew} selectedId="rb-001" />)

    const button = screen.getByText(name).closest("button")
    expect(button?.className).toContain("bg-primary/10")
  })
})
