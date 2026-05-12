import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ArchaeologyResponse } from "@/types/factory"

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

import { ArchaeologyReport } from "@/components/coding/ArchaeologyReport"

function reportData(): ArchaeologyResponse {
  return {
    report: {
      id: "arch-test-project",
      projectId: "test-project",
      createdAt: "2026-05-10T08:00:00Z",
      codeTree: {
        name: "test-project",
        type: "directory",
        children: [
          {
            name: "src",
            type: "directory",
            children: [
              { name: "App.tsx", type: "file", size: 1500, lines: 55, language: "tsx" },
              { name: "index.ts", type: "file", size: 300, lines: 12, language: "ts" },
            ],
          },
          { name: "package.json", type: "file", size: 2400, lines: 45 },
        ],
      },
      dependencies: {
        production: [
          { name: "react", version: "18.2.0", type: "production", usedBy: ["App.tsx"] },
        ],
        dev: [
          { name: "typescript", version: "5.3.0", type: "dev", usedBy: ["*.ts"] },
        ],
        internal: [
          { name: "components", coupling: 0.85 },
        ],
        graph: [
          { source: "App.tsx", target: "index.ts", weight: 0.8 },
        ],
      },
      techDebt: [
        {
          id: "td-001",
          type: "security",
          severity: "critical",
          location: "App.tsx:15",
          description: "硬编码凭据",
          suggestion: "使用环境变量",
        },
        {
          id: "td-002",
          type: "deprecated_api",
          severity: "major",
          location: "index.ts:42",
          description: "过时 API 使用",
          suggestion: "迁移到新版 API",
        },
        {
          id: "td-003",
          type: "code_quality",
          severity: "minor",
          location: "App.tsx:35",
          description: "组件过大",
          suggestion: "拆分子组件",
        },
      ],
      changeHistory: [
        {
          period: "2026-Q1",
          commits: 45,
          filesChanged: 28,
          insertions: 3400,
          deletions: 1200,
          topAuthors: ["Zhang Wei"],
          description: "功能开发期",
        },
      ],
      reverseSpec: {
        id: "reverse-001",
        sourceRepo: "https://github.com/example/test",
        minedAt: "2026-05-10T08:00:00Z",
        qualityScore: 0.78,
        userStory: "作为用户，我想要一个仪表盘",
        acceptanceCriteria: [
          {
            id: "ac-001",
            given: "用户已登录",
            when: "访问仪表盘",
            then: "展示 KPI 卡片",
          },
        ],
        dataContract: {
          inputs: [
            { name: "lineId", type: "string", required: false, constraint: "enum" },
          ],
          outputs: [
            { name: "kpis", type: "KpiData[]", required: true },
          ],
        },
        uxDraft: "## 仪表盘布局\n\n```\n+---+\n|KPI|\n+---+\n```",
      },
    },
  }
}

function setSWR(state: { data?: ArchaeologyResponse | null; error?: Error | null; isLoading?: boolean }) {
  swrState = {
    data: state.data,
    error: state.error ?? undefined,
    isLoading: state.isLoading ?? false,
    isValidating: false,
    mutate: mockMutate,
  }
}

