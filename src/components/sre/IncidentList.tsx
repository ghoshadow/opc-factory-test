"use client";

import { useState } from "react";

import { AlertTriangle, Bug, Clock, Search, Shield } from "lucide-react";
import useSWR from "swr";

import { Skeleton } from "@/components/ui/skeleton";
import type {
  Incident,
  IncidentListResponse,
  IncidentSeverity,
  IncidentStatus,
} from "@/types/factory";

const fetcher = (url: string): Promise<IncidentListResponse> =>
  fetch(url).then((res) => res.json());

const severityConfig: Record<IncidentSeverity, { badgeClass: string; dotClass: string }> = {
  P0: {
    badgeClass:
      "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800",
    dotClass: "bg-red-500",
  },
  P1: {
    badgeClass:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    dotClass: "bg-amber-500",
  },
  P2: {
    badgeClass:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    dotClass: "bg-blue-500",
  },
  P3: {
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground/40",
  },
};

const statusConfig: Record<IncidentStatus, { badgeClass: string }> = {
  待诊断: {
    badgeClass: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
  已诊断: {
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  已回流: {
    badgeClass: "bg-muted text-muted-foreground",
  },
};

interface IncidentListProps {
  onSelect: (incident: Incident) => void;
  selectedId?: string;
}

export function IncidentList({ onSelect, selectedId }: IncidentListProps) {
  const [search, setSearch] = useState("");
  const { data, error, isLoading } = useSWR<IncidentListResponse>(
    "/api/v1/sre/incidents",
    fetcher,
    { refreshInterval: 30000 },
  );

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 p-4">
          <AlertTriangle className="size-5 text-red-500" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取 Incident 列表，请稍后重试</p>
          </div>
        </div>
      </div>
    );
  }

  const incidents = data?.incidents ?? [];
  const filtered = search
    ? incidents.filter(
        (inc) =>
          inc.description.toLowerCase().includes(search.toLowerCase()) ||
          inc.service.toLowerCase().includes(search.toLowerCase()) ||
          inc.id.toLowerCase().includes(search.toLowerCase()),
      )
    : incidents;

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索 Incident..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="size-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {search ? "无匹配结果" : "暂无 Incident"}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filtered.map((inc) => {
              const sev = severityConfig[inc.severity];
              const st = statusConfig[inc.status];
              return (
                <button
                  key={inc.id}
                  type="button"
                  onClick={() => onSelect(inc)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedId === inc.id
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-accent border border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 size-2 rounded-full shrink-0 ${sev.dotClass}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold border ${sev.badgeClass}`}
                        >
                          {inc.severity}
                        </span>
                        <span
                          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${st.badgeClass}`}
                        >
                          {inc.status}
                        </span>
                      </div>
                      <p className="text-sm mt-1 line-clamp-2 leading-snug">{inc.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Bug className="size-3" />
                          {inc.service}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          {new Date(inc.discoveredAt).toLocaleTimeString("zh-CN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
        <span>共 {incidents.length} 个 Incident</span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-red-500" />
          {incidents.filter((i) => i.status === "待诊断").length} 待诊断
        </span>
      </div>
    </div>
  );
}
