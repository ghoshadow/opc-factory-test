"use client"

import { useState, useCallback } from "react"
import {
  Rocket,
  Shield,
  BarChart3,
  Bell,
  Siren,
  RotateCcw,
  BookOpen,
} from "lucide-react"
import { DeployPanel } from "@/components/sre/DeployPanel"
import { SreCheckerPanel } from "@/components/sre/SreCheckerPanel"
import { ObservabilityPanel } from "@/components/sre/ObservabilityPanel"
import { AlertRulesPanel } from "@/components/sre/AlertRulesPanel"
import { IncidentList } from "@/components/sre/IncidentList"
import { RollbackPanel } from "@/components/sre/RollbackPanel"
import { RunbookList } from "@/components/sre/RunbookList"
import { RunbookEditor } from "@/components/sre/RunbookEditor"
import { TroubleshootTree } from "@/components/sre/TroubleshootTree"
import type { Runbook } from "@/types/factory"

const anchorSections = [
  { id: "deploy", label: "部署", icon: Rocket },
  { id: "checker", label: "门禁", icon: Shield },
  { id: "observability", label: "观测", icon: BarChart3 },
  { id: "alerts", label: "告警", icon: Bell },
  { id: "incidents", label: "事件", icon: Siren },
  { id: "rollback", label: "回滚", icon: RotateCcw },
  { id: "runbooks", label: "手册", icon: BookOpen },
]

export default function SreOpsPage() {
  const [selectedRunbook, setSelectedRunbook] = useState<Runbook | null>(null)
  const [showNewRunbook, setShowNewRunbook] = useState(false)

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  const handleSelectRunbook = useCallback((rb: Runbook) => {
    setSelectedRunbook(rb)
    setShowNewRunbook(false)
  }, [])

  const handleCreateNew = useCallback(() => {
    setSelectedRunbook(null)
    setShowNewRunbook(true)
  }, [])

  const handleBack = useCallback(() => {
    setSelectedRunbook(null)
    setShowNewRunbook(false)
  }, [])

  const handleSaved = useCallback(() => {
    setShowNewRunbook(false)
  }, [])

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SRE 运维中心</h1>
        <p className="text-sm text-muted-foreground mt-1">
          部署管理 · 发布门禁 · 可观测性 · 告警 · 事件 · 回滚 · 运维手册
        </p>
      </div>

      {/* Anchor navigation */}
      <nav className="sticky top-0 z-20 -mx-6 px-6 pb-3 pt-2 bg-background border-b border-border">
        <div className="flex items-center gap-1 overflow-x-auto">
          {anchorSections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollTo(section.id)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
              >
                <Icon className="size-4" />
                {section.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Deploy */}
      <section id="deploy">
        <DeployPanel />
      </section>

      {/* Checker */}
      <section id="checker">
        <SreCheckerPanel />
      </section>

      {/* Observability */}
      <section id="observability">
        <ObservabilityPanel />
      </section>

      {/* Alerts */}
      <section id="alerts">
        <AlertRulesPanel />
      </section>

      {/* Incidents */}
      <section id="incidents">
        <IncidentList />
      </section>

      {/* Rollback */}
      <section id="rollback">
        <RollbackPanel />
      </section>

      {/* Runbooks */}
      <section id="runbooks">
        <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <BookOpen className="size-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">运维手册</h2>
              <p className="text-xs text-muted-foreground">Runbook 管理 · 排障树 · 应急预案</p>
            </div>
          </div>

          {showNewRunbook ? (
            <RunbookEditor
              runbook={null}
              onBack={handleBack}
              onSaved={handleSaved}
            />
          ) : selectedRunbook ? (
            <div className="space-y-6">
              <RunbookEditor
                runbook={selectedRunbook}
                onBack={handleBack}
                onSaved={handleSaved}
              />
              {selectedRunbook.troubleshootTree.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h3 className="text-sm font-semibold mb-4">排障决策树</h3>
                  <TroubleshootTree nodes={selectedRunbook.troubleshootTree} />
                </div>
              )}
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden" style={{ height: 480 }}>
              <RunbookList
                onSelect={handleSelectRunbook}
                onCreateNew={handleCreateNew}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
