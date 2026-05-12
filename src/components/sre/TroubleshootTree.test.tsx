import { describe, it, expect, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
import type { TroubleshootNode } from "@/types/factory"

import { TroubleshootTree } from "@/components/sre/TroubleshootTree"

function makeNode(overrides: Partial<TroubleshootNode> = {}): TroubleshootNode {
  return {
    id: "ts-1",
    question: "服务无法启动",
    steps: ["检查端口占用: lsof -i :3000", "查看启动日志: tail -f logs/app.log"],
    solution: "释放端口后重启服务",
    children: [],
    ...overrides,
  }
}

describe("TroubleshootTree", () => {
  afterEach(() => {
    cleanup()
  })

  // ── Empty state ──
  it("shows empty state when nodes array is empty", () => {
    render(<TroubleshootTree nodes={[]} />)
    expect(screen.getByText("暂无排障节点")).toBeInTheDocument()
    expect(screen.getByText("编辑 Runbook 添加排障树节点")).toBeInTheDocument()
  })

  // ── Single node ──
  it("renders a single node with question", () => {
    const nodes = [makeNode({ question: "服务无法启动" })]
    render(<TroubleshootTree nodes={nodes} />)
    expect(screen.getByText("服务无法启动")).toBeInTheDocument()
  })

  it("renders node steps", () => {
    const nodes = [makeNode({ steps: ["检查端口占用", "查看启动日志"] })]
    render(<TroubleshootTree nodes={nodes} />)
    expect(screen.getByText("检查端口占用")).toBeInTheDocument()
    expect(screen.getByText("查看启动日志")).toBeInTheDocument()
  })

  it("renders node solution", () => {
    const nodes = [makeNode({ solution: "释放端口后重启" })]
    render(<TroubleshootTree nodes={nodes} />)
    expect(screen.getByText("释放端口后重启")).toBeInTheDocument()
  })

  it("shows placeholder text for empty steps", () => {
    const nodes = [makeNode({ steps: [""] })]
    render(<TroubleshootTree nodes={nodes} />)
    expect(screen.getByText("(空步骤)")).toBeInTheDocument()
  })

  it("shows placeholder text for unnamed questions", () => {
    const nodes = [makeNode({ question: "" })]
    render(<TroubleshootTree nodes={nodes} />)
    expect(screen.getByText("未命名问题")).toBeInTheDocument()
  })

  // ── Multiple nodes ──
  it("renders multiple top-level nodes", () => {
    const nodes = [
      makeNode({ id: "ts-1", question: "服务无法启动" }),
      makeNode({ id: "ts-2", question: "数据库连接失败" }),
    ]
    render(<TroubleshootTree nodes={nodes} />)
    expect(screen.getByText("服务无法启动")).toBeInTheDocument()
    expect(screen.getByText("数据库连接失败")).toBeInTheDocument()
  })

  // ── Child nodes ──
  it("renders child nodes under parent", () => {
    const nodes = [
      makeNode({
        id: "ts-1",
        question: "服务无法启动",
        children: [makeNode({ id: "ts-1-1", question: "端口被占用" })],
      }),
    ]
    render(<TroubleshootTree nodes={nodes} />)
    expect(screen.getByText("端口被占用")).toBeInTheDocument()
    expect(screen.getByText("子问题")).toBeInTheDocument()
  })

  // ── Collapse/Expand ──
  it("collapses node content when toggle is clicked", () => {
    const nodes = [makeNode({ question: "服务无法启动", steps: ["检查端口"] })]
    render(<TroubleshootTree nodes={nodes} />)

    const toggle = screen.getByLabelText("收起")
    fireEvent.click(toggle)

    // Steps should no longer be visible after collapse
    expect(screen.queryByText("检查端口")).not.toBeInTheDocument()
  })

  it("expands node content when collapsed node toggle is clicked", () => {
    const nodes = [makeNode({ question: "服务无法启动", steps: ["检查端口"] })]
    render(<TroubleshootTree nodes={nodes} />)

    // Collapse first
    const toggle = screen.getByLabelText("收起")
    fireEvent.click(toggle)

    // Then expand again
    const expandToggle = screen.getByLabelText("展开")
    fireEvent.click(expandToggle)

    // Steps should be visible again
    expect(screen.getByText("检查端口")).toBeInTheDocument()
  })
})
