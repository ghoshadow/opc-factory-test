import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import type { SreCheckerResponse } from "@/types/factory"

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

import { SreCheckerPanel } from "@/components/sre/SreCheckerPanel"

function checkerData(overrides: Partial<SreCheckerResponse> = {}): SreCheckerResponse {
  return {
    items: [
      {
        id: "slo-compliance",
        name: "SLO 达标",
        description: "支付回调 5xx 率 ≤ 0.1%",
        status: "pass",
        detail: "当前 5xx 率: 0.03%",
      },
      {
        id: "alert-coverage",
        name: "告警覆盖",
        description: "所有关键路径有告警规则",
        status: "pass",
        detail: "6/6 关键路径已配置告警",
      },
      {
        id: "rollback-ready",
        name: "回滚就绪",
        description: "回滚预案已配置并验证",
        status: "pass",
        detail: "回滚方案已验证",
        supplementLabel: "查看回滚手册",
      },
      {
        id: "data-migration",
        name: "数据迁移",
        description: "数据库迁移脚本已验证",
        status: "fail",
        detail: "缺少回滚脚本",
        supplementLabel: "补充回滚脚本",
      },
      {
        id: "timeout-config",
        name: "超时声明",
        description: "所有外部接口有 timeout 配置",
        status: "warning",
        detail: "4/5 外部接口已配置",
        supplementLabel: "补充 timeout 配置",
      },
    ],
    allPass: false,
    canRelease: false,
    ...overrides,
  }
}

function setSWR(state: { data?: SreCheckerResponse | null; error?: Error | null; isLoading?: boolean }) {
  swrState = {
    data: state.data,
    error: state.error ?? undefined,
    isLoading: state.isLoading ?? false,
    isValidating: false,
    mutate: mockMutate,
  }
}

describe("SreCheckerPanel", () => {
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
    render(<SreCheckerPanel />)
    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })

  // ── Error ──
  it("shows error message when fetch fails", () => {
    setSWR({ error: new Error("fail"), isLoading: false })
    render(<SreCheckerPanel />)
    expect(screen.getByText("加载失败")).toBeInTheDocument()
    expect(screen.getByText("无法获取 SRE Checker 数据，请稍后重试")).toBeInTheDocument()
  })

  // ── Null ──
  it("renders nothing for null data", () => {
    setSWR({ data: null, isLoading: false })
    const { container } = render(<SreCheckerPanel />)
    expect(container.innerHTML).toBe("")
  })

  // ── Header ──
  it("renders header with title and subtitle", () => {
    setSWR({ data: checkerData(), isLoading: false })
    render(<SreCheckerPanel />)
    expect(screen.getAllByText("SRE Checker 发布门禁").length).toBeGreaterThan(0)
    expect(screen.getAllByText("五项检查 · 全部通过才可发布").length).toBeGreaterThan(0)
  })

  // ── Summary stats ──
  it("shows pass/fail/warning summary counts", () => {
    setSWR({ data: checkerData(), isLoading: false })
    render(<SreCheckerPanel />)
    expect(screen.getAllByText("3 通过").length).toBeGreaterThan(0)
    expect(screen.getAllByText("1 警告").length).toBeGreaterThan(0)
    expect(screen.getAllByText("1 未通过").length).toBeGreaterThan(0)
  })

  // ── Checker cards ──
  it("renders checker cards with names", () => {
    setSWR({ data: checkerData(), isLoading: false })
    render(<SreCheckerPanel />)
    expect(screen.getAllByText("SLO 达标").length).toBeGreaterThan(0)
    expect(screen.getAllByText("告警覆盖").length).toBeGreaterThan(0)
    expect(screen.getAllByText("回滚就绪").length).toBeGreaterThan(0)
    expect(screen.getAllByText("数据迁移").length).toBeGreaterThan(0)
    expect(screen.getAllByText("超时声明").length).toBeGreaterThan(0)
  })

  it("shows correct status badges for each status type", () => {
    setSWR({ data: checkerData(), isLoading: false })
    render(<SreCheckerPanel />)
    expect(screen.getAllByText("通过").length).toBeGreaterThan(0)
    expect(screen.getAllByText("未通过").length).toBeGreaterThan(0)
    expect(screen.getAllByText("警告").length).toBeGreaterThan(0)
  })

  it("shows detail text in each card", () => {
    setSWR({ data: checkerData(), isLoading: false })
    render(<SreCheckerPanel />)
    expect(screen.getAllByText("当前 5xx 率: 0.03%").length).toBeGreaterThan(0)
    expect(screen.getAllByText("6/6 关键路径已配置告警").length).toBeGreaterThan(0)
    expect(screen.getAllByText("缺少回滚脚本").length).toBeGreaterThan(0)
    expect(screen.getAllByText("4/5 外部接口已配置").length).toBeGreaterThan(0)
  })

  it("shows supplement button for non-pass items", () => {
    setSWR({ data: checkerData(), isLoading: false })
    render(<SreCheckerPanel />)
    expect(screen.getAllByText("补充回滚脚本").length).toBeGreaterThan(0)
    expect(screen.getAllByText("补充 timeout 配置").length).toBeGreaterThan(0)
  })

  it("hides supplement button for pass items", () => {
    // "回滚就绪" has status "pass" with supplementLabel, but button should not show
    setSWR({ data: checkerData(), isLoading: false })
    render(<SreCheckerPanel />)
    expect(screen.queryByText("查看回滚手册")).toBeNull()
  })

  // ── Gate result: blocked ──
  it("shows blocked release when canRelease is false", () => {
    setSWR({ data: checkerData({ canRelease: false, allPass: false }), isLoading: false })
    render(<SreCheckerPanel />)
    expect(screen.getAllByText("发布阻断 — 存在未通过的检查项").length).toBeGreaterThan(0)
  })

  it("lists failing items in blocked gate", () => {
    setSWR({ data: checkerData({ canRelease: false, allPass: false }), isLoading: false })
    render(<SreCheckerPanel />)
    const items = document.querySelectorAll("ul li")
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  // ── Gate result: all pass ──
  it("shows release allowed when all pass", () => {
    setSWR({
      data: checkerData({
        canRelease: true,
        allPass: true,
        items: [
          { id: "1", name: "Check 1", description: "desc", status: "pass", detail: "ok" },
          { id: "2", name: "Check 2", description: "desc", status: "pass", detail: "ok" },
        ],
      }),
      isLoading: false,
    })
    render(<SreCheckerPanel />)
    expect(screen.getAllByText("可以发布 — 五项检查全部通过").length).toBeGreaterThan(0)
    expect(screen.getAllByText("允许推向 Prod 环境").length).toBeGreaterThan(0)
  })

  // ── Pass/total display ──
  it("displays correct pass/total ratio", () => {
    setSWR({ data: checkerData(), isLoading: false })
    render(<SreCheckerPanel />)
    expect(screen.getAllByText("项通过").length).toBeGreaterThan(0)
  })

  // ── Empty items list ──
  it("renders with empty items", () => {
    setSWR({ data: checkerData({ items: [], allPass: true, canRelease: true }), isLoading: false })
    render(<SreCheckerPanel />)
    expect(screen.getAllByText("SRE Checker 发布门禁").length).toBeGreaterThan(0)
  })
})
