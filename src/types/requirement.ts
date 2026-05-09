export type GapSeverity = "critical" | "major" | "minor"

export interface GapQuestion {
  id: string
  number: number
  description: string
  severity: GapSeverity
  hint?: string
}

export interface GapAnswer {
  questionId: string
  answer: string
}

export interface GapAnswersRequest {
  answers: GapAnswer[]
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
