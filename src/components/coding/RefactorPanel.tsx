"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import {
  Hammer,
  AlertTriangle,
  GitCompare,
  ArrowRight,
  FileCode,
  BarChart3,
  PackageCheck,
  Shield,
  Play,
  CheckCircle,
  Loader2,
  Target,
  ChevronRight,
  Clock,
} from "lucide-react"
import type {
  RefactorStatusResponse,
  RefactorChange,
  RefactorImpact,
  RefactorRisk,
  RefactorPhase,
} from "@/types/factory"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const fetcher = (url: string): Promise<RefactorStatusResponse> =>
  fetch(url).then((res) => res.json())

const phaseConfig: Record<RefactorPhase, { label: string; icon: typeof Loader2 }> = {
  analyzing: { label: "分析中", icon: Loader2 },
  refactoring: { label: "重构中", icon: Hammer },
  validating: { label: "验证中", icon: Shield },
  complete: { label: "完成", icon: CheckCircle },
}

const phaseOrder: RefactorPhase[] = ["analyzing", "refactoring", "validating", "complete"]

const severityColors = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-400 border-slate-200 dark:border-slate-800",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  high: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800",
}

const riskColors = {
  low: "bg-slate-50 border-slate-200 dark:bg-slate-950/20 dark:border-slate-800",
  medium: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
  high: "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
}

const deliverableIcons = {
  code: FileCode,
  spec: FileCode,
  doc: FileCode,
  test_report: BarChart3,
}

// ─── Progress Bar ───────────────────────────────────────────

