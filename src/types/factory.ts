import type { ACItem, DataContract } from "./spec"

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

// Requirement Checker types
export interface TerminologyConflict {
  term: string
  specA: string
  specB: string
}

export interface ReqCheckerItem {
  id: string
  name: string
  description: string
  status: CheckerItemStatus
  detail: string
  supplementLabel?: string
  conflicts?: TerminologyConflict[]
}

export interface ReqCheckerResponse {
  items: ReqCheckerItem[]
  specId: string
  allPass: boolean
  canRelease: boolean
}

// Coding Checker types
export interface CodingCheckerItem {
  id: string
  name: string
  description: string
  status: CheckerItemStatus
  detail: string
  supplementLabel?: string
}

export interface CodingCheckerResponse {
  items: CodingCheckerItem[]
  prId: string
  allPass: boolean
  canMerge: boolean
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
export type TestCaseStatus = "pending" | "running" | "passed" | "failed"
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

// Test scenario & execution types
export type TestStepStatus = "pending" | "running" | "passed" | "failed"

export interface BaseTestStep {
  id: string
  description: string
  expectedResult: string
  status: TestStepStatus
}

export interface TestStep extends BaseTestStep {
  status: TestStepStatus
  duration?: number
  actualResult?: string
  errorDetail?: string
  screenshot?: string
  log?: string
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

// Coding pipeline types
export type ReviewItemStatus = "pass" | "fail" | "warning" | "pending"

export interface PlanReviewItem {
  id: string
  name: string
  description: string
  status: ReviewItemStatus
  detail: string
}

export interface DesignReviewItem {
  id: string
  name: string
  description: string
  status: ReviewItemStatus
  detail: string
}

export type TocoSeverity = "critical" | "major" | "minor" | "info"

export interface TocoFinding {
  id: string
  severity: TocoSeverity
  category: string
  title: string
  description: string
  lineRef: string
}

export interface TocoMetrics {
  totalLines: number
  changedLines: number
  filesChanged: number
  complexityDelta: number
}

export interface TocoReportData {
  metrics: TocoMetrics
  findings: TocoFinding[]
}

export interface CodingOpsResponse {
  pipeline: PipelineRun
  planReview: PlanReviewItem[]
  designReview: DesignReviewItem[]
  tocoReport: TocoReportData
  kanban: KanbanBoardData
}

// Coding pipeline node types
export interface CodingPipelineNode {
  id: string
  label: string
  description: string
  status: PipelineNodeStatus
  details: {
    plan: string
    code: string
    report: string
    design?: string
  }
}

export interface CodingPipelineResponse {
  nodes: CodingPipelineNode[]
  currentStep: number
  totalSteps: number
}

// Delivery gate types
export type GateItemStatus = "pass" | "fail" | "waiting" | "running" | "warning"

export interface DeliveryGateItem {
  id: string
  line: string
  lineLabel: string
  name: string
  description: string
  status: GateItemStatus
  detail: string
}

export interface DeliveryGateResponse {
  items: DeliveryGateItem[]
  allPass: boolean
  canDeliver: boolean
  passRate: number
}

// Ontology types
export type OntologyType = "factory" | "business"

export type TermKind = "entity" | "value_object" | "aggregate" | "domain_event" | "business_rule"

export interface OntologyDomain {
  id: string
  name: string
  description: string
  type: OntologyType
  termCount: number
}

export interface OntologyTerm {
  id: string
  domainId: string
  name: string
  kind: TermKind
  definition: string
  attributes: string[]
  updatedAt: string
}

export interface OntologyResponse {
  domains: OntologyDomain[]
  terms: OntologyTerm[]
}

// Decompose pipeline types
export interface DecomposeNode {
  id: string
  label: string
  type: "spec" | "task" | "pr" | "test" | "check" | "artifact"
  status: PipelineStageStatus
  detail: string
  children: string[]
}

export interface DecomposeEdge {
  source: string
  target: string
  label: string
}

export interface DecomposePipelineResponse {
  nodes: DecomposeNode[]
  edges: DecomposeEdge[]
  rootId: string
}

// Spec types (L2 需求管理)
export type SpecStatus = "draft" | "review" | "approved"

export interface SpecVersion {
  versionNumber: number
  content: string
  timestamp: string
}

export interface Spec {
  id: string
  title: string
  content: string
  status: SpecStatus
  version: number
  versions: SpecVersion[]
  createdAt: string
  updatedAt: string
}

export interface SpecListResponse {
  specs: Spec[]
  total: number
}

// Spec version list types (for diff view)
export interface SpecVersionSummary {
  id: string
  version: number
  timestamp: string
  summary: string
  isCurrent: boolean
  content?: string
}

export interface SpecVersionsResponse {
  versions: SpecVersionSummary[]
}

// Skills types
export type ProductionLine = "requirements" | "coding" | "testing" | "sre"

export type SkillStatus = "installed" | "available"

export interface Skill {
  id: string
  name: string
  description: string
  line: ProductionLine
  status: SkillStatus
}

export interface SkillsResponse {
  skills: Skill[]
}

export interface InstallSkillRequest {
  skillId: string
  action: "install" | "uninstall"
}

export interface InstallSkillResponse {
  skillId: string
  status: SkillStatus
}

// Pipeline types (testing production line)
export type PipelineNodeStatus = "waiting" | "running" | "done" | "failed"

export interface PipelineStageNode {
  id: string
  label: string
  status: PipelineNodeStatus
  description: string
  details: string[]
}

export interface PipelineResponse {
  nodes: PipelineStageNode[]
  totalNodes: number
}

// Bug Reflow types (SRE → Intake)
export type ReflowStatus = "open" | "reflowed_to_intake" | "coding_in_progress" | "fixed"

export interface ReflowTimelineEntry {
  id: string
  status: ReflowStatus
  label: string
  description: string
  timestamp: string
}

export interface ReflowBug {
  id: string
  title: string
  description: string
  priority: BugPriority
  module: string
  status: ReflowStatus
  source: string
  createdAt: string
  timeline: ReflowTimelineEntry[]
}

export interface ReflowBugListResponse {
  bugs: ReflowBug[]
  total: number
}

export interface ReflowRequest {
  title: string
  description: string
}

export interface ReflowStatusResponse {
  bugId: string
  status: ReflowStatus
  timeline: ReflowTimelineEntry[]
}

// Archaeology report types (Brownfield code archaeology)
export interface CodeTreeNode {
  name: string
  type: "directory" | "file"
  children?: CodeTreeNode[]
  size?: number
  lines?: number
  language?: string
}

export interface DependencyNode {
  name: string
  version: string
  type: "production" | "dev" | "internal"
  usedBy: string[]
}

export interface DependencyEdge {
  source: string
  target: string
  label?: string
  weight: number
}

export type TechDebtType = "security" | "deprecated_api" | "code_quality" | "performance" | "architecture"

export type TechDebtSeverity = "critical" | "major" | "minor"

export interface TechDebtItem {
  id: string
  type: TechDebtType
  severity: TechDebtSeverity
  location: string
  description: string
  suggestion: string
}

export interface ChangePattern {
  period: string
  commits: number
  filesChanged: number
  insertions: number
  deletions: number
  topAuthors: string[]
  description: string
}

export interface ReverseSpecData {
  id: string
  sourceRepo: string
  minedAt: string
  userStory: string
  acceptanceCriteria: ACItem[]
  dataContract: DataContract
  uxDraft: string
  qualityScore: number
}

export interface ArchaeologyReportData {
  id: string
  projectId: string
  createdAt: string
  codeTree: CodeTreeNode
  dependencies: {
    production: DependencyNode[]
    dev: DependencyNode[]
    internal: { name: string; coupling: number }[]
    graph: DependencyEdge[]
  }
  techDebt: TechDebtItem[]
  changeHistory: ChangePattern[]
  reverseSpec: ReverseSpecData
}

export interface ArchaeologyResponse {
  report: ArchaeologyReportData
}
