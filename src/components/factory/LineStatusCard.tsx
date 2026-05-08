"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, Zap, Clock, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/ui/StatusBadge"
import type { LineInfo } from "@/app/api/v1/factory/line-status/route"

interface LineStatusCardProps {
  line: LineInfo
  className?: string
}

export function LineStatusCard({ line, className }: LineStatusCardProps) {
  const router = useRouter()

  return (
    <div
      className={cn(
        "group rounded-xl border bg-card p-5 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-primary/30",
        className,
      )}
      onClick={() => router.push(`/lines/${line.id}`)}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-base">{line.name}</h3>
        <StatusBadge status={line.status} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="flex items-center gap-1.5">
          <Zap className="size-3.5 text-muted-foreground" />
          <div>
            <div className="text-lg font-semibold">{line.throughput}</div>
            <div className="text-[10px] text-muted-foreground">feat/wk</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Package className="size-3.5 text-muted-foreground" />
          <div>
            <div className="text-lg font-semibold">{line.wip}</div>
            <div className="text-[10px] text-muted-foreground">WIP</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-muted-foreground" />
          <div>
            <div className="text-lg font-semibold">{line.cycleTime}</div>
            <div className="text-[10px] text-muted-foreground">hr</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
        <span>查看详情</span>
        <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  )
}
