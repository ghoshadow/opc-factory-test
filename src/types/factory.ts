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

// Test case types
export type TestCaseStatus = "pending" | "running" | "passed" | "failed"
export type TestStepStatus = "pending" | "running" | "passed" | "failed"

export interface TestStep {
  id: string
  description: string
  expectedResult: string
  status: TestStepStatus
  actualResult?: string
  errorDetail?: string
  screenshot?: string
  log?: string
  duration?: number
}

export interface AcceptanceCriterion {
  id: string
  title: string
  steps: TestStep[]
}

export interface TestScenario {
  id: string
  name: string
  feature: string
  acceptanceCriteria: AcceptanceCriterion[]
}

export interface TestCasesResponse {
  scenarios: TestScenario[]
  total: number
}

export interface ExecuteRequest {
  scenarioId?: string
  acId?: string
}

export interface ExecuteResponse {
  scenarioId: string
  acId: string
  results: TestStep[]
  passed: number
  failed: number
  total: number
}
