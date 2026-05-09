// Plan review status
export type PlanStatus = "pending" | "approved" | "rejected"

// Hierarchical task breakdown (from PlannerAgent output)
export interface PlanTask {
  id: string
  title: string
  description: string
  estimatedHours: number
  children?: PlanTask[]
}

// API design summary
export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  description: string
  request: string
  response: string
}

// Dependency edge in relationship graph
export interface DependencyEdge {
  from: string
  to: string
  label: string
}

// Workload estimation
export interface WorkloadEstimate {
  totalPersonHours: number
  storyPoints: number
  breakdown: { task: string; hours: number }[]
}

// Full plan data from PlannerAgent
export interface PlanData {
  id: string
  title: string
  status: PlanStatus
  tasks: PlanTask[]
  apis: ApiEndpoint[]
  dependencies: DependencyEdge[]
  workload: WorkloadEstimate
  createdAt: string
  rejectionReason?: string
}

// API response for plan listing
export interface PlanReviewResponse {
  plans: PlanData[]
  total: number
}
