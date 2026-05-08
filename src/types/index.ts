// Factory-specific shared types
export interface WorkItem {
  id: string;
  title: string;
  status: string;
  line: string;
  phase: string;
  priority: string;
}

export interface ProductionLine {
  id: string;
  name: string;
  status: "active" | "idle" | "blocked";
  wipCount: number;
}
