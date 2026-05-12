import { NextResponse } from "next/server"
import { CODING_PIPELINE_NODES } from "@/lib/constants/pipeline-nodes"
import type { CodingPipelineNode } from "@/types/factory"

interface CodingPipelineResponse {
  nodes: CodingPipelineNode[]
  currentStep: number
  totalSteps: number
}

export async function GET() {
  const nodes = CODING_PIPELINE_NODES
  const doneCount = nodes.filter((n) => n.status === "done").length
  const runningCount = nodes.filter((n) => n.status === "running").length

  const response: CodingPipelineResponse = {
    nodes,
    currentStep: doneCount + runningCount,
    totalSteps: nodes.length,
  }

  return NextResponse.json(response)
}
