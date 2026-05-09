"use client";

import { useEffect, useRef } from "react";

import { AlertRulesPanel } from "@/components/sre/AlertRulesPanel";
import { IncidentListPanel } from "@/components/sre/IncidentListPanel";
import { ObservabilityPanel } from "@/components/sre/ObservabilityPanel";
import { RollbackPanel } from "@/components/sre/RollbackPanel";
import { RunbookPanel } from "@/components/sre/RunbookPanel";
import { SreCheckerPanel } from "@/components/sre/SreCheckerPanel";

const sections = [
  { id: "checker", label: "发布门禁" },
  { id: "observability", label: "可观测性" },
  { id: "alerts", label: "告警规则" },
  { id: "incidents", label: "故障工单" },
  { id: "rollbacks", label: "回滚记录" },
  { id: "runbooks", label: "运维手册" },
];

export default function SreOpsCenterPage() {
  const navRef = useRef<HTMLDivElement>(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SRE 运维中心</h1>
        <p className="text-sm text-muted-foreground mt-1">
          可观测性 · 告警 · 故障管理 · 回滚 · 运维手册
        </p>
      </div>

      {/* Sticky anchor nav */}
      <div
        ref={navRef}
        className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-background/95 backdrop-blur border-b border-border overflow-x-auto"
      >
        <nav className="flex items-center gap-1 min-w-max" aria-label="SRE 运维中心导航">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className="px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {s.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content sections */}
      <div className="space-y-6">
        {/* Full width: SRE Checker */}
        <section id="checker" className="scroll-mt-20">
          <SreCheckerPanel />
        </section>

        {/* Full width: Observability */}
        <section id="observability" className="scroll-mt-20">
          <ObservabilityPanel />
        </section>

        {/* 2-column: Alert Rules + Incident List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section id="alerts" className="scroll-mt-20">
            <AlertRulesPanel />
          </section>
          <section id="incidents" className="scroll-mt-20">
            <IncidentListPanel />
          </section>
        </div>

        {/* 2-column: Rollback + Runbook */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section id="rollbacks" className="scroll-mt-20">
            <RollbackPanel />
          </section>
          <section id="runbooks" className="scroll-mt-20">
            <RunbookPanel />
          </section>
        </div>
      </div>
    </div>
  );
}
