"use client"

import { useRef, useState } from "react"
import useSWR from "swr"
import { Anchor, GitBranch, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { PlanReviewPanel } from "@/components/coding/PlanReviewPanel"
import { DesignReviewPanel } from "@/components/coding/DesignReviewPanel"
import { TocoReport } from "@/components/coding/TocoReport"
import { Skeleton } from "@/components/ui/skeleton"
import type { CodingOpsResponse, PipelineRun, PipelineStageStatus } from "@/types/factory"

const fetcher = (url: string): Promise<CodingOpsResponse> =>
  fetch(url).then((res) => res.json())

const statusConfig: Record<PipelineStageStatus, { dotColor: string; borderColor: string; bg: string; textColor: string }> = {
  waiting: { dotColor: "bg-muted-foreground/40", borderColor: "border-muted-foreground/20", bg: "bg-muted/50", textColor: "text-muted-foreground/60" },
  running: { dotColor: "bg-blue-500 animate-pulse", borderColor: "border-blue-300 dark:border-blue-700", bg: "bg-blue-50 dark:bg-blue-950/30", textColor: "text-blue-700 dark:text-blue-300" },
  done: { dotColor: "bg-emerald-500", borderColor: "border-emerald-300 dark:border-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-950/30", textColor: "text-emerald-700 dark:text-emerald-300" },
  failed: { dotColor: "bg-red-500", borderColor: "border-red-300 dark:border-red-700", bg: "bg-red-50 dark:bg-red-950/30", textColor: "text-red-700 dark:text-red-300" },
}

const sections = [
  { id: "pipeline", label: "流水线", icon: GitBranch },
  { id: "plan-review", label: "Plan Review", icon: GitBranch },
  { id: "design-review", label: "Design Review", icon: GitBranch },
  { id: "toco", label: "TocoAgent", icon: GitBranch },
  { id: "kanban", label: "看板", icon: GitBranch },
]

function PipelineFlow({ data }: { data: PipelineRun }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">编码流水线</h2>
        {data.startedAt && (
          <span className="text-xs text-muted-foreground tabular-nums">
            启动于 {new Date(data.startedAt).toLocaleTimeString("zh-CN")}
          </span>
        )}
      </div>
      <div className="flex items-start gap-0 overflow-x-auto pb-3">
        {data.stages.map((stage, i) => {
          const cfg = statusConfig[stage.status]
          const isActive = stage.id === data.currentStageId
          return (
            <div key={stage.id} className="flex items-center shrink-0">
              <div
                className={cn(
                  "relative flex flex-col items-center rounded-lg border-2 px-3 py-3 text-center min-w-[90px] sm:min-w-[100px] transition-all",
                  cfg.borderColor, cfg.bg,
                  isActive && "ring-2 ring-blue-300 ring-offset-2",
                  stage.status === "failed" && "ring-1 ring-red-200",
                )}
              >
                <span className={cn("mb-1.5 size-2.5 rounded-full", cfg.dotColor, isActive && "size-3")} />
                <span className={cn("text-xs font-semibold leading-tight", cfg.textColor)}>{stage.label}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{stage.subtext}</span>
                {isActive && (
                  <span className="absolute -top-2 rounded-full bg-blue-500 px-2 py-px text-[10px] font-bold text-white">进行中</span>
                )}
              </div>
              {i < data.stages.length - 1 && (
                <div className="flex items-center shrink-0">
                  <div className={cn("h-px w-6 sm:w-10", stage.status === "done" || stage.status === "running" ? "bg-blue-400" : "bg-muted-foreground/20")} />
                  <Play className={cn("size-3 -ml-1 rotate-90", stage.status === "done" || stage.status === "running" ? "text-blue-400" : "text-muted-foreground/30")} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function KanbanSection({ data }: { data: CodingOpsResponse }) {
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)
  const [draggingItem, setDraggingItem] = useState<{ itemId: string; fromCol: string } | null>(null)

  const handleDragStart = (e: React.DragEvent, itemId: string, colId: string) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ itemId, colId }))
    e.dataTransfer.effectAllowed = "move"
    setDraggingItem({ itemId, fromCol: colId })
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-3">
        <GitBranch className="size-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">编码看板</h2>
          <p className="text-xs text-muted-foreground">拖拽卡片切换状态</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {data.kanban.columns.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id) }}
            onDragLeave={() => setDragOverCol(null)}
            className={cn(
              "rounded-lg border bg-muted/20 p-3 transition-colors",
              dragOverCol === col.id && "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{col.label}</span>
              <span className="text-xs font-semibold tabular-nums text-muted-foreground bg-muted rounded-full px-2 py-0.5">{col.items.length}</span>
            </div>
            <div className="space-y-2 min-h-[60px]">
              {col.items.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id, col.id)}
                  onDragEnd={() => { setDragOverCol(null); setDraggingItem(null) }}
                  className={cn(
                    "rounded-lg border bg-card p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all",
                    draggingItem?.itemId === item.id && "opacity-50 scale-95"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="size-3.5 text-muted-foreground/30 mt-0.5 shrink-0">⠿</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {item.tags.map((tag) => (
                          <span key={tag} className="inline-flex rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{tag}</span>
                        ))}
                        <span className="text-[10px] text-muted-foreground/60 ml-auto">{item.owner}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {col.items.length === 0 && (
                <div className="flex items-center justify-center h-16 rounded-lg border border-dashed">
                  <p className="text-xs text-muted-foreground/50">暂无任务</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CodingOpsPage() {
  const { data, error, isLoading } = useSWR<CodingOpsResponse>(
    "/api/v1/coding/ops",
    fetcher,
    { refreshInterval: 15000 }
  )

  const pipelineRef = useRef<HTMLDivElement>(null)
  const planReviewRef = useRef<HTMLDivElement>(null)
  const designReviewRef = useRef<HTMLDivElement>(null)
  const tocoRef = useRef<HTMLDivElement>(null)
  const kanbanRef = useRef<HTMLDivElement>(null)

  const scrollTo = (id: string) => {
    const refMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
      pipeline: pipelineRef,
      "plan-review": planReviewRef,
      "design-review": designReviewRef,
      toco: tocoRef,
      kanban: kanbanRef,
    }
    refMap[id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">编码产线操作台</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          流水线 · Plan Review · Design Review · TocoAgent · 看板
        </p>
      </div>

      {/* Anchor navigation */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 w-fit">
        <Anchor className="size-3.5 text-muted-foreground ml-2 mr-1" />
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className="px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">加载编码产线数据失败，请稍后重试</p>
        </div>
      ) : data ? (
        <>
          <div ref={pipelineRef} id="pipeline" className="scroll-mt-20">
            <PipelineFlow data={data.pipeline} />
          </div>
          <div ref={planReviewRef} id="plan-review" className="scroll-mt-20">
            <PlanReviewPanel />
          </div>
          <div ref={designReviewRef} id="design-review" className="scroll-mt-20">
            <DesignReviewPanel items={data.designReview} />
          </div>
          <div ref={tocoRef} id="toco" className="scroll-mt-20">
            <TocoReport data={data.tocoReport} />
          </div>
          <div ref={kanbanRef} id="kanban" className="scroll-mt-20">
            <KanbanSection data={data} />
          </div>
        </>
      ) : null}
    </div>
  )
}
