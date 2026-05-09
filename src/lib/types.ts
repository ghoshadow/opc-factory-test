export type LineStatus = "NOMINAL" | "ATTENTION";

export interface PipelineStep {
  label: string;
  status?: string;
}

export interface PipelineStage {
  name: string;
  status: string;
}

export interface Deliverable {
  label: string;
  status: string;
  updatedAt?: string;
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
  throughput: number;
  cycleTime: number;
  pipeline: PipelineStage[];
  pipelineSteps: PipelineStep[];
  deliverables: Deliverable[];
}
