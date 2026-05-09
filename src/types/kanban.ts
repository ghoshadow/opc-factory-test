export interface KanbanCard {
  id: string
  title: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  assignee?: string
  dueDate?: string
}

export interface KanbanColumn {
  id: string
  title: string
  cards: KanbanCard[]
}

export interface KanbanBoardProps {
  columns: KanbanColumn[]
  onCardMove: (cardId: string, fromColumn: string, toColumn: string) => void
}
