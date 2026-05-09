"use client";

import { useCallback, useState } from "react";

import { BookOpen } from "lucide-react";
import useSWR, { useSWRConfig } from "swr";

import { RunbookEditor } from "@/components/sre/RunbookEditor";
import { RunbookList } from "@/components/sre/RunbookList";
import { TroubleshootTree } from "@/components/sre/TroubleshootTree";
import type { Runbook, RunbookListResponse } from "@/types/factory";

const fetcher = (url: string): Promise<RunbookListResponse> => fetch(url).then((res) => res.json());

type ViewMode = "list" | "editor" | "detail";

export default function RunbooksPage() {
  const [selected, setSelected] = useState<Runbook | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const { mutate } = useSWRConfig();

  const handleSelect = useCallback((runbook: Runbook) => {
    setSelected(runbook);
    setViewMode("detail");
  }, []);

  const handleCreateNew = useCallback(() => {
    setSelected(null);
    setViewMode("editor");
  }, []);

  const handleBack = useCallback(() => {
    setViewMode("list");
    setSelected(null);
  }, []);

  const handleSaved = useCallback(() => {
    mutate("/api/v1/sre/runbooks");
    setViewMode("list");
    setSelected(null);
  }, [mutate]);

  const handleEdit = useCallback(() => {
    if (selected) {
      setViewMode("editor");
    }
  }, [selected]);

  // Refetch runbook data for detail view
  const { data } = useSWR<RunbookListResponse>(
    viewMode === "detail" ? "/api/v1/sre/runbooks" : null,
    fetcher,
    { refreshInterval: 30000 },
  );

  // Find latest version of selected runbook
  const latestRunbook =
    selected && data ? (data.runbooks.find((r) => r.id === selected.id) ?? selected) : selected;

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      {/* Page header */}
      <div className="shrink-0">
        <div className="flex items-center gap-3">
          <BookOpen className="size-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Runbook 管理</h1>
            <p className="text-sm text-muted-foreground mt-1">
              运维手册：启动/停止、扩缩容、排障树、应急预案
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 rounded-xl border bg-card shadow-sm overflow-hidden">
        {viewMode === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-full">
            {/* Left panel: Runbook list */}
            <div className="border-r border-border overflow-hidden">
              <RunbookList
                onSelect={handleSelect}
                onCreateNew={handleCreateNew}
                selectedId={selected?.id}
              />
            </div>

            {/* Right panel: empty state */}
            <div className="hidden md:flex items-center justify-center p-8">
              <div className="text-center space-y-2">
                <BookOpen className="size-12 text-muted-foreground/20 mx-auto" />
                <p className="text-sm text-muted-foreground">选择一个 Runbook 查看详情</p>
                <p className="text-xs text-muted-foreground/60">
                  或点击&ldquo;新建 Runbook&rdquo;创建运维手册
                </p>
              </div>
            </div>
          </div>
        )}

        {viewMode === "editor" && (
          <div className="h-full">
            <RunbookEditor
              key={latestRunbook?.id ?? "new"}
              runbook={latestRunbook}
              onBack={handleBack}
              onSaved={handleSaved}
            />
          </div>
        )}

        {viewMode === "detail" && latestRunbook && (
          <div className="h-full overflow-auto">
            {/* Detail header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-3 py-1.5 text-sm rounded-lg border border-input hover:bg-accent transition-colors"
                >
                  返回列表
                </button>
                <div>
                  <h2 className="text-lg font-semibold">{latestRunbook.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    服务: {latestRunbook.service} · 版本: v{latestRunbook.version}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                编辑
              </button>
            </div>

            {/* Detail body */}
            <div className="px-6 py-6 space-y-8 max-w-3xl">
              {/* Description */}
              <section>
                <p className="text-sm text-muted-foreground">{latestRunbook.description}</p>
                <p className="text-xs text-muted-foreground/70 mt-2">
                  创建于 {new Date(latestRunbook.createdAt).toLocaleDateString("zh-CN")} · 更新于{" "}
                  {new Date(latestRunbook.updatedAt).toLocaleDateString("zh-CN")}
                </p>
              </section>

              {/* Start/Stop Steps */}
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-blue-500" />
                  启动/停止步骤
                </h3>
                {latestRunbook.startStopSteps.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">暂无</p>
                ) : (
                  <ol className="space-y-2">
                    {latestRunbook.startStopSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="font-mono text-xs text-muted-foreground mt-0.5 shrink-0">
                          {i + 1}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              {/* Scale Steps */}
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  扩缩容步骤
                </h3>
                {latestRunbook.scaleSteps.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">暂无</p>
                ) : (
                  <ol className="space-y-2">
                    {latestRunbook.scaleSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="font-mono text-xs text-muted-foreground mt-0.5 shrink-0">
                          {i + 1}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              {/* Troubleshoot Tree */}
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-500" />
                  排障树
                </h3>
                <TroubleshootTree nodes={latestRunbook.troubleshootTree} />
              </section>

              {/* Emergency Plan */}
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-red-500" />
                  应急预案
                </h3>
                {latestRunbook.emergencyPlan ? (
                  <pre className="text-sm font-mono whitespace-pre-wrap rounded-lg border bg-muted/50 p-4">
                    {latestRunbook.emergencyPlan}
                  </pre>
                ) : (
                  <p className="text-xs text-muted-foreground italic">暂无</p>
                )}
              </section>

              {/* Topology Export */}
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-purple-500" />
                  拓扑导出
                </h3>
                {latestRunbook.topologyExport ? (
                  <pre className="text-sm font-mono whitespace-pre-wrap rounded-lg border bg-muted/50 p-4">
                    {latestRunbook.topologyExport}
                  </pre>
                ) : (
                  <p className="text-xs text-muted-foreground italic">暂无</p>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
