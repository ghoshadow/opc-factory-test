"use client"

import { useRef } from "react"
import { Anchor, GitBranch } from "lucide-react"
import { PipelineFlow } from "@/components/testing/PipelineFlow"
import { TestCaseList } from "@/components/testing/TestCaseList"
import { BugTriagePanel } from "@/components/testing/BugTriagePanel"
import { KanbanBoard } from "@/components/testing/KanbanBoard"

const sections = [
  { id: "pipeline", label: "流水线", icon: GitBranch },
  { id: "test-cases", label: "用例", icon: GitBranch },
  { id: "bugs", label: "Bug 分诊", icon: GitBranch },
  { id: "kanban", label: "看板", icon: GitBranch },
]

export default function TestingOpsPage() {
  const pipelineRef = useRef<HTMLDivElement>(null)
  const testCasesRef = useRef<HTMLDivElement>(null)
  const bugsRef = useRef<HTMLDivElement>(null)
  const kanbanRef = useRef<HTMLDivElement>(null)

  const scrollTo = (id: string) => {
    const refMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
      pipeline: pipelineRef,
      "test-cases": testCasesRef,
      bugs: bugsRef,
      kanban: kanbanRef,
    }
    refMap[id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">测试产线操作台</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          流水线 · 用例 · Bug 分诊 · 看板
        </p>
      </div>

      {/* Anchor navigation */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 w-fit">
        <Anchor className="size-3.5 text-muted-foreground ml-2 mr-1" />
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className="px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Section: Pipeline Flow */}
      <div ref={pipelineRef} id="pipeline" className="scroll-mt-20">
        <PipelineFlow />
      </div>

      {/* Section: Test Case List */}
      <div ref={testCasesRef} id="test-cases" className="scroll-mt-20">
        <TestCaseList />
      </div>

      {/* Section: Bug Triage Panel */}
      <div ref={bugsRef} id="bugs" className="scroll-mt-20">
        <BugTriagePanel />
      </div>

      {/* Section: Kanban Board */}
      <div ref={kanbanRef} id="kanban" className="scroll-mt-20">
        <KanbanBoard />
      </div>
    </div>
  )
}
