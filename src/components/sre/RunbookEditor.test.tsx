import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { Runbook } from "@/types/factory"

import { RunbookEditor } from "@/components/sre/RunbookEditor"

function runbookData(overrides: Partial<Runbook> = {}): Runbook {
  return {
    id: "rb-001",
    name: "支付服务运维手册",
    description: "支付网关服务的启动、停止、扩容及故障排查",
    service: "payment-gateway",
    version: 3,
    startStopSteps: ["启动服务: pm2 start"],
    scaleSteps: ["扩容: pm2 scale +2"],
    troubleshootTree: [],
    emergencyPlan: "## 应急响应",
    topologyExport: "digraph {}",
    createdAt: "2026-04-15T08:00:00Z",
    updatedAt: "2026-05-09T10:30:00Z",
    ...overrides,
  }
}

describe("RunbookEditor", () => {
  const onBack = vi.fn()
  const onSaved = vi.fn()

  beforeEach(() => {
    vi.restoreAllMocks()
    onBack.mockReset()
    onSaved.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  // ── New runbook mode ──
  it("shows '新建 Runbook' title when runbook is null", () => {
    render(<RunbookEditor runbook={null} onBack={onBack} onSaved={onSaved} />)
    expect(screen.getByText("新建 Runbook")).toBeInTheDocument()
  })

  it("shows empty form fields for new runbook", () => {
    render(<RunbookEditor runbook={null} onBack={onBack} onSaved={onSaved} />)
    const nameInput = screen.getByPlaceholderText("Runbook 名称") as HTMLInputElement
    expect(nameInput.value).toBe("")
  })

  // ── Edit runbook mode ──
  it("shows edit title when runbook is provided", () => {
    render(<RunbookEditor runbook={runbookData({ name: "支付服务运维手册" })} onBack={onBack} onSaved={onSaved} />)
    expect(screen.getByText("编辑: 支付服务运维手册")).toBeInTheDocument()
  })

  it("shows version info when editing", () => {
    render(<RunbookEditor runbook={runbookData({ version: 3 })} onBack={onBack} onSaved={onSaved} />)
    expect(screen.getByText(/当前版本: v3/)).toBeInTheDocument()
    expect(screen.getByText(/保存后将生成 v4/)).toBeInTheDocument()
  })

  it("pre-populates form fields from existing runbook", () => {
    render(<RunbookEditor runbook={runbookData({ name: "支付服务", service: "pg" })} onBack={onBack} onSaved={onSaved} />)
    const nameInput = screen.getByPlaceholderText("Runbook 名称") as HTMLInputElement
    expect(nameInput.value).toBe("支付服务")
  })

  // ── Back navigation ──
  it("calls onBack when back button is clicked", () => {
    render(<RunbookEditor runbook={null} onBack={onBack} onSaved={onSaved} />)
    const backButton = document.querySelector("button")!
    fireEvent.click(backButton)
    expect(onBack).toHaveBeenCalled()
  })

  // ── Save button disabled ──
  it("disables save button when name is empty", () => {
    render(<RunbookEditor runbook={null} onBack={onBack} onSaved={onSaved} />)
    const saveBtn = screen.getByText("保存")
    expect(saveBtn).toBeDisabled()
  })

  it("enables save button when name has content", () => {
    render(<RunbookEditor runbook={null} onBack={onBack} onSaved={onSaved} />)
    const nameInput = screen.getByPlaceholderText("Runbook 名称")
    fireEvent.change(nameInput, { target: { value: "New Runbook" } })
    const saveBtn = screen.getByText("保存")
    expect(saveBtn).not.toBeDisabled()
  })

  // ── Successful save (new) ──
  it("saves new runbook successfully via POST", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "rb-new" }), { status: 201 }),
    )

    render(<RunbookEditor runbook={null} onBack={onBack} onSaved={onSaved} />)

    fireEvent.change(screen.getByPlaceholderText("Runbook 名称"), { target: { value: "New Runbook" } })
    fireEvent.click(screen.getByText("保存"))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/sre/runbooks",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: expect.stringContaining("New Runbook"),
        }),
      )
      expect(onSaved).toHaveBeenCalled()
    })
  })

  // ── Successful save (edit) ──
  it("saves edited runbook via PUT", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "rb-001" }), { status: 200 }),
    )

    render(<RunbookEditor runbook={runbookData({ id: "rb-001", name: "旧名称" })} onBack={onBack} onSaved={onSaved} />)

    fireEvent.click(screen.getByText("保存"))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/sre/runbooks",
        expect.objectContaining({
          method: "PUT",
          body: expect.stringContaining("rb-001"),
        }),
      )
      expect(onSaved).toHaveBeenCalled()
    })
  })

  // ── Save error ──
  it("shows error message on save failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "fail" }), { status: 500 }),
    )

    render(<RunbookEditor runbook={null} onBack={onBack} onSaved={onSaved} />)

    fireEvent.change(screen.getByPlaceholderText("Runbook 名称"), { target: { value: "New Runbook" } })
    fireEvent.click(screen.getByText("保存"))

    await waitFor(() => {
      expect(screen.getByText("保存失败")).toBeInTheDocument()
    })
  })

  // ── Network error ──
  it("shows error message on network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network error"))

    render(<RunbookEditor runbook={null} onBack={onBack} onSaved={onSaved} />)

    fireEvent.change(screen.getByPlaceholderText("Runbook 名称"), { target: { value: "New Runbook" } })
    fireEvent.click(screen.getByText("保存"))

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument()
    })
  })

  // ── Add/remove start/stop steps ──
  it("adds a new start/stop step", () => {
    // Component defaults empty arrays to [""], so scaleSteps: [] → 1 textarea
    render(
      <RunbookEditor
        runbook={runbookData({ startStopSteps: ["step 1"], scaleSteps: [] })}
        onBack={onBack}
        onSaved={onSaved}
      />,
    )

    const addButtons = screen.getAllByText("添加步骤")
    fireEvent.click(addButtons[0]) // First "添加步骤" is for start/stop

    // startStop: 2 (original + new), scale: 1 (default empty)
    const stepInputs = screen.getAllByPlaceholderText(/步骤/)
    expect(stepInputs.length).toBe(3)
  })

  it("removes a start/stop step when trash button is clicked", () => {
    // Component defaults empty arrays to [""], so scaleSteps: [] → 1 textarea
    render(
      <RunbookEditor
        runbook={runbookData({ startStopSteps: ["step 1", "step 2"], scaleSteps: [] })}
        onBack={onBack}
        onSaved={onSaved}
      />,
    )

    const trashButtons = document.querySelectorAll("button svg.lucide-trash2")
    fireEvent.click(trashButtons[0]?.parentElement as HTMLElement)

    // startStop: 1 (after remove), scale: 1 (default empty)
    const stepInputs = screen.getAllByPlaceholderText(/步骤/)
    expect(stepInputs.length).toBe(2)
  })

  // ── Add/remove scale steps ──
  it("adds a new scale step", () => {
    // Component defaults empty arrays to [""], so startStopSteps: [] → 1 textarea
    render(
      <RunbookEditor
        runbook={runbookData({ startStopSteps: [], scaleSteps: ["scale 1"] })}
        onBack={onBack}
        onSaved={onSaved}
      />,
    )

    const addButtons = screen.getAllByText("添加步骤")
    // startStop also has "添加步骤" because empty → [""], click second for scale
    fireEvent.click(addButtons[1])

    // scale: 2 (original + new), startStop: 1 (default empty)
    const stepInputs = screen.getAllByPlaceholderText(/步骤/)
    expect(stepInputs.length).toBe(3)
  })

  // ── Troubleshoot tree nodes ──
  it("shows empty troubleshoot tree message when no nodes", () => {
    render(<RunbookEditor runbook={runbookData({ troubleshootTree: [] })} onBack={onBack} onSaved={onSaved} />)
    expect(screen.getByText(/暂无排障节点/)).toBeInTheDocument()
  })

  it("adds a new troubleshoot node", () => {
    render(<RunbookEditor runbook={runbookData({ troubleshootTree: [] })} onBack={onBack} onSaved={onSaved} />)

    fireEvent.click(screen.getByText("添加节点"))

    expect(screen.getByPlaceholderText("常见问题")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("解决方案")).toBeInTheDocument()
  })

  it("removes a troubleshoot node", () => {
    const node = {
      id: "ts-1",
      question: "测试问题",
      steps: ["step 1"],
      solution: "测试方案",
    }
    render(<RunbookEditor runbook={runbookData({ troubleshootTree: [node] })} onBack={onBack} onSaved={onSaved} />)

    // Click the trash button in the troubleshoot node section
    const trashButtons = document.querySelectorAll("button svg.lucide-trash2")
    // Find the one in the troubleshoot tree section
    const lastTrash = trashButtons[trashButtons.length - 1]
    fireEvent.click(lastTrash?.parentElement as HTMLElement)

    expect(screen.queryByPlaceholderText("常见问题")).not.toBeInTheDocument()
  })

  // ── Emergency plan ──
  it("renders emergency plan textarea pre-populated", () => {
    render(<RunbookEditor runbook={runbookData({ emergencyPlan: "## 应急响应\n### 场景1" })} onBack={onBack} onSaved={onSaved} />)
    const textarea = screen.getByPlaceholderText(/## 应急响应/)
    expect(textarea).toHaveValue("## 应急响应\n### 场景1")
  })

  // ── Topology export ──
  it("renders topology export textarea pre-populated", () => {
    render(<RunbookEditor runbook={runbookData({ topologyExport: "digraph { a -> b; }" })} onBack={onBack} onSaved={onSaved} />)
    const textarea = screen.getByPlaceholderText("digraph { service_a -> service_b; }")
    expect(textarea).toHaveValue("digraph { a -> b; }")
  })

  // ── Show saving state ──
  it("shows '保存中...' while saving", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve(new Response("{}", { status: 200 })), 100)),
    )

    render(<RunbookEditor runbook={runbookData({ name: "Test" })} onBack={onBack} onSaved={onSaved} />)

    fireEvent.click(screen.getByText("保存"))
    expect(screen.getByText("保存中...")).toBeInTheDocument()
  })
})
