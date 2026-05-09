import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import type { Incident, IncidentListResponse } from "@/types/factory"

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

import { IncidentList } from "@/components/sre/IncidentList"

function incidentData(overrides: Partial<Incident> = {}): Incident {
  return {
    id: "inc-001",
    description: "支付回调接口 5xx 错误率突增",
    severity: "P0",
    status: "已诊断",
    service: "payment-gateway",
    discoveredAt: "2026-05-10T08:23:00Z",
    alertSource: "Prometheus 告警规则: HighErrorRate",
    diagnosis: {
      rootCause: "数据库连接池耗尽",
      impactScope: "影响所有支付回调",
      priority: "P0",
      confidence: 92,
      relatedServices: ["order-service", "payment-gateway"],
      suggestion: "添加索引并扩大连接池",
    },
    bugPreview: {
      title: "Bug title",
      module: "order-service",
      severity: "P0",
      description: "Bug description",
    },
    ...overrides,
  }
}

function listData(incidents: Incident[]): IncidentListResponse {
  return { incidents, total: incidents.length }
}

function setSWR(state: {
  data?: IncidentListResponse | null
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

describe("IncidentList", () => {
  const onSelect = vi.fn()

  beforeEach(() => {
    mockMutate.mockReset()
    onSelect.mockReset()
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
    render(<IncidentList onSelect={onSelect} />)
    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })

  // ── Error ──
  it("shows error message when fetch fails", () => {
    setSWR({ error: new Error("fail"), isLoading: false })
    render(<IncidentList onSelect={onSelect} />)
    expect(screen.getByText("加载失败")).toBeInTheDocument()
    expect(screen.getByText("无法获取 Incident 列表，请稍后重试")).toBeInTheDocument()
  })

  // ── Empty ──
  it("shows empty state when no incidents", () => {
    setSWR({ data: listData([]), isLoading: false })
    render(<IncidentList onSelect={onSelect} />)
    expect(screen.getByText("暂无 Incident")).toBeInTheDocument()
  })

  // ── List items ──
  it("renders incident descriptions", () => {
    const incidents = [
      incidentData({ id: "inc-001", description: "支付回调 5xx" }),
      incidentData({ id: "inc-002", description: "通知推送延迟" }),
    ]
    setSWR({ data: listData(incidents), isLoading: false })
    render(<IncidentList onSelect={onSelect} />)
    expect(screen.getByText("支付回调 5xx")).toBeInTheDocument()
    expect(screen.getByText("通知推送延迟")).toBeInTheDocument()
  })

  it("renders severity badges", () => {
    const incidents = [
      incidentData({ id: "inc-001", severity: "P0" }),
      incidentData({ id: "inc-002", severity: "P1" }),
    ]
    setSWR({ data: listData(incidents), isLoading: false })
    render(<IncidentList onSelect={onSelect} />)
    expect(screen.getByText("P0")).toBeInTheDocument()
    expect(screen.getByText("P1")).toBeInTheDocument()
  })

  it("renders status badges", () => {
    const incidents = [
      incidentData({ id: "inc-001", status: "待诊断" }),
      incidentData({ id: "inc-002", status: "已诊断" }),
      incidentData({ id: "inc-003", status: "已回流" }),
    ]
    setSWR({ data: listData(incidents), isLoading: false })
    render(<IncidentList onSelect={onSelect} />)
    expect(screen.getByText("待诊断")).toBeInTheDocument()
    expect(screen.getByText("已诊断")).toBeInTheDocument()
    expect(screen.getByText("已回流")).toBeInTheDocument()
  })

  it("renders service names", () => {
    const incidents = [incidentData({ id: "inc-001", service: "payment-gateway" })]
    setSWR({ data: listData(incidents), isLoading: false })
    render(<IncidentList onSelect={onSelect} />)
    expect(screen.getByText("payment-gateway")).toBeInTheDocument()
  })

  // ── Footer ──
  it("shows total count in footer", () => {
    const incidents = [incidentData({ id: "inc-001" }), incidentData({ id: "inc-002" })]
    setSWR({ data: listData(incidents), isLoading: false })
    render(<IncidentList onSelect={onSelect} />)
    expect(screen.getByText("共 2 个 Incident")).toBeInTheDocument()
  })

  it("shows pending diagnosis count", () => {
    const incidents = [
      incidentData({ id: "inc-001", status: "待诊断" }),
      incidentData({ id: "inc-002", status: "待诊断" }),
      incidentData({ id: "inc-003", status: "已诊断" }),
    ]
    setSWR({ data: listData(incidents), isLoading: false })
    render(<IncidentList onSelect={onSelect} />)
    expect(screen.getByText("2 待诊断")).toBeInTheDocument()
  })

  // ── Selection ──
  it("calls onSelect when clicking an incident", () => {
    const incidents = [incidentData({ id: "inc-001" })]
    setSWR({ data: listData(incidents), isLoading: false })
    render(<IncidentList onSelect={onSelect} />)
    fireEvent.click(screen.getByText("支付回调接口 5xx 错误率突增"))
    expect(onSelect).toHaveBeenCalledWith(incidents[0])
  })

  // ── Search ──
  it("filters incidents by description", () => {
    const incidents = [
      incidentData({ id: "inc-001", description: "支付回调" }),
      incidentData({ id: "inc-002", description: "通知推送" }),
    ]
    setSWR({ data: listData(incidents), isLoading: false })
    render(<IncidentList onSelect={onSelect} />)

    const input = screen.getByPlaceholderText("搜索 Incident...")
    fireEvent.change(input, { target: { value: "支付" } })

    expect(screen.getByText("支付回调")).toBeInTheDocument()
    expect(screen.queryByText("通知推送")).not.toBeInTheDocument()
  })

  it("filters incidents by service", () => {
    const incidents = [
      incidentData({ id: "inc-001", description: "回调错误", service: "payment-gateway" }),
      incidentData({ id: "inc-002", description: "推送延迟", service: "notification" }),
    ]
    setSWR({ data: listData(incidents), isLoading: false })
    render(<IncidentList onSelect={onSelect} />)

    const input = screen.getByPlaceholderText("搜索 Incident...")
    fireEvent.change(input, { target: { value: "payment" } })

    expect(screen.getByText("回调错误")).toBeInTheDocument()
    expect(screen.queryByText("推送延迟")).not.toBeInTheDocument()
  })

  it("filters incidents by id", () => {
    const incidents = [
      incidentData({ id: "inc-001", description: "回调错误" }),
      incidentData({ id: "inc-002", description: "推送延迟" }),
    ]
    setSWR({ data: listData(incidents), isLoading: false })
    render(<IncidentList onSelect={onSelect} />)

    const input = screen.getByPlaceholderText("搜索 Incident...")
    fireEvent.change(input, { target: { value: "inc-001" } })

    expect(screen.getByText("回调错误")).toBeInTheDocument()
    expect(screen.queryByText("推送延迟")).not.toBeInTheDocument()
  })

  it("shows no match message when search has no results", () => {
    const incidents = [incidentData({ id: "inc-001", description: "回调错误" })]
    setSWR({ data: listData(incidents), isLoading: false })
    render(<IncidentList onSelect={onSelect} />)

    const input = screen.getByPlaceholderText("搜索 Incident...")
    fireEvent.change(input, { target: { value: "nonexistent" } })

    expect(screen.getByText("无匹配结果")).toBeInTheDocument()
  })

  // ── Selected state ──
  it("applies selected style when selectedId matches", () => {
    const description = "selected-incident-unique-desc"
    const incidents = [incidentData({ id: "inc-001", description })]
    setSWR({ data: listData(incidents), isLoading: false })
    render(<IncidentList onSelect={onSelect} selectedId="inc-001" />)

    const button = screen.getByText(description).closest("button")
    expect(button?.className).toContain("bg-primary/10")
  })
})
