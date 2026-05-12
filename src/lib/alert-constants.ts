import type { AlertRoutingConfig } from "@/types/factory"

export const conditionLabels: Record<string, string> = {
  gt: ">",
  lt: "<",
  gte: "≥",
  lte: "≤",
  eq: "=",
  neq: "≠",
}

export const severityLabels: Record<string, string> = {
  critical: "严重",
  warning: "警告",
  info: "通知",
}

export const targetLabels: Record<string, string> = {
  oncall: "SRE 值班",
  opc: "产线 OPC",
  auto_remediation: "自愈处置",
}

export const defaultRouting: AlertRoutingConfig[] = [
  { target: "oncall", label: "SRE 值班人员", enabled: true },
  { target: "opc", label: "对应产线 OPC", enabled: false },
  { target: "auto_remediation", label: "自愈触发", enabled: false },
]
