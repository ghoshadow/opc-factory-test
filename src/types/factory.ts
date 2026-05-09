export type LineStatus = "NOMINAL" | "ATTENTION"

export type LineId = "requirements" | "coding" | "testing" | "sre"

export interface LineStatusData {
  id: LineId
  name: string
  opc: string
  function: string
  wip: number
  completed: number
  anomaly: string | null
  status: LineStatus
}

export type AlertLevel = "urgent" | "warning"

export type AlertRoute = "值班" | "OPC" | "自动处置"

export interface AlertData {
  id: string
  description: string
  level: AlertLevel
  route: AlertRoute
  target: string
  time: string
}
