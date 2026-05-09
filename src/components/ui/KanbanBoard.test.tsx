import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { KanbanBoard } from "./KanbanBoard"
import type { KanbanColumn, KanbanCard as KanbanCardData } from "@/types/kanban"

afterEach(() => {
  cleanup()
})

// Mock @dnd-kit/core
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => children,
  DragOverlay: ({ children }: { children?: React.ReactNode; dropAnimation?: unknown }) => children,
  closestCorners: {},
  PointerSensor: vi.fn(),
  useSensor: () => ({}),
  useSensors: () => [],
}))

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => children,
  verticalListSortingStrategy: {},
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

function makeColumns(): KanbanColumn[] {
  return [
    { id: "backlog", title: "Backlog", cards: [] },
    {
      id: "drafting",
      title: "Drafting",
      cards: [
        makeCard({ id: "c1", title: "Card 1", priority: "low" }),
        makeCard({ id: "c2", title: "Card 2", priority: "urgent" }),
        makeCard({ id: "c3", title: "Card 3", priority: "high" }),
      ],
    },
    { id: "checking", title: "Checking", cards: [] },
    { id: "shipped", title: "Shipped", cards: [] },
  ]
}

describe("KanbanBoard", () => {
  it("renders all column titles", () => {
    const onCardMove = vi.fn()
    render(<KanbanBoard columns={makeColumns()} onCardMove={onCardMove} />)

    expect(screen.getByText("Backlog")).toBeInTheDocument()
    expect(screen.getByText("Drafting")).toBeInTheDocument()
    expect(screen.getByText("Checking")).toBeInTheDocument()
    expect(screen.getByText("Shipped")).toBeInTheDocument()
  })

  it("renders card counts per column", () => {
    const onCardMove = vi.fn()
    render(<KanbanBoard columns={makeColumns()} onCardMove={onCardMove} />)

    // Backlog has 0, Drafting has 3, Checking has 0, Shipped has 0
    const counts = screen.getAllByText(/\d+/)
    const numericCounts = counts.map((el) => Number(el.textContent)).filter((n) => !isNaN(n))
    expect(numericCounts).toContain(0)
    expect(numericCounts).toContain(3)
  })

  it("renders card titles in Drafting column", () => {
    const onCardMove = vi.fn()
    render(<KanbanBoard columns={makeColumns()} onCardMove={onCardMove} />)

    expect(screen.getByText("Card 1")).toBeInTheDocument()
    expect(screen.getByText("Card 2")).toBeInTheDocument()
    expect(screen.getByText("Card 3")).toBeInTheDocument()
  })

  it("sorts cards by priority within columns (urgent first)", () => {
    const onCardMove = vi.fn()
    const { container } = render(<KanbanBoard columns={makeColumns()} onCardMove={onCardMove} />)

    // In the sorted order, urgent (Card 2) should appear before high (Card 3) before low (Card 1)
    const cards = Array.from(container.querySelectorAll("h4")).map((el) => el.textContent)
    const draftingCards = cards.filter((t) => t && ["Card 1", "Card 2", "Card 3"].includes(t))
    expect(draftingCards).toEqual(["Card 2", "Card 3", "Card 1"])
  })

  it("shows empty drop zone placeholder for empty columns", () => {
    const onCardMove = vi.fn()
    render(<KanbanBoard columns={makeColumns()} onCardMove={onCardMove} />)

    // Should have at least one "Drop cards here" placeholder (for empty columns)
    const placeholders = screen.getAllByText("Drop cards here")
    expect(placeholders.length).toBeGreaterThanOrEqual(1)
  })

  it("renders 4-column grid layout", () => {
    const onCardMove = vi.fn()
    const { container } = render(<KanbanBoard columns={makeColumns()} onCardMove={onCardMove} />)

    const grid = container.querySelector(".grid-cols-4")
    expect(grid).toBeInTheDocument()
  })
})