function PhaseProgress({ phase, progress }: { phase: RefactorPhase; progress: number }) {
  const currentIdx = phaseOrder.indexOf(phase)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold">重构进度</h3>
        <span className="text-xs text-muted-foreground tabular-nums">{progress}%</span>
      </div>
      {/* Phase steps */}
      <div className="flex items-center gap-0">
        {phaseOrder.map((p, i) => {
          const isDone = i < currentIdx
          const isCurrent = i === currentIdx
          const cfg = phaseConfig[p]
          const Icon = cfg.icon

          return (
            <div key={p} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={cn(
                    "relative flex items-center justify-center size-8 rounded-full border-2 transition-all",
                    isDone && "bg-emerald-500 border-emerald-500 text-white",
                    isCurrent && "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600",
                    !isDone && !isCurrent && "border-muted-foreground/20 text-muted-foreground/40"
                  )}
                >
                  {isDone ? (
                    <CheckCircle className="size-4" />
                  ) : isCurrent ? (
                    <Icon className={cn("size-4", p !== "complete" && "animate-spin")} />
                  ) : (
                    <span className="text-xs font-semibold">{i + 1}</span>
                  )}
                  {isCurrent && phase !== "complete" && (
                    <span className="absolute -inset-1 rounded-full border-2 border-blue-300 animate-ping opacity-30" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isDone && "text-emerald-600",
                    isCurrent && "text-blue-600",
                    !isDone && !isCurrent && "text-muted-foreground/50"
                  )}
                >
                  {cfg.label}
                </span>
              </div>
              {i < phaseOrder.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 -mt-4">
                  <div className="h-full rounded-full bg-muted-foreground/15 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        i < currentIdx ? "bg-emerald-400 w-full" : i === currentIdx ? "bg-blue-400" : "bg-transparent"
                      )}
                      style={i === currentIdx ? { width: `${Math.min(progress - i * 25, 25) * 4}%` } : undefined}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Changes List ───────────────────────────────────────────

function ChangesList({ changes }: { changes: RefactorChange[] }) {
  return (
    <div className="space-y-3">
      {changes.map((ch) => (
        <div key={ch.id} className="rounded-lg border bg-card/60 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <FileCode className="size-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-mono font-medium">{ch.file}</span>
            <span className="text-xs text-muted-foreground tabular-nums ml-auto">
              ±{ch.linesChanged} 行
            </span>
          </div>
          <p className="text-sm">{ch.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="rounded bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-2">
              <span className="font-medium text-red-600 dark:text-red-400">重构前</span>
              <p className="text-muted-foreground mt-0.5">{ch.before}</p>
            </div>
            <div className="rounded bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-2">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">重构后</span>
              <p className="text-muted-foreground mt-0.5">{ch.after}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Impact Analysis ────────────────────────────────────────

function ImpactAnalysis({ impacts }: { impacts: RefactorImpact[] }) {
  return (
    <div className="space-y-2">
      {impacts.map((imp) => (
        <div
          key={imp.id}
          className={cn("rounded-lg border p-3", severityColors[imp.severity])}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="size-4 shrink-0" />
            <span className="text-sm font-semibold">{imp.area}</span>
            <span className="text-[10px] uppercase font-bold ml-auto px-1.5 py-0.5 rounded bg-background/60">
              {imp.severity}
            </span>
          </div>
          <p className="text-sm opacity-80">{imp.description}</p>
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {imp.affectedFiles.map((f) => (
              <span
                key={f}
                className="inline-flex text-[10px] font-mono bg-background/60 rounded px-1.5 py-0.5"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Risk Assessment ────────────────────────────────────────

function RiskAssessment({ risks }: { risks: RefactorRisk[] }) {
  return (
    <div className="space-y-2">
      {risks.map((risk) => (
        <div key={risk.id} className={cn("rounded-lg border p-3", riskColors[risk.level])}>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="size-4 shrink-0" />
            <span className="text-sm font-semibold">{risk.title}</span>
            <span
              className={cn(
                "text-[10px] uppercase font-bold ml-auto px-1.5 py-0.5 rounded",
                risk.level === "high"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                  : risk.level === "medium"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-900/40 dark:text-slate-400"
              )}
            >
              {risk.level}
            </span>
          </div>
          <p className="text-sm opacity-80">{risk.description}</p>
          <div className="mt-2 flex items-start gap-1.5">
            <CheckCircle className="size-3 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-xs opacity-70">{risk.mitigation}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Coverage Gauge ─────────────────────────────────────────

function CoverageGauge({ coverage }: { coverage: NonNullable<RefactorStatusResponse["coverage"]> }) {
  const meetsTarget = coverage.overall >= coverage.target
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const dash = (coverage.overall / 100) * circumference

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">测试覆盖率</h3>
        <span className="text-xs text-muted-foreground">目标 ≥ {coverage.target}%</span>
      </div>
      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative shrink-0">
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle
              cx="65" cy="65" r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-muted/20"
            />
            <circle
              cx="65" cy="65" r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              className={meetsTarget ? "text-emerald-500" : "text-amber-500"}
              strokeDasharray={`${dash} ${circumference - dash}`}
              transform="rotate(-90 65 65)"
              style={{ transition: "stroke-dasharray 1s ease" }}
            />
            {/* Target line at 80% */}
            {coverage.target > 0 && (
              <circle
                cx="65" cy="65" r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                className="text-red-400/60"
                strokeDashoffset={circumference * (1 - coverage.target / 100)}
                transform="rotate(-90 65 65)"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-2xl font-bold tabular-nums", meetsTarget ? "text-emerald-600" : "text-amber-600")}>
              {coverage.overall}%
            </span>
            <span className="text-[10px] text-muted-foreground">{meetsTarget ? "已达标" : "未达标"}</span>
          </div>
        </div>
        {/* Per-file list */}
        <div className="flex-1 space-y-1.5 min-w-0">
          {coverage.byFile.map((f) => (
            <div key={f.file} className="flex items-center gap-2 text-xs">
              <span className="font-mono text-muted-foreground truncate flex-1">{f.file.split("/").pop()}</span>
              <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    f.coverage >= coverage.target ? "bg-emerald-500" : "bg-amber-500"
                  )}
                  style={{ width: `${f.coverage}%` }}
                />
              </div>
              <span className={cn("tabular-nums w-10 text-right shrink-0 font-medium", f.coverage >= coverage.target ? "text-emerald-600" : "text-amber-600")}>
                {f.coverage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Deliverables ───────────────────────────────────────────

function Deliverables({ items }: { items: RefactorStatusResponse["deliverables"] }) {
  if (items.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <PackageCheck className="size-4 text-emerald-500" />
        <h3 className="text-sm font-semibold">最终交付物</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => {
          const Icon = deliverableIcons[item.type]
          return (
            <div
              key={item.type}
              className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-emerald-600" />
                <span className="text-sm font-semibold">{item.label}</span>
                <span className="ml-auto inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                  {item.status === "ready" ? "就绪" : "生成中"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
              <p className="text-xs text-muted-foreground/70">{item.detail}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Confirm Dialog ─────────────────────────────────────────

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card border rounded-xl shadow-lg p-6 w-full max-w-md mx-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/40 p-2">
            <Hammer className="size-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">确认并执行重构</h3>
            <p className="text-sm text-muted-foreground">确认后将开始安全重构流程，确保外部行为不变</p>
          </div>
        </div>
        <div className="bg-muted/40 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <GitCompare className="size-4 text-muted-foreground" />
            <span>变更范围: 4 个文件</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="size-4 text-muted-foreground" />
            <span>预估耗时: 6h</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="size-4 text-muted-foreground" />
            <span>安全保证: 覆盖率目标 ≥ 80%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          重构过程不会改变已有功能的外部行为。所有变更均经过影响分析和风险评估。
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium border hover:bg-muted transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            确认并执行重构
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section Card ───────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-card/50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
      {children}
    </div>
  )
}

// ─── Main Panel ─────────────────────────────────────────────

export function RefactorPanel({ brownfieldId = "ref-plan-001" }: { brownfieldId?: string }) {
  const { data, error, isLoading, mutate } = useSWR<RefactorStatusResponse>(
    `/api/v1/brownfield/${brownfieldId}/refactor-status`,
    fetcher,
    { refreshInterval: 10000 }
  )

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [executing, setExecuting] = useState(false)

  // ── Confirm and execute ──
  const handleConfirm = useCallback(async () => {
    setExecuting(true)
    try {
      // First confirm
      const confirmRes = await fetch(`/api/v1/brownfield/${brownfieldId}/refactor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm" }),
      })
      if (confirmRes.ok) {
        // Then execute
        await fetch(`/api/v1/brownfield/${brownfieldId}/refactor`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "execute" }),
        })
        setConfirmOpen(false)
        await mutate()
      }
    } finally {
      setExecuting(false)
    }
  }, [brownfieldId, mutate])

  // ── Execute only (plan already confirmed) ──
  const handleExecute = useCallback(async () => {
    setExecuting(true)
    try {
      await fetch(`/api/v1/brownfield/${brownfieldId}/refactor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "execute" }),
      })
      setConfirmOpen(false)
      await mutate()
    } finally {
      setExecuting(false)
    }
  }, [brownfieldId, mutate])

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    )
  }

  // ── Error ──
  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取重构数据，请稍后重试</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const isRunning = data.phase !== "complete"

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={cn("rounded-full p-2", isRunning ? "bg-blue-100 dark:bg-blue-900/40" : "bg-emerald-100 dark:bg-emerald-900/40")}>
            <Hammer className={cn("size-5", isRunning ? "text-blue-600" : "text-emerald-600")} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">安全重构面板</h2>
            <p className="text-xs text-muted-foreground">Brownfield 模式 · 确保外部行为不变</p>
          </div>
        </div>
        {data.startedAt && (
          <span className="text-xs text-muted-foreground tabular-nums">
            启动于 {new Date(data.startedAt).toLocaleTimeString("zh-CN")}
          </span>
        )}
      </div>

      {/* Progress */}
      <PhaseProgress phase={data.phase} progress={data.progress} />

      {/* Coverage (shown once analyzing is done) */}
      {data.coverage && (
        <SectionCard icon={BarChart3} title="测试覆盖率仪表盘" subtitle={`目标 ≥ ${data.coverage.target}%`}>
          <CoverageGauge coverage={data.coverage} />
        </SectionCard>
      )}

      {/* Plan sections - always visible */}
      <SectionCard icon={GitCompare} title="变更列表" subtitle={`${data.plan.changes.length} 个变更 · 预估 ${data.plan.estimatedHours}h`}>
        <ChangesList changes={data.plan.changes} />
      </SectionCard>

      <SectionCard icon={AlertTriangle} title="影响分析" subtitle={`${data.plan.impacts.length} 项影响`}>
        <ImpactAnalysis impacts={data.plan.impacts} />
      </SectionCard>

      <SectionCard icon={Shield} title="风险评估" subtitle={`${data.plan.risks.length} 个风险点`}>
        <RiskAssessment risks={data.plan.risks} />
      </SectionCard>

      {/* Deliverables (only on complete) */}
      <Deliverables items={data.deliverables} />

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {data.phase === "complete" ? (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle className="size-4" />
            重构已完成，所有交付物就绪
          </div>
        ) : (
          <button
            onClick={data.phase === "analyzing" ? () => setConfirmOpen(true) : () => handleExecute()}
            disabled={executing}
            className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {executing && <Loader2 className="size-4 animate-spin" />}
            {data.phase === "analyzing" ? (
              <>
                <Play className="size-4" />
                确认并执行重构
              </>
            ) : (
              <>
                <ArrowRight className="size-4" />
                继续执行
              </>
            )}
          </button>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        loading={executing}
      />
    </div>
  )
}
