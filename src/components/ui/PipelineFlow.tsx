"use client"

import { cn } from "@/lib/utils"
import { PipelineNode } from "./PipelineNode"

type PipelineStatus = "waiting" | "running" | "done" | "failed"

export interface PipelineNodeData {
  id: string
  label: string
  status: PipelineStatus
  description?: string
}

interface PipelineFlowProps {
  nodes: PipelineNodeData[]
  direction?: "horizontal" | "vertical"
  showLabels?: boolean
  className?: string
}

function ArrowHorizontal() {
  return (
    <svg
      className="mx-1 shrink-0 text-muted-foreground/40"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 5L12 10L7 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowVertical() {
  return (
    <svg
      className="my-1 shrink-0 text-muted-foreground/40"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 7L10 12L15 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PipelineFlow({
  nodes,
  direction = "horizontal",
  showLabels = true,
  className,
}: PipelineFlowProps) {
  if (!nodes.length) return null

  const isHorizontal = direction === "horizontal"
  const Arrow = isHorizontal ? ArrowHorizontal : ArrowVertical

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1",
        isHorizontal ? "flex-row" : "flex-col",
        className,
      )}
    >
      {nodes.map((node, index) => (
        <div key={node.id} className="flex items-center">
          <PipelineNode
            label={showLabels ? node.label : ""}
            status={node.status}
            isActive={node.status === "running"}
          />
          {index < nodes.length - 1 && <Arrow />}
        </div>
      ))}
    </div>
  )
}
