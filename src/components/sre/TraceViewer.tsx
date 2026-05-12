"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, Circle } from "lucide-react"
import type { TraceSpan, TraceData } from "@/types/factory"

interface Props {
  trace: TraceData
}

function SpanRow({ span, depth, totalDuration, rootStartTime }: { span: TraceSpan; depth: number; totalDuration: number; rootStartTime: number }) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = span.children && span.children.length > 0

  const spanStart = new Date(span.startTime).getTime()
  const barLeft = ((spanStart - rootStartTime) / totalDuration) * 100
  const barWidth = Math.max((span.duration / totalDuration) * 100, 2)

  return (
    <>
      <div className="group flex items-center gap-2 py-1.5 px-3 hover:bg-muted/30 text-sm border-b border-border/50">
        {/* Expand toggle */}
        <div className="w-5 shrink-0">
          {hasChildren ? (
            <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
              {expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            </button>
          ) : null}
        </div>

        {/* Service & operation */}
        <div className="w-[200px] shrink-0 min-w-0" style={{ paddingLeft: `${depth * 16}px` }}>
          <span className="font-medium text-xs truncate block">{span.operation}</span>
          <span className="text-[10px] text-muted-foreground">{span.service}</span>
        </div>

        {/* Duration bar */}
        <div className="flex-1 relative h-5">
          <div className="absolute inset-y-0 bg-muted rounded-sm w-full" />
          <div
            className={`absolute inset-y-0 rounded-sm ${span.status === "error" ? "bg-red-400/60" : "bg-blue-400/60"}`}
            style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
          />
        </div>

        {/* Duration & status */}
        <div className="flex items-center gap-2 w-[100px] shrink-0 text-right">
          <span className="text-xs font-mono">{span.duration}ms</span>
          <Circle className={`size-2 fill-current ${span.status === "error" ? "text-red-500" : "text-emerald-500"}`} />
        </div>
      </div>

      {expanded && hasChildren && span.children!.map((child) => (
        <SpanRow key={child.id} span={child} depth={depth + 1} totalDuration={totalDuration} rootStartTime={rootStartTime} />
      ))}
    </>
  )
}

export function TraceViewer({ trace }: Props) {
  return (
    <div className="space-y-4">
      {/* Trace header */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Trace ID:</span>
          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{trace.traceId}</code>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-semibold">{trace.duration}ms</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Spans:</span>
          <span className="font-semibold">{trace.totalSpans}</span>
        </div>
      </div>

      {/* Span waterfall */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 py-2 px-3 text-xs font-medium text-muted-foreground bg-muted/50 border-b">
          <div className="w-5 shrink-0" />
          <div className="w-[200px] shrink-0">Operation / Service</div>
          <div className="flex-1">Duration</div>
          <div className="w-[100px] shrink-0 text-right">Latency</div>
        </div>

        {/* Span rows */}
        <div className="max-h-[400px] overflow-y-auto">
          <SpanRow span={trace.rootSpan} depth={0} totalDuration={trace.duration} rootStartTime={new Date(trace.rootSpan.startTime).getTime()} />
        </div>
      </div>
    </div>
  )
}
