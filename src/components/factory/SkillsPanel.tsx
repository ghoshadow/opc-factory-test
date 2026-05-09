"use client";

import { useState } from "react";

import { Check, Package, Plus, X } from "lucide-react";
import useSWR from "swr";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ProductionLine, Skill, SkillsResponse } from "@/types/factory";

const lines: { key: ProductionLine; label: string }[] = [
  { key: "requirements", label: "需求" },
  { key: "coding", label: "编码" },
  { key: "testing", label: "测试" },
  { key: "sre", label: "SRE" },
];

const fetcher = (url: string): Promise<SkillsResponse> => fetch(url).then((res) => res.json());

export function SkillsPanel() {
  const [activeLine, setActiveLine] = useState<ProductionLine>("requirements");

  const { data, error, isLoading, mutate } = useSWR<SkillsResponse>(
    `/api/v1/skills?line=${activeLine}`,
    fetcher,
  );

  const handleToggle = async (skillId: string, currentStatus: string) => {
    const action = currentStatus === "installed" ? "uninstall" : "install";

    const res = await fetch("/api/v1/skills/install", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillId, action }),
    });

    if (res.ok) {
      mutate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Package className="size-5 text-muted-foreground" />
          工装管理
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">管理各产线的可用工装，按需安装与卸载</p>
      </div>

      <div className="flex gap-6">
        {/* Left: production line tabs */}
        <div className="w-32 shrink-0 space-y-1">
          {lines.map((line) => (
            <button
              key={line.key}
              type="button"
              onClick={() => setActiveLine(line.key)}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                activeLine === line.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {line.label}
            </button>
          ))}
        </div>

        {/* Right: skills list */}
        <div className="flex-1 min-w-0">
          {isLoading && <SkillsSkeleton />}
          {error && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">加载工装列表失败</p>
            </div>
          )}
          {data && data.skills.length === 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
              <Package className="mx-auto size-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">该产线暂无工装</p>
            </div>
          )}
          {data && data.skills.length > 0 && (
            <div className="space-y-3">
              {data.skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} onToggle={handleToggle} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkillCard({
  skill,
  onToggle,
}: {
  skill: Skill;
  onToggle: (id: string, status: string) => void;
}) {
  const isInstalled = skill.status === "installed";

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-all",
        isInstalled ? "border-emerald-200 dark:border-emerald-800" : "border-border",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-foreground truncate">{skill.name}</h4>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              isInstalled
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-muted text-muted-foreground",
            )}
          >
            {isInstalled ? (
              <>
                <Check className="size-3" />
                已安装
              </>
            ) : (
              "可用"
            )}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground truncate">{skill.description}</p>
      </div>

      <button
        type="button"
        onClick={() => onToggle(skill.id, skill.status)}
        className={cn(
          "ml-4 shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
          isInstalled
            ? "border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            : "bg-primary text-primary-foreground hover:bg-primary/80",
        )}
      >
        {isInstalled ? (
          <>
            <X className="size-3.5" />
            卸载
          </>
        ) : (
          <>
            <Plus className="size-3.5" />
            安装
          </>
        )}
      </button>
    </div>
  );
}

function SkillsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm"
        >
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-16 ml-4" />
        </div>
      ))}
    </div>
  );
}
