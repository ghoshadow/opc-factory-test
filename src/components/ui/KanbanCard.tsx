"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";
import type { KanbanCard as KanbanCardData } from "@/types/kanban";

interface KanbanCardProps {
  card: KanbanCardData;
  isDragging?: boolean;
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  urgent: { label: "P0", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  high: { label: "P1", color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  medium: { label: "P2", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  low: { label: "P3", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

function formatDueDate(dateStr: string): { text: string; isOverdue: boolean } {
  const due = new Date(dateStr);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0;

  if (diffDays === 0) return { text: "Today", isOverdue: false };
  if (diffDays === 1) return { text: "Tomorrow", isOverdue: false };
  if (diffDays === -1) return { text: "Yesterday", isOverdue: true };
  if (isOverdue) return { text: `${Math.abs(diffDays)}d ago`, isOverdue: true };
  if (diffDays <= 7) return { text: `${diffDays}d left`, isOverdue: false };
  return {
    text: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    isOverdue: false,
  };
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function KanbanCard({ card, isDragging }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: card.id,
    data: { columnId: card.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityConfig[card.priority] ?? priorityConfig.medium;
  const dueDate = card.dueDate ? formatDueDate(card.dueDate) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "opacity-30",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab touch-none text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium leading-snug truncate">{card.title}</h4>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={cn(
            "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold",
            priority.color,
          )}
        >
          {priority.label}
        </span>
        {card.assignee && (
          <span
            className="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary"
            title={card.assignee}
          >
            {getInitials(card.assignee)}
          </span>
        )}
        {dueDate && (
          <span
            className={cn(
              "ml-auto text-[11px]",
              dueDate.isOverdue ? "text-red-500 font-medium" : "text-muted-foreground",
            )}
          >
            {dueDate.text}
          </span>
        )}
      </div>
    </div>
  );
}

export function KanbanCardOverlay({ card }: { card: KanbanCardData }) {
  const priority = priorityConfig[card.priority] ?? priorityConfig.medium;
  const dueDate = card.dueDate ? formatDueDate(card.dueDate) : null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-lg rotate-2 scale-105">
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 size-4 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium leading-snug truncate">{card.title}</h4>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={cn(
            "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold",
            priority.color,
          )}
        >
          {priority.label}
        </span>
        {card.assignee && (
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
            {getInitials(card.assignee)}
          </span>
        )}
        {dueDate && (
          <span
            className={cn(
              "ml-auto text-[11px]",
              dueDate.isOverdue ? "text-red-500 font-medium" : "text-muted-foreground",
            )}
          >
            {dueDate.text}
          </span>
        )}
      </div>
    </div>
  );
}
