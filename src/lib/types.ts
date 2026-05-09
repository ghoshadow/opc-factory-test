export interface KpiData {
  totalItems: number;
  inProgress: number;
  completed: number;
  blocked: number;
  passRate: number;
  avgCycleTime: string;
  activeAgents: number;
}

export interface LineWipStats {
  total: number;
  byPhase: Record<string, number>;
}

export interface WipStats {
  requirementLine: LineWipStats;
  codingLine: LineWipStats;
  testingLine: LineWipStats;
  sreLine: LineWipStats;
}

export type AlertType = "warning" | "error" | "info";

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  source: string;
  timestamp: string;
}

export type LineStatus = "healthy" | "degraded" | "blocked" | "idle";

export interface LineStatusData {
  line: "requirement" | "coding" | "testing" | "sre";
  name: string;
  status: LineStatus;
  activeItems: number;
  completedToday: number;
  currentPhase: string;
  nextMilestone: string;
}

export interface DashboardData {
  kpis: KpiData;
  wipStats: WipStats;
  alerts: Alert[];
  lineStatuses: LineStatusData[];
  lastUpdated: string;
}
