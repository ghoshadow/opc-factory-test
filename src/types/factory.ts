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

// Bug triage types
export type BugPriority = "P0" | "P1" | "P2" | "P3"

export type BugStatus = "open" | "in_progress" | "resolved" | "closed"

export interface TraceChainNode {
  id: string
  type: "bug" | "test_case" | "ac" | "spec"
  label: string
  title: string
}

export interface SimilarBug {
  id: string
  title: string
  similarity: number
}

export interface Bug {
  id: string
  title: string
  priority: BugPriority
  module: string
  status: BugStatus
  owner: string
  traceChain: TraceChainNode[]
  similarBugs: SimilarBug[]
}

export interface BugTriageResponse {
  bugs: Bug[]
  total: number
}

// SRE Checker types
export type CheckerItemStatus = "pass" | "fail" | "warning"

export interface SreCheckerItem {
  id: string
  name: string
  description: string
  status: CheckerItemStatus
  detail: string
  supplementLabel?: string
}

export interface SreCheckerResponse {
  items: SreCheckerItem[]
  allPass: boolean
  canRelease: boolean
}

// Runbook types
export interface TroubleshootNode {
  id: string
  question: string
  steps: string[]
  solution: string
  children?: TroubleshootNode[]
}

export interface Runbook {
  id: string
  name: string
  description: string
  service: string
  version: number
  startStopSteps: string[]
  scaleSteps: string[]
  troubleshootTree: TroubleshootNode[]
  emergencyPlan: string
  topologyExport: string
  createdAt: string
  updatedAt: string
}

export interface RunbookListResponse {
  runbooks: Runbook[]
  total: number
}

// Pipeline flow types
export type PipelineStageStatus = "waiting" | "running" | "done" | "failed"

export interface PipelineStage {
  id: string
  label: string
  status: PipelineStageStatus
  subtext: string
}

export interface PipelineRun {
  stages: PipelineStage[]
  currentStageId: string | null
  startedAt: string | null
}

// Test case types
export type TestCaseStatus = "pass" | "fail" | "running" | "pending"
export type TestCasePriority = "high" | "medium" | "low"

export interface TestCase {
  id: string
  title: string
  status: TestCaseStatus
  priority: TestCasePriority
  stage: string
  owner: string
  duration: string
  bugRef: string | null
}

export interface TestCaseListResponse {
  cases: TestCase[]
  passRate: number
  total: number
}

// Kanban types
export interface KanbanItem {
  id: string
  title: string
  tags: string[]
  owner: string
}

export interface KanbanColumn {
  id: string
  label: string
  items: KanbanItem[]
}

export interface KanbanBoardData {
  columns: KanbanColumn[]
}

// Aggregated testing pipeline response
export interface TestingOpsResponse {
  pipeline: PipelineRun
  testCases: TestCaseListResponse
  kanban: KanbanBoardData
}
