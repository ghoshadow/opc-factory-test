import type { LineStatus } from "@/types/factory"

export type { LineStatus }

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
