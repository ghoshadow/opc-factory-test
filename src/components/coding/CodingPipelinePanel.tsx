"use client";

import { useCallback, useState } from "react";

import {
  AlertTriangle,
  ChevronRight,
  Code2,
  FileCheck,
  FileText,
  GitBranch,
  PencilRuler,
} from "lucide-react";
import useSWR from "swr";

import { PipelineNode } from "@/components/ui/PipelineNode";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  CodingPipelineNode,
  CodingPipelineResponse,
  PipelineNodeStatus,
} from "@/types/factory";

const pipelineStatusConfig: Record<PipelineNodeStatus, { label: string; className: string }> = {
  done: {
    label: "已完成",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  running: {
    label: "进行中",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  waiting: {
    label: "等待中",
    className: "bg-gray-100 text-gray-500 dark:bg-gray-900/60 dark:text-gray-400",
  },
  failed: {
    label: "失败",
    className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
};

function PipelineStatusBadge({ status }: { status: PipelineNodeStatus }) {
  const cfg = pipelineStatusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      <span
        className={`size-1.5 rounded-full ${status === "done" ? "bg-emerald-500" : status === "running" ? "bg-blue-500" : status === "failed" ? "bg-red-500" : "bg-muted-foreground/40"}`}
      />
      {cfg.label}
    </span>
  );
}

const fetcher = (url: string): Promise<CodingPipelineResponse> =>
  fetch(url).then((res) => res.json());

const detailTabs = [
  { key: "plan" as const, label: "Plan", icon: FileText },
  { key: "design" as const, label: "Design", icon: PencilRuler },
  { key: "code" as const, label: "Code", icon: Code2 },
  { key: "report" as const, label: "Report", icon: FileCheck },
];

function NodeDetail({ node }: { node: CodingPipelineNode }) {
  const [activeTab, setActiveTab] = useState<"plan" | "design" | "code" | "report">(() => {
    // Default to first available detail tab
    for (const tab of detailTabs) {
      if (node.details[tab.key]) return tab.key;
    }
    return "plan";
  });

  const content = node.details[activeTab];

  return (
    <div className="bg-muted/30 border rounded-lg">
      {/* Tab bar */}
      <div className="flex border-b bg-muted/20 rounded-t-lg">
        {detailTabs.map((tab) => {
          const hasContent = !!node.details[tab.key];
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              disabled={!hasContent}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-primary text-primary bg-background"
                  : hasContent
                    ? "border-transparent text-muted-foreground hover:text-foreground"
                    : "border-transparent text-muted-foreground/40 cursor-not-allowed"
              }`}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {content ? (
          <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">
            {content}
          </pre>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
            <AlertTriangle className="size-4" />
            <span>该阶段尚未产出内容</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function CodingPipelinePanel() {
  const { data, error, isLoading } = useSWR<CodingPipelineResponse>(
    "/api/v1/coding/pipeline",
    fetcher,
    { refreshInterval: 15000 },
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleNodeClick = useCallback((nodeId: string) => {
    setExpandedId((prev) => (prev === nodeId ? null : nodeId));
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 shrink-0">
              <Skeleton className="h-20 w-28 rounded-lg" />
              {i < 7 && <Skeleton className="h-0.5 w-6" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取 Pipeline 数据，请稍后重试</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { nodes, currentStep, totalSteps } = data;
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="space-y-6">
      {/* Pipeline flow */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <GitBranch className="size-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">编码产线 Pipeline</h2>
              <p className="text-xs text-muted-foreground">
                8 个 Agent 流程节点 · 当前进度 {currentStep}/{totalSteps}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress bar */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {progressPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Node chain */}
        <div className="flex items-start gap-0 overflow-x-auto pb-2">
          {nodes.map((node, i) => (
            <div key={node.id} className="flex items-center shrink-0">
              <button onClick={() => handleNodeClick(node.id)} className="focus:outline-none">
                <PipelineNode
                  label={node.label}
                  status={node.status}
                  isActive={expandedId === node.id}
                />
              </button>
              {i < nodes.length - 1 && (
                <ChevronRight className="size-4 text-muted-foreground/30 shrink-0 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Node legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" /> 完成
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-500" /> 进行中
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-muted-foreground/40" /> 等待中
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-red-500" /> 失败
          </span>
        </div>
      </div>

      {/* Expanded detail */}
      {expandedId &&
        (() => {
          const activeNode = nodes.find((n) => n.id === expandedId);
          if (!activeNode) return null;
          return (
            <div className="rounded-xl border bg-card shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <PipelineStatusBadge status={activeNode.status} />
                <div>
                  <h3 className="font-semibold">{activeNode.label}</h3>
                  <p className="text-xs text-muted-foreground">{activeNode.description}</p>
                </div>
              </div>
              <NodeDetail node={activeNode} />
            </div>
          );
        })()}
    </div>
  );
}
