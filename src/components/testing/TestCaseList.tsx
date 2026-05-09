"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import {
  FlaskConical,
  ChevronRight,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Play,
  PlayCircle,
  Image,
  FileText,
} from "lucide-react"
import type {
  TestCasesResponse,
  TestScenario,
  AcceptanceCriterion,
  TestStepInput,
  TestCaseStatus,
  TestStepStatus,
  ExecuteResponse,
} from "@/types/factory"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string): Promise<TestCasesResponse> =>
  fetch(url).then((res) => res.json())

const statusConfig: Record<TestStepStatus, { icon: typeof Clock; label: string; color: string }> = {
  pending: { icon: Clock, label: "待执行", color: "text-muted-foreground" },
  running: { icon: Loader2, label: "执行中", color: "text-blue-500 animate-spin" },
  passed: { icon: CheckCircle2, label: "通过", color: "text-emerald-500" },
  failed: { icon: XCircle, label: "失败", color: "text-red-500" },
  skipped: { icon: Clock, label: "跳过", color: "text-amber-500" },
}

function scenarioStatus(scenario: TestScenario): TestCaseStatus {
  const allSteps = scenario.acceptanceCriteria.flatMap((ac) => ac.steps)
  if (allSteps.some((s) => s.status === "running")) return "running"
  const nonPending = allSteps.filter((s) => s.status !== "pending")
  if (nonPending.length === 0) return "pending"
  if (nonPending.every((s) => s.status === "passed")) return "pass"
  if (nonPending.some((s) => s.status === "failed")) return "fail"
  return "pending"
}

function acStatus(ac: AcceptanceCriterion): TestCaseStatus {
  if (ac.steps.some((s) => s.status === "running")) return "running"
  const nonPending = ac.steps.filter((s) => s.status !== "pending")
  if (nonPending.length === 0) return "pending"
  if (nonPending.every((s) => s.status === "passed")) return "pass"
  if (nonPending.some((s) => s.status === "failed")) return "fail"
  return "pending"
}

