export type IntakeType = "初步需求" | "功能需求" | "技术需求" | "Bug 报告"

export type IntakePriority = "P0" | "P1" | "P2" | "P3"

export type IntakeStatus = "queued" | "triaging" | "accepted" | "rejected"

export interface IntakeItem {
  id: string
  type: IntakeType
  title: string
  priority: IntakePriority
  status: IntakeStatus
  submittedAt: string
  description?: string
}

export interface IntakeResponse {
  items: IntakeItem[]
  total: number
}

// Gap questions types
export type GapSeverity = "critical" | "major" | "minor"

export interface GapQuestion {
  id: string
  number: number
  description: string
  severity: GapSeverity
  hint: string
}

export interface GapAnswer {
  questionId: string
  answer: string
}

export interface GapAnswersResponse {
  questions: GapQuestion[]
}

export interface GapSubmitResponse {
  newScore: number
  threshold: number
  passed: boolean
  message: string
}
