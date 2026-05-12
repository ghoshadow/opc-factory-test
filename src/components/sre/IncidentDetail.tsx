"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Lightbulb,
  Server,
  Target,
  TrendingUp,
} from "lucide-react";

import type { Incident } from "@/types/factory";

import { BugPreview } from "./BugPreview";

interface IncidentDetailProps {
  incident: Incident;
  onBack: () => void;
  onReflow: (id: string) => void;
  reflowing: boolean;
}

export function IncidentDetail({ incident, onBack, onReflow, reflowing }: IncidentDetailProps) {
  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-input hover:bg-accent transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            返回列表
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{incident.id}</h2>
              <span
                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold border ${
                  incident.severity === "P0"
                    ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800"
                    : incident.severity === "P1"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                      : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                }`}
              >
                {incident.severity}
              </span>
              <span
                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                  incident.status === "待诊断"
                    ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                    : incident.status === "已诊断"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {incident.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              服务: {incident.service} · 发现时间:{" "}
              {new Date(incident.discoveredAt).toLocaleString("zh-CN")}
            </p>
          </div>
        </div>

        {/* Reflow button (only for diagnosed incidents) */}
        {incident.status === "已诊断" && (
          <button
            type="button"
            onClick={() => onReflow(incident.id)}
            disabled={reflowing}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <TrendingUp className="size-4" />
            {reflowing ? "回流中..." : "回流至 Intake"}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-6 space-y-8 max-w-3xl">
        {/* Description */}
        <section>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-500" />
            事件描述
          </h3>
          <p className="text-sm leading-relaxed">{incident.description}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              发现时间: {new Date(incident.discoveredAt).toLocaleString("zh-CN")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <AlertTriangle className="size-3.5" />
              告警来源: {incident.alertSource}
            </span>
          </div>
        </section>

        {/* Diagnosis Result */}
        {incident.diagnosis ? (
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500" />
              诊断结果
            </h3>
            <div className="rounded-xl border border-border bg-card shadow-sm divide-y divide-border">
              {/* Root Cause */}
              <div className="p-4 flex items-start gap-3">
                <Target className="size-4 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">根因分析</p>
                  <p className="text-sm">{incident.diagnosis.rootCause}</p>
                </div>
              </div>

              {/* Impact Scope */}
              <div className="p-4 flex items-start gap-3">
                <Server className="size-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">影响范围</p>
                  <p className="text-sm">{incident.diagnosis.impactScope}</p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {incident.diagnosis.relatedServices.map((svc) => (
                      <span
                        key={svc}
                        className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestion */}
              <div className="p-4 flex items-start gap-3">
                <Lightbulb className="size-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">修复建议</p>
                  <p className="text-sm whitespace-pre-line">{incident.diagnosis.suggestion}</p>
                </div>
              </div>

              {/* Confidence */}
              <div className="p-4 flex items-center gap-3">
                <TrendingUp className="size-4 text-emerald-500 shrink-0" />
                <div className="flex items-center gap-2 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">诊断置信度</p>
                  <div className="flex-1 max-w-40 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${incident.diagnosis.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">
                    {incident.diagnosis.confidence}%
                  </span>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="size-4 text-amber-500" />
              诊断状态
            </h3>
            <div className="rounded-xl border border-dashed border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10 p-6 text-center">
              <AlertTriangle className="size-8 text-amber-500/40 mx-auto mb-2" />
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">等待诊断</p>
              <p className="text-xs text-muted-foreground mt-1">
                Incident Agent 正在分析中，诊断结果将自动更新
              </p>
            </div>
          </section>
        )}

        {/* Bug Preview */}
        {incident.bugPreview && (
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Target className="size-4 text-purple-500" />
              自动生成 Bug 预览
            </h3>
            <BugPreview bug={incident.bugPreview} />
          </section>
        )}
      </div>
    </div>
  );
}
