export type LineStatus = "NOMINAL" | "ATTENTION";

export type LineId = "requirements" | "coding" | "testing" | "sre";

export interface PipelineStep {
  label: string;
}

export interface Deliverable {
  id: string;
  name: string;
  type: string;
  status: "done" | "in_progress" | "pending";
  updatedAt: string;
}

export interface PipelineStage {
  name: string;
  status: "waiting" | "running" | "done" | "failed";
}

export interface ProductionLine {
  id: LineId;
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

export interface WipStats {
  requirementLine: { total: number; byPhase: Record<string, number> };
  codingLine: { total: number; byPhase: Record<string, number> };
  testingLine: { total: number; byPhase: Record<string, number> };
  sreLine: { total: number; byPhase: Record<string, number> };
}

// Dashboard types
export type DashboardLineStatus = "healthy" | "degraded" | "blocked" | "idle";

export interface DashboardLineData {
  line: LineId;
  name: string;
  status: DashboardLineStatus;
  activeItems: number;
  completedToday: number;
  currentPhase: string;
  nextMilestone: string;
}

export interface KpiData {
  totalItems: number;
  inProgress: number;
  completed: number;
  blocked: number;
  passRate: number;
  avgCycleTime: string;
  activeAgents: number;
  [key: string]: number | string;
}

export interface DashboardData {
  lastUpdated: string;
  [key: string]: unknown;
}
