import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { AlertRoutingConfig } from "@/types/factory"
import { RoutingConfig } from "@/components/sre/RoutingConfig"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function routingData(): AlertRoutingConfig[] {
  return [
    { target: "oncall", label: "SRE 值班人员", enabled: true },
    { target: "opc", label: "对应产线 OPC", enabled: false },
    { target: "auto_remediation", label: "自愈触发", enabled: false },
  ]
}

describe("RoutingConfig", () => {
  it("renders all three routing options", () => {
    const onToggle = vi.fn()
    render(<RoutingConfig routing={routingData()} onToggle={onToggle} />)
    expect(screen.getByText("SRE 值班人员")).toBeInTheDocument()
    expect(screen.getByText("对应产线 OPC")).toBeInTheDocument()
    expect(screen.getByText("自愈触发")).toBeInTheDocument()
  })

  it("shows section heading", () => {
    render(<RoutingConfig routing={routingData()} onToggle={vi.fn()} />)
    expect(screen.getByText("分级路由配置")).toBeInTheDocument()
  })

  it("shows description for each routing target", () => {
    render(<RoutingConfig routing={routingData()} onToggle={vi.fn()} />)
    expect(screen.getByText("告警触发时通知当前值班 SRE")).toBeInTheDocument()
    expect(screen.getByText("通知对应产线的 OPC (Operation Controller)")).toBeInTheDocument()
    expect(screen.getByText("触发自动处置流程，无需人工介入")).toBeInTheDocument()
  })

  it("shows enabled badge for enabled routes", () => {
    render(<RoutingConfig routing={routingData()} onToggle={vi.fn()} />)
    const enabledBadges = screen.getAllByText("已启用")
    expect(enabledBadges.length).toBe(1)
  })

  it("shows disabled badge for disabled routes", () => {
    render(<RoutingConfig routing={routingData()} onToggle={vi.fn()} />)
    const disabledBadges = screen.getAllByText("已禁用")
    expect(disabledBadges.length).toBe(2)
  })

  it("calls onToggle with correct target when clicked", async () => {
    const onToggle = vi.fn()
    render(<RoutingConfig routing={routingData()} onToggle={onToggle} />)
    await userEvent.click(screen.getByText("自愈触发"))
    expect(onToggle).toHaveBeenCalledWith("auto_remediation")
  })

  it("applies enabled styling to enabled routes", () => {
    render(<RoutingConfig routing={routingData()} onToggle={vi.fn()} />)
    const enabledBtn = screen.getByText("SRE 值班人员").closest("button")
    expect(enabledBtn?.className).toContain("primary")
  })
})
