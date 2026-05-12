import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { AlertRuleListResponse } from "@/types/factory"

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

import { AlertRuleList } from "@/components/sre/AlertRuleList"

function alertRulesData(overrides: Partial<AlertRuleListResponse> = {}): AlertRuleListResponse {
  return {
    rules: [
      {
        id: "ar-001",
        name: "F-2341: Silent Gap",
        metric: "spec_silent_gap_hours",
        condition: "gt",
        threshold: 48,
        severity: "warning",
        enabled: true,
        routing: [
          { target: "oncall", label: "SRE 值班人员", enabled: true },
          { target: "opc", label: "对应产线 OPC", enabled: false },
          { target: "auto_remediation", label: "自愈触发", enabled: false },
        ],
        description: "需求产线 Spec 静默缺口",
        createdAt: "2026-04-10T08:00:00Z",
        updatedAt: "2026-05-08T14:00:00Z",
      },
      {
        id: "ar-002",
        name: "F-2360: Spec-Code Drift",
        metric: "spec_code_drift_pct",
        condition: "gt",
        threshold: 10,
        severity: "critical",
        enabled: false,
        routing: [
          { target: "oncall", label: "SRE 值班人员", enabled: true },
          { target: "opc", label: "对应产线 OPC", enabled: true },
          { target: "auto_remediation", label: "自愈触发", enabled: true },
        ],
        description: "Spec-Code 漂移超过 10%",
        createdAt: "2026-04-12T09:00:00Z",
        updatedAt: "2026-05-09T10:00:00Z",
      },
    ],
    total: 2,
    ...overrides,
  }
}

function setSWR(state: { data?: AlertRuleListResponse | null; error?: Error | null; isLoading?: boolean }) {
  swrState = {
    data: state.data,
    error: state.error ?? undefined,
    isLoading: state.isLoading ?? false,
    isValidating: false,
    mutate: mockMutate,
  }
}

const onSelect = vi.fn()
const onCreateNew = vi.fn()

describe("AlertRuleList", () => {
  beforeEach(() => {
    mockMutate.mockReset()
    onSelect.mockReset()
    onCreateNew.mockReset()
    swrState = { data: undefined, error: undefined, isLoading: true, isValidating: false, mutate: mockMutate }
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  // ── Loading ──
  it("shows skeleton loading state", () => {
    setSWR({ isLoading: true })
    render(<AlertRuleList onSelect={onSelect} onCreateNew={onCreateNew} />)
    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })

  // ── Error ──
  it("shows error message when fetch fails", () => {
    setSWR({ error: new Error("fail"), isLoading: false })
    render(<AlertRuleList onSelect={onSelect} onCreateNew={onCreateNew} />)
    expect(screen.getByText("加载失败")).toBeInTheDocument()
    expect(screen.getByText("无法获取告警规则列表，请稍后重试")).toBeInTheDocument()
  })

  // ── Empty ──
  it("shows empty state when no rules exist", () => {
    setSWR({ data: alertRulesData({ rules: [], total: 0 }), isLoading: false })
    render(<AlertRuleList onSelect={onSelect} onCreateNew={onCreateNew} />)
    expect(screen.getByText("暂无告警规则")).toBeInTheDocument()
  })

  // ── Populated ──
  it("renders all alert rules", () => {
    setSWR({ data: alertRulesData(), isLoading: false })
    render(<AlertRuleList onSelect={onSelect} onCreateNew={onCreateNew} />)
    expect(screen.getByText("F-2341: Silent Gap")).toBeInTheDocument()
    expect(screen.getByText("F-2360: Spec-Code Drift")).toBeInTheDocument()
  })

  it("shows rule description", () => {
    setSWR({ data: alertRulesData(), isLoading: false })
    render(<AlertRuleList onSelect={onSelect} onCreateNew={onCreateNew} />)
    expect(screen.getByText("需求产线 Spec 静默缺口")).toBeInTheDocument()
  })

  it("shows metric and condition for each rule", () => {
    setSWR({ data: alertRulesData(), isLoading: false })
    render(<AlertRuleList onSelect={onSelect} onCreateNew={onCreateNew} />)
    expect(screen.getByText("spec_silent_gap_hours")).toBeInTheDocument()
    expect(screen.getByText("> 48")).toBeInTheDocument()
  })

  it("shows total count in footer", () => {
    setSWR({ data: alertRulesData(), isLoading: false })
    render(<AlertRuleList onSelect={onSelect} onCreateNew={onCreateNew} />)
    expect(screen.getByText("共 2 条规则")).toBeInTheDocument()
  })

  // ── Selection ──
  it("highlights selected rule", () => {
    setSWR({ data: alertRulesData(), isLoading: false })
    render(<AlertRuleList onSelect={onSelect} selectedId="ar-001" onCreateNew={onCreateNew} />)
    // The selected rule button should have the primary background class
    const selectedBtn = screen.getByText("F-2341: Silent Gap").closest("button")
    expect(selectedBtn?.className).toContain("primary")
  })

  // ── Create new button ──
  it("calls onCreateNew when create button clicked", async () => {
    setSWR({ data: alertRulesData(), isLoading: false })
    render(<AlertRuleList onSelect={onSelect} onCreateNew={onCreateNew} />)
    await userEvent.click(screen.getByText("新建告警规则"))
    expect(onCreateNew).toHaveBeenCalledTimes(1)
  })

  // ── Search ──
  it("filters rules by name", async () => {
    setSWR({ data: alertRulesData(), isLoading: false })
    render(<AlertRuleList onSelect={onSelect} onCreateNew={onCreateNew} />)
    const searchInput = screen.getByPlaceholderText("搜索告警规则...")
    await userEvent.type(searchInput, "Drift")
    expect(screen.getByText("F-2360: Spec-Code Drift")).toBeInTheDocument()
    expect(screen.queryByText("F-2341: Silent Gap")).toBeNull()
  })

  it("filters rules by metric", async () => {
    setSWR({ data: alertRulesData(), isLoading: false })
    render(<AlertRuleList onSelect={onSelect} onCreateNew={onCreateNew} />)
    const searchInput = screen.getByPlaceholderText("搜索告警规则...")
    await userEvent.type(searchInput, "silent_gap")
    expect(screen.getByText("F-2341: Silent Gap")).toBeInTheDocument()
    expect(screen.queryByText("F-2360: Spec-Code Drift")).toBeNull()
  })

  it("shows no match message when filter finds nothing", async () => {
    setSWR({ data: alertRulesData(), isLoading: false })
    render(<AlertRuleList onSelect={onSelect} onCreateNew={onCreateNew} />)
    const searchInput = screen.getByPlaceholderText("搜索告警规则...")
    await userEvent.type(searchInput, "nonexistent")
    expect(screen.getByText("无匹配结果")).toBeInTheDocument()
  })
})
