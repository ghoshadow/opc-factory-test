import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import type { Incident } from "@/types/factory"

import { IncidentDetail } from "@/components/sre/IncidentDetail"

function sampleIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: "inc-001",
    description: "支付回调接口 5xx 错误率突增至 2.3%",
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
      relatedServices: ["order-service", "payment-gateway", "postgresql"],
      suggestion: "添加索引并扩大连接池",
    },
    bugPreview: {
      title: "[紧急] 支付回调缺少索引",
      module: "order-service",
      severity: "P0",
      description: "orders 表缺少 payment_channel 索引。",
    },
    ...overrides,
  }
}

describe("IncidentDetail", () => {
  const onBack = vi.fn()
  const onReflow = vi.fn()

  afterEach(() => {
    cleanup()
  })

  // ── Header ──
  it("renders incident ID", () => {
    render(
      <IncidentDetail
        incident={sampleIncident()}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.getByText("inc-001")).toBeInTheDocument()
  })

  it("renders severity badge", () => {
    render(
      <IncidentDetail
        incident={sampleIncident({ severity: "P1" })}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.getByText("P1")).toBeInTheDocument()
  })

  it("renders status badge", () => {
    render(
      <IncidentDetail
        incident={sampleIncident({ status: "待诊断" })}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.getByText("待诊断")).toBeInTheDocument()
  })

  it("calls onBack when back button clicked", () => {
    render(
      <IncidentDetail
        incident={sampleIncident()}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    fireEvent.click(screen.getByText("返回列表"))
    expect(onBack).toHaveBeenCalled()
  })

  // ── Description section ──
  it("renders incident description", () => {
    render(
      <IncidentDetail
        incident={sampleIncident()}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.getByText("支付回调接口 5xx 错误率突增至 2.3%")).toBeInTheDocument()
  })

  it("renders alert source", () => {
    render(
      <IncidentDetail
        incident={sampleIncident()}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.getByText(/Prometheus 告警规则: HighErrorRate/)).toBeInTheDocument()
  })

  // ── Diagnosis section (with diagnosis) ──
  it("renders diagnosis result section", () => {
    render(
      <IncidentDetail
        incident={sampleIncident()}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.getByText("诊断结果")).toBeInTheDocument()
  })

  it("renders root cause", () => {
    render(
      <IncidentDetail
        incident={sampleIncident()}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.getByText("数据库连接池耗尽")).toBeInTheDocument()
  })

  it("renders impact scope", () => {
    render(
      <IncidentDetail
        incident={sampleIncident()}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.getByText("影响所有支付回调")).toBeInTheDocument()
  })

  it("renders suggestion", () => {
    render(
      <IncidentDetail
        incident={sampleIncident()}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.getByText("添加索引并扩大连接池")).toBeInTheDocument()
  })

  it("renders related services as tags", () => {
    render(
      <IncidentDetail
        incident={sampleIncident({
          service: "my-service",
          diagnosis: {
            rootCause: "root cause",
            impactScope: "impact",
            priority: "P1",
            confidence: 80,
            relatedServices: ["svc-a", "svc-b", "svc-c"],
            suggestion: "suggestion",
          },
        })}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.getByText("svc-a")).toBeInTheDocument()
    expect(screen.getByText("svc-b")).toBeInTheDocument()
    expect(screen.getByText("svc-c")).toBeInTheDocument()
  })

  it("renders confidence bar", () => {
    render(
      <IncidentDetail
        incident={sampleIncident()}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.getByText("92%")).toBeInTheDocument()
  })

  // ── Diagnosis section (pending - no diagnosis) ──
  it("renders pending diagnosis state", () => {
    render(
      <IncidentDetail
        incident={sampleIncident({ diagnosis: null })}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.getByText("等待诊断")).toBeInTheDocument()
    expect(screen.getByText(/Incident Agent 正在分析中/)).toBeInTheDocument()
  })

  // ── Reflow button ──
  it("shows reflow button for diagnosed incidents", () => {
    render(
      <IncidentDetail
        incident={sampleIncident({ status: "已诊断" })}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.getByText("回流至 Intake")).toBeInTheDocument()
  })

  it("hides reflow button for non-diagnosed incidents", () => {
    render(
      <IncidentDetail
        incident={sampleIncident({ status: "待诊断" })}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.queryByText("回流至 Intake")).not.toBeInTheDocument()
  })

  it("hides reflow button for reflowed incidents", () => {
    render(
      <IncidentDetail
        incident={sampleIncident({ status: "已回流" })}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.queryByText("回流至 Intake")).not.toBeInTheDocument()
  })

  it("calls onReflow when reflow button clicked", () => {
    render(
      <IncidentDetail
        incident={sampleIncident({ id: "inc-001", status: "已诊断" })}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    fireEvent.click(screen.getByText("回流至 Intake"))
    expect(onReflow).toHaveBeenCalledWith("inc-001")
  })

  it("disables reflow button when reflowing", () => {
    render(
      <IncidentDetail
        incident={sampleIncident({ status: "已诊断" })}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={true}
      />,
    )
    const button = screen.getByText("回流中...")
    expect(button).toBeDisabled()
  })

  // ── Bug preview section ──
  it("renders bug preview when present", () => {
    render(
      <IncidentDetail
        incident={sampleIncident()}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.getByText("自动生成 Bug 预览")).toBeInTheDocument()
    expect(screen.getByText("[紧急] 支付回调缺少索引")).toBeInTheDocument()
  })

  it("hides bug preview when null", () => {
    render(
      <IncidentDetail
        incident={sampleIncident({ bugPreview: null })}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.queryByText("自动生成 Bug 预览")).not.toBeInTheDocument()
  })

  // ── Service and time info ──
  it("renders service and discovery time", () => {
    render(
      <IncidentDetail
        incident={sampleIncident({
          service: "unique-svc-name",
          diagnosis: {
            rootCause: "root cause",
            impactScope: "impact",
            priority: "P1",
            confidence: 80,
            relatedServices: [],
            suggestion: "suggestion",
          },
        })}
        onBack={onBack}
        onReflow={onReflow}
        reflowing={false}
      />,
    )
    expect(screen.getByText(/unique-svc-name/)).toBeInTheDocument()
  })
})
