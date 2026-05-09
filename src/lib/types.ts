export type LineStatus = "NOMINAL" | "ATTENTION";

export interface PipelineStep {
  label: string;
  name?: string;
  status?: string;
}

export interface Deliverable {
  label: string;
  id?: string;
  name?: string;
  type?: string;
  status?: string;
  updatedAt?: string;
}

export interface ProductionLine {
  id: "requirement" | "coding" | "testing" | "sre";
  name: string;
  opc: string;
  function: string;
  wip: number;
  completed: number;
  anomaly: string;
  status: LineStatus;
  pipelineSteps: PipelineStep[];
  deliverables: Deliverable[];
  pipeline?: PipelineStep[];
  throughput?: number;
  cycleTime?: string;
}

// Dashboard-level types (distinct from ProductionLine)
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

export interface LineWip {
  total: number
  byPhase: Record<string, number>
}

export interface DashboardWipStats {
  requirementLine: LineWip
  codingLine: LineWip
  testingLine: LineWip
  sreLine: LineWip
}

export interface DashboardData {
  kpi: KpiData
  lineStatus: DashboardLineStatusData[]
  wip: DashboardWipStats
  lastUpdated: string
}
