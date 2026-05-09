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

// Archaeology report types
export type DebtType = "code_quality" | "security" | "deprecated_api" | "architecture" | "performance"
export type DebtSeverity = "critical" | "high" | "medium" | "low"

export interface FileNode {
  name: string
  type: "file" | "directory"
  children?: FileNode[]
  size?: number
  language?: string
}

export interface DependencyNode {
  name: string
  type: "external" | "internal"
  version?: string
  usageCount: number
  dependentModules: string[]
}

export interface TechDebtItem {
  id: string
  type: DebtType
  severity: DebtSeverity
  location: string
  description: string
  suggestion: string
}

export interface SpecDataContract {
  inputs: { name: string; type: string; description: string }[]
  outputs: { name: string; type: string; description: string }[]
  sideEffects: string[]
}

export interface ReverseSpec {
  userStory: string
  acceptanceCriteria: string[]
  dataContract: SpecDataContract
  uxSketch: string
}

export interface ArchaeologyResponse {
  id: string
  repoName: string
  analyzedAt: string
  fileTree: FileNode
  dependencyGraph: DependencyNode[]
  techDebt: TechDebtItem[]
  reverseSpec: ReverseSpec
}
