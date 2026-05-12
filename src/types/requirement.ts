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

// Gap analysis types
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

// Queue types
export type QueueItemStatus = "queued" | "speccing" | "ready_for_review" | "dispatched"

export interface QueueItem {
  id: string
  intakeId: string
  title: string
  type: string
  priority: IntakePriority
  status: QueueItemStatus
  acceptedAt: string
  specId?: string
}

export interface QueueResponse {
  items: QueueItem[]
  total: number
}

// Maturity review types
export type MaturityDimensionKey = "completeness" | "testability" | "consistency" | "clarity"

export interface MaturityDimension {
  key: MaturityDimensionKey
  name: string
  score: number
  maxScore: number
  status: "pass" | "fail" | "warning"
  details: string[]
}

export interface MaturityReviewResponse {
  specId: string
  specTitle: string
  dimensions: MaturityDimension[]
  overallScore: number
  threshold: number
  passed: boolean
  reviewedAt: string
}
