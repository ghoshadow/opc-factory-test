"use client";

import { useState } from "react";

import {
  BookOpen,
  Box,
  ChevronRight,
  Database,
  GitBranch,
  Key,
  Layers,
  Shield,
} from "lucide-react";
import useSWR from "swr";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { OntologyResponse, TermKind } from "@/types/factory";

const fetcher = (url: string): Promise<OntologyResponse> => fetch(url).then((res) => res.json());

const kindConfig: Record<TermKind, { icon: typeof Box; label: string; badgeClass: string }> = {
  entity: {
    icon: Database,
    label: "实体",
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  value_object: {
    icon: Layers,
    label: "值对象",
    badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  },
  aggregate: {
    icon: Shield,
    label: "聚合根",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  domain_event: {
    icon: GitBranch,
    label: "领域事件",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  business_rule: {
    icon: Key,
    label: "业务规则",
    badgeClass: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
};

export function OntologyManager() {
  const { data, error, isLoading } = useSWR<OntologyResponse>(
    "/api/v1/requirements/ontology",
    fetcher,
    { refreshInterval: 60000 },
  );

  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm h-[calc(100vh-12rem)] flex">
        <div className="w-64 border-r border-border p-4 space-y-3">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
        <div className="flex-1 p-6 space-y-3">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <BookOpen className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取本体数据，请稍后重试</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const selectedDomain = selectedDomainId
    ? (data.domains.find((d) => d.id === selectedDomainId) ?? null)
    : null;

  const domainTerms = selectedDomainId
    ? data.terms.filter((t) => t.domainId === selectedDomainId)
    : [];

  const factoryDomains = data.domains.filter((d) => d.type === "factory");
  const businessDomains = data.domains.filter((d) => d.type === "business");

  return (
    <div className="rounded-xl border bg-card shadow-sm h-[calc(100vh-12rem)] flex overflow-hidden">
      {/* Domain sidebar */}
      <div className="w-64 shrink-0 border-r border-border overflow-y-auto">
        {/* Factory ontology section */}
        <div className="p-3">
          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
            <Shield className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              工厂本体
            </span>
            <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              只读
            </span>
          </div>
          {factoryDomains.map((domain) => (
            <button
              key={domain.id}
              type="button"
              onClick={() => setSelectedDomainId(domain.id)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg mb-0.5 transition-colors",
                selectedDomainId === domain.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted/50 text-foreground",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm truncate">{domain.name}</span>
                <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
                  {domain.termCount}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">
                {domain.description}
              </p>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-3 border-t border-border" />

        {/* Business ontology section */}
        <div className="p-3">
          <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
            <BookOpen className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              业务本体
            </span>
          </div>
          {businessDomains.map((domain) => (
            <button
              key={domain.id}
              type="button"
              onClick={() => setSelectedDomainId(domain.id)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg mb-0.5 transition-colors",
                selectedDomainId === domain.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted/50 text-foreground",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm truncate">{domain.name}</span>
                <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
                  {domain.termCount}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">
                {domain.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Term detail panel */}
      <div className="flex-1 overflow-y-auto">
        {!selectedDomain ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center space-y-2">
              <BookOpen className="size-12 text-muted-foreground/20 mx-auto" />
              <p className="text-sm text-muted-foreground">选择一个本体域查看术语</p>
              <p className="text-xs text-muted-foreground/60">
                工厂本体（只读）共 {factoryDomains.reduce((s, d) => s + d.termCount, 0)} 项 ·
                业务本体共 {businessDomains.reduce((s, d) => s + d.termCount, 0)} 项
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Domain header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <ChevronRight className="size-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold">{selectedDomain.name}</h2>
                {selectedDomain.type === "factory" && (
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
                    只读
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground ml-6">{selectedDomain.description}</p>
            </div>

            {/* Terms */}
            <div className="space-y-3">
              {domainTerms.map((term) => {
                const kindCfg = kindConfig[term.kind];
                const KindIcon = kindCfg.icon;
                return (
                  <div
                    key={term.id}
                    className="rounded-lg border border-border bg-card p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 shrink-0 rounded-md p-1.5 ${kindCfg.badgeClass}`}>
                        <KindIcon className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold">{term.name}</h3>
                          <span
                            className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${kindCfg.badgeClass}`}
                          >
                            {kindCfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {term.definition}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {term.attributes.map((attr) => (
                            <span
                              key={attr}
                              className="inline-flex items-center rounded bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                            >
                              {attr}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {selectedDomain.type !== "factory" && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          更新于 {new Date(term.updatedAt).toLocaleDateString("zh-CN")}
                        </span>
                        <button
                          type="button"
                          className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          编辑
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Empty state for domain with no terms */}
            {domainTerms.length === 0 && (
              <div className="text-center py-12">
                <Box className="size-10 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">该域暂无术语定义</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
