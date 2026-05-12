import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { VersionTimeline } from "./VersionTimeline"
import type { SpecVersionsResponse } from "@/types/factory"

// Mock SWR
const mockUseSWR = vi.fn()
vi.mock("swr", () => ({
  default: (...args: unknown[]) => mockUseSWR(...args),
}))

// Mock next/navigation
const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

function makeVersion(overrides: Record<string, unknown> = {}) {
  return {
    id: overrides.id as string ?? "spec-001-v1",
    version: overrides.version as number ?? 1,
    timestamp: overrides.timestamp as string ?? "2026-05-06T08:00:00Z",
    summary: overrides.summary as string ?? "初始 Spec 创建",
    isCurrent: overrides.isCurrent as boolean ?? false,
    content: overrides.content as string | undefined ?? "# Test Content",
  }
}

function makeVersionsResponse(
  versions: ReturnType<typeof makeVersion>[],
): SpecVersionsResponse {
  return { versions }
}

function mockLoading() {
  mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: true })
}

function mockError() {
  mockUseSWR.mockReturnValue({
    data: undefined,
    error: new Error("Fetch failed"),
    isLoading: false,
  })
}

function mockData(response: SpecVersionsResponse) {
  mockUseSWR.mockReturnValue({
    data: response,
    error: undefined,
    isLoading: false,
  })
}

