export type LineStatus = "NOMINAL" | "ATTENTION"

export interface PipelineStep {
  name: string
  status: "waiting" | "running" | "done" | "failed"
}

export interface Deliverable {
  id: string
  name: string
  type: string
  status: "done" | "in_progress" | "pending"
  updatedAt: string
}

export interface ProductionLine {
  id: string
  name: string
  opc: string
  function: string
  wip: number
  completed: number
  anomaly: string
  status: LineStatus
  throughput: number
  cycleTime: number
  pipeline: PipelineStep[]
  deliverables: Deliverable[]
}

// Dashboard types
export type DashboardLineStatus = "healthy" | "degraded" | "blocked" | "idle"

export interface DashboardLineStatusData {
  line: "requirement" | "coding" | "testing" | "sre"
  name: string
  status: DashboardLineStatus
  activeItems: number
  completedToday: number
  currentPhase: string
  nextMilestone: string
}

export interface KpiData {
  totalItems: number
  inProgress: number
  completed: number
  blocked: number
  passRate: number
  avgCycleTime: string
  activeAgents: number
}

export interface WipStats {
  requirementLine: { total: number; byPhase: Record<string, number> }
  codingLine: { total: number; byPhase: Record<string, number> }
  testingLine: { total: number; byPhase: Record<string, number> }
  sreLine: { total: number; byPhase: Record<string, number> }
}

export interface DashboardData {
  kpi: KpiData
  lineStatus: DashboardLineStatusData[]
  wip: WipStats
  lastUpdated: string | null
}
