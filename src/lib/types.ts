export interface Alert {
  id: string;
  description: string;
  severity: "urgent" | "warning";
  route: "值班" | "OPC" | "自动处置";
  productionLine?: string;
  timestamp: string;
}
