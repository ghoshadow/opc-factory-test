"use client";

import { useCallback, useState } from "react";

import { Siren } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";

import { IncidentDetail } from "@/components/sre/IncidentDetail";
import { IncidentList } from "@/components/sre/IncidentList";
import type { Incident, IncidentListResponse } from "@/types/factory";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ViewMode = "list" | "detail";

export default function IncidentsPage() {
  const [selected, setSelected] = useState<Incident | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [reflowing, setReflowing] = useState(false);

  const { data, mutate } = useSWR<IncidentListResponse>(
    viewMode === "detail" ? "/api/v1/sre/incidents" : null,
    fetcher,
    { refreshInterval: 30000 },
  );

  const handleSelect = useCallback((incident: Incident) => {
    setSelected(incident);
    setViewMode("detail");
  }, []);

  const handleBack = useCallback(() => {
    setViewMode("list");
    setSelected(null);
  }, []);

  const handleReflow = useCallback(
    async (id: string) => {
      setReflowing(true);
      try {
        const res = await fetch(`/api/v1/sre/incidents/${id}/reflow`, { method: "POST" });
        const result = await res.json();
        if (selected && selected.id === id) {
          setSelected({ ...selected, status: "已回流" });
        }
        toast.success("回流成功", {
          description: `Incident ${id} 已回流至 Intake，Bug 工单 ${result.bugRef}`,
        });
        // Refresh incident list cache
        mutate();
      } catch {
        toast.error("回流失败", {
          description: "无法回流至 Intake，请稍后重试",
        });
      } finally {
        setReflowing(false);
      }
    },
    [selected, mutate],
  );

  // Find latest version of selected incident
  const latestIncident =
    selected && data ? (data.incidents.find((i) => i.id === selected.id) ?? selected) : selected;

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      {/* Page header */}
      <div className="shrink-0">
        <div className="flex items-center gap-3">
          <Siren className="size-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Incident 诊断面板</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Incident Agent 自动诊断、根因分析与 Bug 回流
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 rounded-xl border bg-card shadow-sm overflow-hidden">
        {viewMode === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-full">
            {/* Left panel: Incident list */}
            <div className="border-r border-border overflow-hidden">
              <IncidentList onSelect={handleSelect} selectedId={selected?.id} />
            </div>

            {/* Right panel: empty state */}
            <div className="hidden md:flex items-center justify-center p-8">
              <div className="text-center space-y-2">
                <Siren className="size-12 text-muted-foreground/20 mx-auto" />
                <p className="text-sm text-muted-foreground">选择一个 Incident 查看诊断详情</p>
                <p className="text-xs text-muted-foreground/60">
                  已诊断的 Incident 可回流至 Intake 创建 Bug 工单
                </p>
              </div>
            </div>
          </div>
        )}

        {viewMode === "detail" && latestIncident && (
          <IncidentDetail
            incident={latestIncident}
            onBack={handleBack}
            onReflow={handleReflow}
            reflowing={reflowing}
          />
        )}
      </div>
    </div>
  );
}
