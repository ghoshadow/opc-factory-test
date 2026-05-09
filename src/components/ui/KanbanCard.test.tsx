import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { KanbanCard, KanbanCardOverlay } from "./KanbanCard"
import type { KanbanCard as KanbanCardData } from "@/types/kanban"

afterEach(() => {
  cleanup()
})

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
  }),
}))

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => undefined } },
}))

function makeCard(overrides: Partial<KanbanCardData> = {}): KanbanCardData {
  return {
    id: "card-1",
    title: "Test Card",
    priority: "medium",
    ...overrides,
  }
}

describe("KanbanCard", () => {
  it("renders card title", () => {
    render(<KanbanCard card={makeCard({ title: "Fix login bug" })} />)
    expect(screen.getByText("Fix login bug")).toBeInTheDocument()
  })

  it("renders priority badge for urgent", () => {
    render(<KanbanCard card={makeCard({ priority: "urgent" })} />)
    expect(screen.getByText("P0")).toBeInTheDocument()
  })

  it("renders priority badge for high", () => {
    render(<KanbanCard card={makeCard({ priority: "high" })} />)
    expect(screen.getByText("P1")).toBeInTheDocument()
  })

  it("renders priority badge for medium", () => {
    render(<KanbanCard card={makeCard({ priority: "medium" })} />)
    expect(screen.getByText("P2")).toBeInTheDocument()
  })

  it("renders priority badge for low", () => {
    render(<KanbanCard card={makeCard({ priority: "low" })} />)
    expect(screen.getByText("P3")).toBeInTheDocument()
  })

  it("renders assignee initials when assignee provided", () => {
    render(<KanbanCard card={makeCard({ assignee: "Alice Wang" })} />)
    expect(screen.getByText("AW")).toBeInTheDocument()
  })

  it("renders single-word assignee initials", () => {
    render(<KanbanCard card={makeCard({ assignee: "Bob" })} />)
    expect(screen.getByText("B")).toBeInTheDocument()
  })

  it("does not render assignee when not provided", () => {
    render(<KanbanCard card={makeCard({ assignee: undefined })} />)
    // No initials element should be present
    expect(screen.queryByTitle("Alice Wang")).not.toBeInTheDocument()
  })

  it("renders due date when provided", () => {
    const future = new Date()
    future.setDate(future.getDate() + 3)
    render(<KanbanCard card={makeCard({ dueDate: future.toISOString() })} />)
    expect(screen.getByText("3d left")).toBeInTheDocument()
  })

  it("renders 'Today' for today's date", () => {
    render(<KanbanCard card={makeCard({ dueDate: new Date().toISOString() })} />)
    expect(screen.getByText("Today")).toBeInTheDocument()
  })

  it("does not render due date when not provided", () => {
    render(<KanbanCard card={makeCard({ dueDate: undefined })} />)
    // No date text present
    expect(screen.queryByText(/left|ago|Today|Tomorrow|Yesterday/)).not.toBeInTheDocument()
  })

  it("applies dragging opacity when isDragging is true", () => {
    const { container } = render(<KanbanCard card={makeCard()} isDragging />)
    const card = container.firstElementChild as HTMLElement
    expect(card.className).toContain("opacity-30")
  })

  it("renders drag handle button", () => {
    render(<KanbanCard card={makeCard()} />)
    expect(screen.getByLabelText("Drag to reorder")).toBeInTheDocument()
  })
})

describe("KanbanCardOverlay", () => {
  it("renders card title", () => {
    render(<KanbanCardOverlay card={makeCard({ title: "Overlay Card" })} />)
    expect(screen.getByText("Overlay Card")).toBeInTheDocument()
  })

  it("renders priority badge", () => {
    render(<KanbanCardOverlay card={makeCard({ priority: "urgent" })} />)
    expect(screen.getByText("P0")).toBeInTheDocument()
  })

  it("renders assignee initials", () => {
    render(<KanbanCardOverlay card={makeCard({ assignee: "Jane Doe" })} />)
    expect(screen.getByText("JD")).toBeInTheDocument()
  })
})
