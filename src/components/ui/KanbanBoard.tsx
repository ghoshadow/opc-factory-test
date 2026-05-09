"use client"

import { useState, useCallback, useRef } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { cn } from "@/lib/utils"
import { KanbanCard, KanbanCardOverlay } from "./KanbanCard"
import type { KanbanBoardProps, KanbanCard as KanbanCardData, KanbanColumn } from "@/types/kanban"

const priorityOrder: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

function sortCards(cards: KanbanCardData[]): KanbanCardData[] {
  return [...cards].sort((a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99))
}

function findColumnByCardId(columns: KanbanColumn[], cardId: string): KanbanColumn | undefined {
  return columns.find((col) => col.cards.some((c) => c.id === cardId))
}

function ColumnDropZone({
  column,
  activeId,
  activeColumnId,
}: {
  column: KanbanColumn
  activeId: string | null
  activeColumnId: string | null
}) {
  const isDropTarget = activeId !== null && activeColumnId !== column.id

  const sorted = sortCards(column.cards)

  return (
    <div
      data-column-id={column.id}
      className={cn(
        "flex flex-col rounded-lg border bg-muted/30 transition-colors",
        isDropTarget && "ring-2 ring-primary/50 bg-primary/5",
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b">
        <h3 className="text-sm font-semibold">{column.title}</h3>
        <span className="inline-flex items-center justify-center size-5 rounded-full bg-muted-foreground/15 text-[11px] font-medium text-muted-foreground">
          {column.cards.length}
        </span>
      </div>
      <SortableContext items={sorted.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-2 min-h-[80px]">
          {sorted.map((card) => (
            <KanbanCard key={card.id} card={card} isDragging={activeId === card.id} />
          ))}
          {sorted.length === 0 && (
            <div className="flex items-center justify-center h-16 text-xs text-muted-foreground/50">
              Drop cards here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export function KanbanBoard({ columns, onCardMove }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const columnsRef = useRef(columns)
  columnsRef.current = columns

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const activeCard = activeId
    ? columns.flatMap((c) => c.cards).find((c) => c.id === activeId) ?? null
    : null

  const activeColumnId = activeId
    ? findColumnByCardId(columns, activeId)?.id ?? null
    : null

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)

      const { active, over } = event
      if (!over) return

      const cardId = active.id as string
      const fromColumn = findColumnByCardId(columnsRef.current, cardId)
      if (!fromColumn) return

      // Determine target column: try over element's column, then check all columns
      let toColumn: KanbanColumn | undefined

      // Check if the over element is a card in a column
      toColumn = findColumnByCardId(columnsRef.current, over.id as string)

      // If over is a column container itself (data attr match)
      if (!toColumn && typeof over.id === "string") {
        toColumn = columnsRef.current.find((c) => c.id === over.id)
      }

      // Walk up DOM to find the column
      if (!toColumn) {
        const target = document.getElementById(over.id as string) || document.querySelector(`[data-id="${over.id}"]`)
        if (target) {
          const columnEl = target.closest("[data-column-id]") as HTMLElement | null
          if (columnEl) {
            toColumn = columnsRef.current.find((c) => c.id === columnEl.dataset.columnId)
          }
        }
      }

      if (toColumn && fromColumn.id !== toColumn.id) {
        onCardMove(cardId, fromColumn.id, toColumn.id)
      }
    },
    [onCardMove],
  )

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-4 w-full">
        {columns.map((column) => (
          <ColumnDropZone key={column.id} column={column} activeId={activeId} activeColumnId={activeColumnId} />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeCard ? <KanbanCardOverlay card={activeCard} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
