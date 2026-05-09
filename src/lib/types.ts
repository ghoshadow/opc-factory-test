export type LineStatus = "NOMINAL" | "ATTENTION";

export interface PipelineStep {
  label: string;
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
  pipelineSteps: PipelineStep[];
  deliverables: Deliverable[];
}