describe("ArchaeologyReport", () => {
  beforeEach(() => {
    mockMutate.mockReset()
    swrState = { data: undefined, error: undefined, isLoading: true, isValidating: false, mutate: mockMutate }
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  // ── Loading ──
  it("shows skeleton loading state", () => {
    setSWR({ isLoading: true })
    render(<ArchaeologyReport projectId="test-project" />)
    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })

  // ── Error ──
  it("shows error message when fetch fails", () => {
    setSWR({ error: new Error("fetch failed"), isLoading: false })
    render(<ArchaeologyReport projectId="test-project" />)
    expect(screen.getByText("考古分析加载失败")).toBeInTheDocument()
  })

  // ── Header ──
  it("renders header with project id", () => {
    setSWR({ data: reportData(), isLoading: false })
    render(<ArchaeologyReport projectId="test-project" />)
    expect(screen.getByText("代码考古报告")).toBeInTheDocument()
    expect(screen.getAllByText("test-project").length).toBeGreaterThan(0)
  })

  // ── Quality score ──
  it("displays reverse spec quality score", () => {
    setSWR({ data: reportData(), isLoading: false })
    render(<ArchaeologyReport projectId="test-project" />)
    expect(screen.getAllByText("78%").length).toBeGreaterThan(0)
  })

  // ── Tab navigation (AC: four-part archaeology results) ──
  it("renders all four tabs", () => {
    setSWR({ data: reportData(), isLoading: false })
    render(<ArchaeologyReport projectId="test-project" />)
    expect(screen.getAllByText("代码结构").length).toBeGreaterThan(0)
    expect(screen.getAllByText("依赖关系").length).toBeGreaterThan(0)
    expect(screen.getAllByText("技术债务").length).toBeGreaterThan(0)
    expect(screen.getAllByText("逆向 Spec").length).toBeGreaterThan(0)
  })

  // ── Code structure tab ──
  it("shows code tree on structure tab", () => {
    setSWR({ data: reportData(), isLoading: false })
    render(<ArchaeologyReport projectId="test-project" />)
    // Default tab is structure
    expect(screen.getByText("App.tsx")).toBeInTheDocument()
    expect(screen.getByText("package.json")).toBeInTheDocument()
  })

  it("counts total nodes in tree", () => {
    setSWR({ data: reportData(), isLoading: false })
    render(<ArchaeologyReport projectId="test-project" />)
    // test-project + src + App.tsx + index.ts + package.json = 5 nodes
    expect(screen.getByText("5 个节点")).toBeInTheDocument()
  })

  // ── Dependencies tab ──
  it("shows production and dev dependencies", async () => {
    const user = userEvent.setup()
    setSWR({ data: reportData(), isLoading: false })
    render(<ArchaeologyReport projectId="test-project" />)

    await user.click(screen.getByText("依赖关系"))
    expect(screen.getByText("react")).toBeInTheDocument()
    expect(screen.getByText("typescript")).toBeInTheDocument()
  })

  it("shows dependency graph edges", async () => {
    const user = userEvent.setup()
    setSWR({ data: reportData(), isLoading: false })
    render(<ArchaeologyReport projectId="test-project" />)

    await user.click(screen.getByText("依赖关系"))
    expect(screen.getByText("App.tsx")).toBeInTheDocument()
    expect(screen.getByText("index.ts")).toBeInTheDocument()
  })

  // ── Tech debt tab ──
  it("shows sorted tech debt items on tech debt tab", async () => {
    const user = userEvent.setup()
    setSWR({ data: reportData(), isLoading: false })
    render(<ArchaeologyReport projectId="test-project" />)

    await user.click(screen.getByText("技术债务"))
    // Critical item should be visible (AC: sorted by severity)
    expect(screen.getByText("严重")).toBeInTheDocument()
    expect(screen.getByText("重要")).toBeInTheDocument()
    expect(screen.getByText("建议")).toBeInTheDocument()
  })

  it("displays tech debt type labels", async () => {
    const user = userEvent.setup()
    setSWR({ data: reportData(), isLoading: false })
    render(<ArchaeologyReport projectId="test-project" />)

    await user.click(screen.getByText("技术债务"))
    expect(screen.getByText("安全漏洞")).toBeInTheDocument()
    expect(screen.getByText("过时 API")).toBeInTheDocument()
    expect(screen.getByText("代码质量")).toBeInTheDocument()
  })

  // ── Reverse spec tab ──
  it("shows reverse spec with Meta-Spec tabs", async () => {
    const user = userEvent.setup()
    setSWR({ data: reportData(), isLoading: false })
    render(<ArchaeologyReport projectId="test-project" />)

    await user.click(screen.getByText("逆向 Spec"))
    // Change history is shown
    expect(screen.getByText("历史变更模式")).toBeInTheDocument()
    // Spec tabs should be visible
    expect(screen.getByText("User Story")).toBeInTheDocument()
    expect(screen.getByText("验收标准 (AC)")).toBeInTheDocument()
    expect(screen.getByText("数据契约")).toBeInTheDocument()
    expect(screen.getByText("UX 雏形")).toBeInTheDocument()
  })

  it("shows change history pattern", async () => {
    const user = userEvent.setup()
    setSWR({ data: reportData(), isLoading: false })
    render(<ArchaeologyReport projectId="test-project" />)

    await user.click(screen.getByText("逆向 Spec"))
    expect(screen.getByText("2026-Q1")).toBeInTheDocument()
    expect(screen.getByText("功能开发期")).toBeInTheDocument()
  })

  it("navigates between reverse spec sub-tabs", async () => {
    const user = userEvent.setup()
    setSWR({ data: reportData(), isLoading: false })
    render(<ArchaeologyReport projectId="test-project" />)

    await user.click(screen.getByText("逆向 Spec"))
    await user.click(screen.getByText("验收标准 (AC)"))
    expect(screen.getByText("ac-001")).toBeInTheDocument()
  })

  // ── AC: Error states show error reason ──
  it("shows error reason text on failure", () => {
    setSWR({ error: new Error("Network error"), isLoading: false })
    render(<ArchaeologyReport projectId="test-project" />)
    expect(screen.getByText("考古分析加载失败")).toBeInTheDocument()
    // Error message is displayed
    expect(screen.getByText("Network error")).toBeInTheDocument()
  })
})
