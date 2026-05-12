import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { AlertRule } from "@/types/factory"
import { AlertRuleForm } from "@/components/sre/AlertRuleForm"

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

function sampleRule(): AlertRule {
  return {
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
  }
}

describe("AlertRuleForm", () => {
  beforeEach(() => {
    mockFetch.mockReset()
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  // ── New mode ──
  it("renders as new rule form when no rule provided", () => {
    render(<AlertRuleForm rule={null} onBack={vi.fn()} onSaved={vi.fn()} />)
    expect(screen.getByText("新建告警规则")).toBeInTheDocument()
  })

  it("has empty fields in new mode", () => {
    render(<AlertRuleForm rule={null} onBack={vi.fn()} onSaved={vi.fn()} />)
    const nameInput = screen.getByPlaceholderText("如 F-2341: Silent Gap")
    expect(nameInput).toHaveValue("")
    const metricInput = screen.getByPlaceholderText("如 payment_callback_5xx_rate")
    expect(metricInput).toHaveValue("")
  })

  // ── Edit mode ──
  it("renders as edit form when rule provided", () => {
    render(<AlertRuleForm rule={sampleRule()} onBack={vi.fn()} onSaved={vi.fn()} />)
    expect(screen.getByText("编辑: F-2341: Silent Gap")).toBeInTheDocument()
  })

  it("pre-populates fields in edit mode", () => {
    render(<AlertRuleForm rule={sampleRule()} onBack={vi.fn()} onSaved={vi.fn()} />)
    const nameInput = screen.getByPlaceholderText("如 F-2341: Silent Gap")
    expect(nameInput).toHaveValue("F-2341: Silent Gap")
    const metricInput = screen.getByPlaceholderText("如 payment_callback_5xx_rate")
    expect(metricInput).toHaveValue("spec_silent_gap_hours")
  })

  // ── Form fields ──
  it("renders all form sections", () => {
    render(<AlertRuleForm rule={sampleRule()} onBack={vi.fn()} onSaved={vi.fn()} />)
    expect(screen.getByText("基本信息")).toBeInTheDocument()
    expect(screen.getByText("触发条件")).toBeInTheDocument()
    expect(screen.getByText("分级路由配置")).toBeInTheDocument()
  })

  it("renders condition select with options", () => {
    render(<AlertRuleForm rule={null} onBack={vi.fn()} onSaved={vi.fn()} />)
    expect(screen.getByText("大于 (>)")).toBeInTheDocument()
  })

  it("renders severity select", () => {
    render(<AlertRuleForm rule={null} onBack={vi.fn()} onSaved={vi.fn()} />)
    expect(screen.getByText("通知 (Info)")).toBeInTheDocument()
  })

  // ── Input changes ──
  it("allows typing in name field", async () => {
    render(<AlertRuleForm rule={null} onBack={vi.fn()} onSaved={vi.fn()} />)
    const nameInput = screen.getByPlaceholderText("如 F-2341: Silent Gap")
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, "Test Rule")
    expect(nameInput).toHaveValue("Test Rule")
  })

  // ── Save disabled ──
  it("disables save when name is empty", () => {
    render(<AlertRuleForm rule={null} onBack={vi.fn()} onSaved={vi.fn()} />)
    const saveBtn = screen.getByText("保存")
    expect(saveBtn).toBeDisabled()
  })

  it("disables save when metric is empty", async () => {
    render(<AlertRuleForm rule={null} onBack={vi.fn()} onSaved={vi.fn()} />)
    const nameInput = screen.getByPlaceholderText("如 F-2341: Silent Gap")
    await userEvent.type(nameInput, "Test")
    const saveBtn = screen.getByText("保存")
    expect(saveBtn).toBeDisabled()
  })

  it("enables save when name and metric are filled", async () => {
    render(<AlertRuleForm rule={null} onBack={vi.fn()} onSaved={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText("如 F-2341: Silent Gap"), "Test")
    await userEvent.type(screen.getByPlaceholderText("如 payment_callback_5xx_rate"), "test_metric")
    const saveBtn = screen.getByText("保存")
    expect(saveBtn).not.toBeDisabled()
  })

  // ── Save: POST (new) ──
  it("calls POST when creating new rule", async () => {
    const onSaved = vi.fn()
    render(<AlertRuleForm rule={null} onBack={vi.fn()} onSaved={onSaved} />)
    await userEvent.type(screen.getByPlaceholderText("如 F-2341: Silent Gap"), "My Rule")
    await userEvent.type(screen.getByPlaceholderText("如 payment_callback_5xx_rate"), "my_metric")
    await userEvent.click(screen.getByText("保存"))
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/sre/alerts",
      expect.objectContaining({ method: "POST" })
    )
  })

  // ── Save: PUT (edit) ──
  it("calls PUT when editing existing rule", async () => {
    const onSaved = vi.fn()
    render(<AlertRuleForm rule={sampleRule()} onBack={vi.fn()} onSaved={onSaved} />)
    await userEvent.click(screen.getByText("保存"))
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/sre/alerts",
      expect.objectContaining({ method: "PUT" })
    )
  })

  // ── Enable/disable toggle ──
  it("shows enabled toggle", () => {
    render(<AlertRuleForm rule={sampleRule()} onBack={vi.fn()} onSaved={vi.fn()} />)
    const enabledEls = screen.getAllByText("已启用")
    expect(enabledEls.length).toBeGreaterThanOrEqual(2) // header toggle + routing badge
  })

  // ── Back button ──
  it("calls onBack when back button clicked", async () => {
    const onBack = vi.fn()
    const { container } = render(<AlertRuleForm rule={sampleRule()} onBack={onBack} onSaved={vi.fn()} />)
    const backButton = container.querySelector("button svg.lucide-arrow-left")?.closest("button")
    if (backButton) await userEvent.click(backButton as HTMLElement)
    expect(onBack).toHaveBeenCalled()
  })
})
