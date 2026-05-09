export type LineStatus = "NOMINAL" | "ATTENTION" | "healthy" | "degraded" | "blocked" | "idle"

export interface LineStatusData {
  line: "requirement" | "coding" | "testing" | "sre"
  name: string
  status: LineStatus
  activeItems: number
  completedToday: number
  currentPhase: string
  nextMilestone: string
}

export interface PipelineStep {
  label: string;
}

export interface PipelineStage {
  name: string
  status: "waiting" | "running" | "done" | "failed"
}

export interface Deliverable {
  label: string;
}

export interface DeliverableDetail {
  id: string
  name: string
  type: string
  status: "done" | "in_progress" | "pending"
  updatedAt: string
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
  lastUpdated: string | null
}

export interface ProductionLine {
  id: string;
  name: string;
  opc: string;
  function: string;
  wip: number;
  completed: number;
  anomaly: string;
  status: LineStatus;
  throughput?: number;
  cycleTime?: number;
  pipelineSteps: PipelineStep[];
  pipeline?: PipelineStage[];
  deliverables: Deliverable[];
}
