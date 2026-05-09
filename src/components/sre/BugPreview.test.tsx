import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import type { BugPreview as BugPreviewType } from "@/types/factory"

import { BugPreview } from "@/components/sre/BugPreview"

const p0Bug: BugPreviewType = {
  title: "[紧急] 支付回调 orders 表缺少索引",
  module: "order-service",
  severity: "P0",
  description: "orders 表缺少 payment_channel 索引，慢查询导致连接池耗尽。",
}

const p1Bug: BugPreviewType = {
  title: "[高优] 库存服务缓存预热未执行",
  module: "inventory-service",
  severity: "P1",
  description: "部署流水线缺少 post-deploy hook 执行缓存预热。",
}

const p2Bug: BugPreviewType = {
  title: "[普通] 网关健康检查超时配置过短",
  module: "api-gateway",
  severity: "P2",
  description: "健康检查 2s 超时未能覆盖 GC 停顿波动。",
}

const p3Bug: BugPreviewType = {
  title: "[低优] 日志格式优化",
  module: "logging-service",
  severity: "P3",
  description: "结构化日志格式优化。",
}

describe("BugPreview", () => {
  afterEach(() => {
    cleanup()
  })
  it("renders bug title", () => {
    render(<BugPreview bug={p0Bug} />)
    expect(screen.getByText(p0Bug.title)).toBeInTheDocument()
  })

  it("renders module name", () => {
    render(<BugPreview bug={p0Bug} />)
    expect(screen.getByText(p0Bug.module)).toBeInTheDocument()
  })

  it("renders bug description", () => {
    render(<BugPreview bug={p0Bug} />)
    expect(screen.getByText(p0Bug.description)).toBeInTheDocument()
  })

  it("renders severity badge for P0", () => {
    render(<BugPreview bug={p0Bug} />)
    expect(screen.getByText("P0")).toBeInTheDocument()
  })

  it("renders severity badge for P1", () => {
    render(<BugPreview bug={p1Bug} />)
    expect(screen.getByText("P1")).toBeInTheDocument()
  })

  it("renders severity badge for P2", () => {
    render(<BugPreview bug={p2Bug} />)
    expect(screen.getByText("P2")).toBeInTheDocument()
  })

  it("renders severity badge for P3", () => {
    render(<BugPreview bug={p3Bug} />)
    expect(screen.getByText("P3")).toBeInTheDocument()
  })

  it("shows footer hint about reflow", () => {
    render(<BugPreview bug={p0Bug} />)
    expect(
      screen.getByText(/回流后将自动在 Intake 创建此 Bug 工单/),
    ).toBeInTheDocument()
  })
})
