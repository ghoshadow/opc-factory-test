export interface WorkItem {
  id: string;
  title: string;
  productionLine: string;
  phase: string;
  priority: "P0" | "P1" | "P2";
  status: string;
}