const caseStatusBadge: Record<TestCaseStatus, { icon: typeof Clock; label: string; className: string }> = {
  pending: { icon: Clock, label: "待执行", className: "bg-gray-100 text-gray-600 dark:bg-gray-900/40 dark:text-gray-400" },
  running: { icon: Loader2, label: "执行中", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
  pass: { icon: CheckCircle2, label: "通过", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  fail: { icon: XCircle, label: "失败", className: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" },
}

function StepIcon({ status }: { status: TestStepStatus }) {
  const cfg = statusConfig[status]
  const Icon = cfg.icon
  return <Icon className={`size-4 shrink-0 ${cfg.color}`} />
}

function CaseStatusBadge({ status }: { status: TestCaseStatus }) {
  const cfg = caseStatusBadge[status]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
      <Icon className={`size-3 ${status === "running" ? "animate-spin" : ""}`} />
      {cfg.label}
    </span>
  )
}

interface StepDetailProps {
  step: TestStepInput
}

function StepDetail({ step }: StepDetailProps) {
  if (step.status !== "failed") return null

  return (
    <div className="ml-8 mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 space-y-2">
      {step.errorDetail && (
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <FileText className="size-3 text-red-500" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">错误详情</span>
          </div>
          <pre className="text-xs text-red-600/80 dark:text-red-400/80 whitespace-pre-wrap font-mono bg-red-100/50 dark:bg-red-950/30 rounded p-2">
            {step.errorDetail}
          </pre>
        </div>
      )}
      {step.log && (
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <FileText className="size-3 text-red-500" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">执行日志</span>
          </div>
          <pre className="text-xs text-red-600/80 dark:text-red-400/80 whitespace-pre-wrap font-mono bg-red-100/50 dark:bg-red-950/30 rounded p-2 max-h-32 overflow-y-auto">
            {step.log}
          </pre>
        </div>
      )}
      {step.screenshot && (
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            {/* eslint-disable-next-line jsx-a11y/alt-text -- lucide-react Image icon renders SVG, not <img> */}
            <Image className="size-3 text-red-500" aria-hidden="true" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">截图</span>
          </div>
          <p className="text-xs text-red-500 font-mono">{step.screenshot}</p>
        </div>
      )}
    </div>
  )
}

export function TestCaseList() {
  const { data, error, isLoading, mutate } = useSWR<TestCasesResponse>(
    "/api/v1/testing/cases",
    fetcher,
    { refreshInterval: 15000 }
  )

  const [expandedScenarios, setExpandedScenarios] = useState<Set<string>>(new Set())
  const [expandedACs, setExpandedACs] = useState<Set<string>>(new Set())
  const [executing, setExecuting] = useState<Set<string>>(new Set())
  const [batchRunning, setBatchRunning] = useState(false)
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 })

  const toggleScenario = useCallback((id: string) => {
    setExpandedScenarios((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAC = useCallback((id: string) => {
    setExpandedACs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const executeSingle = useCallback(async (scenarioId: string, acId: string) => {
    const key = `${scenarioId}/${acId}`
    setExecuting((prev) => new Set(prev).add(key))
    try {
      const res = await fetch("/api/v1/testing/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, acId }),
      })
      if (!res.ok) return
      const result: ExecuteResponse = await res.json()

      // Update local data optimistically
      mutate((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          scenarios: prev.scenarios.map((s) => {
            if (s.id !== scenarioId) return s
            return {
              ...s,
              acceptanceCriteria: s.acceptanceCriteria.map((ac) => {
                if (ac.id !== acId) return ac
                return { ...ac, steps: result.results }
              }),
            }
          }),
        }
      }, false)
    } finally {
      setExecuting((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }, [mutate])

  const executeScenario = useCallback(async (scenario: TestScenario) => {
    setExpandedScenarios((prev) => new Set(prev).add(scenario.id))
    for (const ac of scenario.acceptanceCriteria) {
      setExpandedACs((prev) => new Set(prev).add(ac.id))
      await executeSingle(scenario.id, ac.id)
    }
  }, [executeSingle])

  const executeAll = useCallback(async () => {
    if (!data) return
    setBatchRunning(true)
    const allACs = data.scenarios.flatMap((s) =>
      s.acceptanceCriteria.map((ac) => ({ scenarioId: s.id, acId: ac.id }))
    )
    setBatchProgress({ done: 0, total: allACs.length })

    for (const { scenarioId, acId } of allACs) {
      setExpandedScenarios((prev) => new Set(prev).add(scenarioId))
      setExpandedACs((prev) => new Set(prev).add(acId))
      await executeSingle(scenarioId, acId)
      setBatchProgress((prev) => ({ done: prev.done + 1, total: prev.total }))
    }

    setBatchRunning(false)
  }, [data, executeSingle])

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-28" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 py-3">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96 ml-6" />
            <Skeleton className="h-4 w-80 ml-6" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <FlaskConical className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取测试用例数据，请稍后重试</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.scenarios.length === 0) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <FlaskConical className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">暂无测试用例</p>
            <p className="text-xs text-muted-foreground">当前没有可执行的测试场景</p>
          </div>
        </div>
      </div>
    )
  }

  const totalSteps = data.scenarios.reduce(
    (sum, s) => sum + s.acceptanceCriteria.reduce((a, ac) => a + ac.steps.length, 0),
    0
  )
  const executedSteps = data.scenarios.reduce(
    (sum, s) =>
      sum +
      s.acceptanceCriteria.reduce(
        (a, ac) => a + ac.steps.filter((st) => st.status !== "pending").length,
        0
      ),
    0
  )
  const passedSteps = data.scenarios.reduce(
    (sum, s) =>
      sum +
      s.acceptanceCriteria.reduce(
        (a, ac) => a + ac.steps.filter((st) => st.status === "passed").length,
        0
      ),
    0
  )
  const failedSteps = data.scenarios.reduce(
    (sum, s) =>
      sum +
      s.acceptanceCriteria.reduce(
        (a, ac) => a + ac.steps.filter((st) => st.status === "failed").length,
        0
      ),
    0
  )

  const anyRunning = data.scenarios.some((s) =>
    s.acceptanceCriteria.some((ac) => ac.steps.some((st) => st.status === "running"))
  )

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlaskConical className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">测试用例列表</h2>
            <p className="text-xs text-muted-foreground">
              {data.scenarios.length} 场景 · {totalSteps} 步骤
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={batchRunning || anyRunning}
          onClick={executeAll}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {batchRunning ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <PlayCircle className="size-4" />
          )}
          {batchRunning ? "批量执行中..." : "批量执行全部"}
        </button>
      </div>

      {/* Progress bar */}
      {(batchRunning || executedSteps > 0) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {batchRunning
                ? `批量执行: ${batchProgress.done}/${batchProgress.total} AC`
                : `执行进度: ${executedSteps}/${totalSteps} 步骤`}
            </span>
            <span className="tabular-nums">
              <span className="text-emerald-500 font-medium">{passedSteps} 通过</span>
              {failedSteps > 0 && (
                <>
                  {" · "}
                  <span className="text-red-500 font-medium">{failedSteps} 失败</span>
                </>
              )}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{
                width: `${totalSteps > 0 ? Math.round((executedSteps / totalSteps) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Scenario tree */}
      <div className="space-y-2">
        {data.scenarios.map((scenario) => {
          const sStatus = scenarioStatus(scenario)
          const isExpanded = expandedScenarios.has(scenario.id)

          return (
            <div
              key={scenario.id}
              className="rounded-lg border bg-muted/20 overflow-hidden"
            >
              {/* Scenario header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleScenario(scenario.id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronRight
                    className={`size-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">
                      {scenario.id}
                    </span>
                    <span className="text-sm font-semibold truncate">
                      {scenario.name}
                    </span>
                    <CaseStatusBadge status={sStatus} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {scenario.feature} · {scenario.acceptanceCriteria.length} AC ·{" "}
                    {scenario.acceptanceCriteria.reduce((s, ac) => s + ac.steps.length, 0)} 步骤
                  </p>
                </div>
                <button
                  type="button"
                  disabled={executing.has(`${scenario.id}/__all__`) || sStatus === "running"}
                  onClick={() => executeScenario(scenario)}
                  className="inline-flex items-center gap-1 shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {executing.has(`${scenario.id}/__all__`) || sStatus === "running" ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Play className="size-3" />
                  )}
                  执行场景
                </button>
              </div>

              {/* AC list */}
              {isExpanded && (
                <div className="border-t divide-y">
                  {scenario.acceptanceCriteria.map((ac) => {
                    const aStatus = acStatus(ac)
                    const isACExpanded = expandedACs.has(ac.id)
                    const isACExecuting = executing.has(`${scenario.id}/${ac.id}`)

                    return (
                      <div key={ac.id} className="bg-background">
                        {/* AC header */}
                        <div className="flex items-center gap-3 px-6 py-2.5">
                          <button
                            type="button"
                            onClick={() => toggleAC(ac.id)}
                            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ChevronRight
                              className={`size-3.5 transition-transform ${isACExpanded ? "rotate-90" : ""}`}
                            />
                          </button>
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              {ac.id}
                            </span>
                            <span className="text-sm font-medium truncate">
                              {ac.title}
                            </span>
                            <CaseStatusBadge status={aStatus} />
                          </div>
                          <button
                            type="button"
                            disabled={isACExecuting || aStatus === "running"}
                            onClick={() => executeSingle(scenario.id, ac.id)}
                            className="inline-flex items-center gap-1 shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isACExecuting ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <Play className="size-3" />
                            )}
                            执行
                          </button>
                        </div>

                        {/* Steps list */}
                        {isACExpanded && (
                          <div className="border-t">
                            {ac.steps.map((step) => (
                              <div key={step.id}>
                                <div className="flex items-start gap-3 px-10 py-2.5 hover:bg-muted/30 transition-colors">
                                  <StepIcon status={step.status} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-mono text-muted-foreground">
                                        {step.id}
                                      </span>
                                      <span className="text-sm">{step.description}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      预期: {step.expectedResult}
                                    </p>
                                    {step.status !== "pending" && (
                                      <p
                                        className={`text-xs mt-0.5 ${
                                          step.status === "passed"
                                            ? "text-emerald-600 dark:text-emerald-400"
                                            : "text-red-600 dark:text-red-400"
                                        }`}
                                      >
                                        {step.status === "passed" ? "实际: " : "实际: "}
                                        {step.actualResult || step.expectedResult}
                                      </p>
                                    )}
                                    {step.duration && (
                                      <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                                        {step.duration}ms
                                      </span>
                                    )}
                                  </div>
                                  <span
                                    className={`text-xs shrink-0 mt-0.5 ${
                                      statusConfig[step.status].color
                                    }`}
                                  >
                                    {statusConfig[step.status].label}
                                  </span>
                                </div>
                                <StepDetail step={step} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
