import {
  Search,
  FileText,
  Gavel,
  HelpCircle,
  Users,
  GitCompare,
  CheckCircle,
  UserCheck,
  type LucideIcon,
} from "lucide-react"

export type PipelineNodeStatus = "waiting" | "running" | "done" | "failed"

export interface PipelineNodeConfig {
  id: string
  label: string
  icon: LucideIcon
}

export const REQ_PIPELINE_NODES: PipelineNodeConfig[] = [
  { id: "discovery", label: "Discovery", icon: Search },
  { id: "spec-author", label: "Spec Author", icon: FileText },
  { id: "maturity", label: "Maturity Judge", icon: Gavel },
  { id: "gap", label: "Gap Agent", icon: HelpCircle },
  { id: "review-board", label: "Review Board", icon: Users },
  { id: "revision", label: "Revision+Diff", icon: GitCompare },
  { id: "checker", label: "内部 Checker", icon: CheckCircle },
  { id: "reviewer", label: "外部 Reviewer", icon: UserCheck },
]

export const REQ_STATUS_FLOW = ["Backlog", "Drafting", "Checking", "Shipped"] as const
export type ReqStatus = (typeof REQ_STATUS_FLOW)[number]

export interface ReqKanbanItem {
  id: string
  title: string
  status: ReqStatus
  nodeId: string
  priority: "high" | "medium" | "low"
}