describe("VersionTimeline", () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockUseSWR.mockClear()
  })

  describe("Loading state", () => {
    it("renders skeleton placeholders while loading", () => {
      mockLoading()
      render(<VersionTimeline specId="spec-001" />)
      // Should have skeleton elements (the component renders 4 skeleton items)
      const skeletons = document.querySelectorAll('[data-slot="skeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe("Error state", () => {
    it("renders error message when fetch fails", () => {
      mockError()
      render(<VersionTimeline specId="spec-001" />)
      expect(
        screen.getByText("加载版本历史失败，请稍后重试"),
      ).toBeInTheDocument()
    })
  })

  describe("Empty state", () => {
    it("renders empty message when no versions exist", () => {
      mockData(makeVersionsResponse([]))
      render(<VersionTimeline specId="spec-001" />)
      expect(screen.getByText("暂无版本历史")).toBeInTheDocument()
      expect(screen.getByText("Spec 尚未创建任何版本")).toBeInTheDocument()
    })
  })

  describe("Version list rendering", () => {
    it("renders all versions in the list", () => {
      mockData(
        makeVersionsResponse([
          makeVersion({ version: 3, summary: "V3 summary", isCurrent: true }),
          makeVersion({ version: 2, summary: "V2 summary" }),
          makeVersion({ version: 1, summary: "V1 summary" }),
        ]),
      )
      render(<VersionTimeline specId="spec-001" />)

      expect(screen.getByText("v3")).toBeInTheDocument()
      expect(screen.getByText("v2")).toBeInTheDocument()
      expect(screen.getByText("v1")).toBeInTheDocument()
      expect(screen.getByText("V3 summary")).toBeInTheDocument()
      expect(screen.getByText("V2 summary")).toBeInTheDocument()
      expect(screen.getByText("V1 summary")).toBeInTheDocument()
    })
  })

  describe("Current version highlight", () => {
    it("shows current version badge on the current version", () => {
      mockData(
        makeVersionsResponse([
          makeVersion({ version: 3, isCurrent: true }),
          makeVersion({ version: 2 }),
          makeVersion({ version: 1 }),
        ]),
      )
      render(<VersionTimeline specId="spec-001" />)

      expect(screen.getByText("当前版本")).toBeInTheDocument()
    })

    it("does not show current badge when no version is current", () => {
      mockData(
        makeVersionsResponse([
          makeVersion({ version: 3 }),
          makeVersion({ version: 2 }),
          makeVersion({ version: 1 }),
        ]),
      )
      render(<VersionTimeline specId="spec-001" />)

      expect(screen.queryByText("当前版本")).not.toBeInTheDocument()
    })
  })

  describe("Version selection", () => {
    it("shows initial prompt when no versions selected", () => {
      mockData(
        makeVersionsResponse([
          makeVersion({ version: 2, isCurrent: true }),
          makeVersion({ version: 1 }),
        ]),
      )
      render(<VersionTimeline specId="spec-001" />)

      expect(
        screen.getByText("选择两个版本以对比差异"),
      ).toBeInTheDocument()
    })

    it("updates prompt after selecting first version", async () => {
      mockData(
        makeVersionsResponse([
          makeVersion({ version: 2, isCurrent: true }),
          makeVersion({ version: 1 }),
        ]),
      )
      render(<VersionTimeline specId="spec-001" />)

      const button = screen.getByLabelText("选择 v1")
      await userEvent.click(button)

      expect(screen.getByText("已选 v1，再选一个版本")).toBeInTheDocument()
    })

    it("shows compare prompt when two versions selected", async () => {
      mockData(
        makeVersionsResponse([
          makeVersion({ version: 3, isCurrent: true }),
          makeVersion({ version: 2 }),
          makeVersion({ version: 1 }),
        ]),
      )
      render(<VersionTimeline specId="spec-001" />)

      await userEvent.click(screen.getByLabelText("选择 v1"))
      await userEvent.click(screen.getByLabelText("选择 v3"))

      expect(screen.getByText("对比 v1 ↔ v3")).toBeInTheDocument()
    })

    it("deselects a version when clicked again", async () => {
      mockData(
        makeVersionsResponse([
          makeVersion({ version: 2, isCurrent: true }),
          makeVersion({ version: 1 }),
        ]),
      )
      render(<VersionTimeline specId="spec-001" />)

      const button = screen.getByLabelText("选择 v1")
      await userEvent.click(button)
      await userEvent.click(button)

      expect(
        screen.getByText("选择两个版本以对比差异"),
      ).toBeInTheDocument()
    })

    it("replaces oldest selection when selecting a third version", async () => {
      mockData(
        makeVersionsResponse([
          makeVersion({ version: 3, isCurrent: true }),
          makeVersion({ version: 2 }),
          makeVersion({ version: 1 }),
        ]),
      )
      render(<VersionTimeline specId="spec-001" />)

      await userEvent.click(screen.getByLabelText("选择 v1"))
      await userEvent.click(screen.getByLabelText("选择 v2"))
      // Now selecting v3 should replace v1 (oldest selection)
      await userEvent.click(screen.getByLabelText("选择 v3"))

      // Should show v2 ↔ v3
      expect(screen.getByText("对比 v2 ↔ v3")).toBeInTheDocument()
    })
  })

  describe("Compare button", () => {
    it("is disabled when less than 2 versions selected", () => {
      mockData(
        makeVersionsResponse([
          makeVersion({ version: 2, isCurrent: true }),
          makeVersion({ version: 1 }),
        ]),
      )
      render(<VersionTimeline specId="spec-001" />)

      const btn = screen.getByRole("button", { name: /对比差异/ })
      expect(btn).toBeDisabled()
    })

    it("is enabled when exactly 2 versions selected", async () => {
      mockData(
        makeVersionsResponse([
          makeVersion({ version: 2, isCurrent: true }),
          makeVersion({ version: 1 }),
        ]),
      )
      render(<VersionTimeline specId="spec-001" />)

      await userEvent.click(screen.getByLabelText("选择 v1"))
      await userEvent.click(screen.getByLabelText("选择 v2"))

      const btn = screen.getByRole("button", { name: /对比差异/ })
      expect(btn).not.toBeDisabled()
    })

    it("navigates to diff page on click", async () => {
      mockData(
        makeVersionsResponse([
          makeVersion({ version: 3, isCurrent: true }),
          makeVersion({ version: 2 }),
          makeVersion({ version: 1 }),
        ]),
      )
      render(<VersionTimeline specId="spec-001" />)

      await userEvent.click(screen.getByLabelText("选择 v1"))
      await userEvent.click(screen.getByLabelText("选择 v3"))

      const btn = screen.getByRole("button", { name: /对比差异/ })
      await userEvent.click(btn)

      expect(mockPush).toHaveBeenCalledWith(
        "/l2/spec-editor/diff?specId=spec-001&v1=1&v2=3",
      )
    })
  })

  describe("Content sheet", () => {
    it("opens content sheet when clicking 查看内容", async () => {
      mockData(
        makeVersionsResponse([
          makeVersion({
            version: 1,
            summary: "初始版本",
            content: "# My Spec\n\nSome content",
          }),
        ]),
      )
      render(<VersionTimeline specId="spec-001" />)

      const viewBtn = screen.getByText("查看内容")
      await userEvent.click(viewBtn)

      // Sheet should show the version content
      expect(screen.getByText("变更摘要")).toBeInTheDocument()
      expect(screen.getByText("初始版本")).toBeInTheDocument()
      expect(screen.getByText("Spec 内容")).toBeInTheDocument()
    })

    it("shows no-content message when version has no content", async () => {
      mockData(
        makeVersionsResponse([
          makeVersion({
            version: 1,
            summary: "No content version",
            content: undefined,
          }),
        ]),
      )
      render(<VersionTimeline specId="spec-001" />)

      await userEvent.click(screen.getByText("查看内容"))

      expect(screen.getByText("该版本无内容快照")).toBeInTheDocument()
    })
  })

  describe("API call", () => {
    it("passes correct URL to SWR", () => {
      mockData(makeVersionsResponse([]))
      render(<VersionTimeline specId="spec-001" />)

      expect(mockUseSWR).toHaveBeenCalledWith(
        "/api/v1/specs/spec-001/versions",
        expect.any(Function),
      )
    })
  })
})
