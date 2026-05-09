"use client";

import { useState } from "react";

import { ArrowLeft, GitBranch, Plus, Save, Trash2 } from "lucide-react";

import type { Runbook, TroubleshootNode } from "@/types/factory";

interface RunbookEditorProps {
  runbook: Runbook | null;
  onBack: () => void;
  onSaved: () => void;
}

function newRunbookTemplate(): Partial<Runbook> {
  return {
    name: "",
    description: "",
    service: "",
    startStopSteps: [""],
    scaleSteps: [""],
    troubleshootTree: [],
    emergencyPlan: "",
    topologyExport: "",
  };
}

export function RunbookEditor({ runbook, onBack, onSaved }: RunbookEditorProps) {
  const source = runbook ?? newRunbookTemplate();
  const isNew = !runbook;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(source.name!);
  const [description, setDescription] = useState(source.description!);
  const [service, setService] = useState(source.service!);
  const [startStopSteps, setStartStopSteps] = useState<string[]>(
    source.startStopSteps!.length > 0 ? source.startStopSteps! : [""],
  );
  const [scaleSteps, setScaleSteps] = useState<string[]>(
    source.scaleSteps!.length > 0 ? source.scaleSteps! : [""],
  );
  const [emergencyPlan, setEmergencyPlan] = useState(source.emergencyPlan!);
  const [topologyExport, setTopologyExport] = useState(source.topologyExport!);
  const [troubleshootTree, setTroubleshootTree] = useState<TroubleshootNode[]>(
    source.troubleshootTree!,
  );

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        id: runbook?.id,
        name,
        description,
        service,
        startStopSteps: startStopSteps.filter((s) => s.trim()),
        scaleSteps: scaleSteps.filter((s) => s.trim()),
        troubleshootTree,
        emergencyPlan,
        topologyExport,
      };
      const method = isNew ? "POST" : "PUT";
      const res = await fetch("/api/v1/sre/runbooks", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("保存失败");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const addStep = (target: "startStop" | "scale") => {
    if (target === "startStop") setStartStopSteps([...startStopSteps, ""]);
    else setScaleSteps([...scaleSteps, ""]);
  };

  const updateStep = (target: "startStop" | "scale", idx: number, value: string) => {
    if (target === "startStop") {
      const next = [...startStopSteps];
      next[idx] = value;
      setStartStopSteps(next);
    } else {
      const next = [...scaleSteps];
      next[idx] = value;
      setScaleSteps(next);
    }
  };

  const removeStep = (target: "startStop" | "scale", idx: number) => {
    if (target === "startStop" && startStopSteps.length > 1) {
      setStartStopSteps(startStopSteps.filter((_, i) => i !== idx));
    } else if (target === "scale" && scaleSteps.length > 1) {
      setScaleSteps(scaleSteps.filter((_, i) => i !== idx));
    }
  };

  const addTroubleshootNode = () => {
    const newNode: TroubleshootNode = {
      id: `ts-${Date.now()}`,
      question: "",
      steps: [""],
      solution: "",
      children: [],
    };
    setTroubleshootTree([...troubleshootTree, newNode]);
  };

  const updateTroubleshootNode = (idx: number, field: "question" | "solution", value: string) => {
    const next = [...troubleshootTree];
    next[idx] = { ...next[idx], [field]: value };
    setTroubleshootTree(next);
  };

  const updateTroubleshootSteps = (idx: number, stepIdx: number, value: string) => {
    const next = [...troubleshootTree];
    const steps = [...next[idx].steps];
    steps[stepIdx] = value;
    next[idx] = { ...next[idx], steps };
    setTroubleshootTree(next);
  };

  const addTroubleshootStep = (idx: number) => {
    const next = [...troubleshootTree];
    next[idx] = { ...next[idx], steps: [...next[idx].steps, ""] };
    setTroubleshootTree(next);
  };

  const removeTroubleshootNode = (idx: number) => {
    setTroubleshootTree(troubleshootTree.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h2 className="text-lg font-semibold">
              {isNew ? "新建 Runbook" : `编辑: ${runbook?.name}`}
            </h2>
            {!isNew && (
              <p className="text-xs text-muted-foreground">
                当前版本: v{runbook?.version} · 保存后将生成 v{runbook!.version + 1}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Save className="size-4" />
          {saving ? "保存中..." : "保存"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 px-4 py-2.5 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Basic info */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <GitBranch className="size-4 text-primary" />
            基本信息
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Runbook 名称"
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">服务</label>
              <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="关联服务名"
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Runbook 描述"
              rows={2}
              className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </section>

        {/* Start/Stop Steps */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">启动/停止步骤</h3>
            <button
              type="button"
              onClick={() => addStep("startStop")}
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80"
            >
              <Plus className="size-3" />
              添加步骤
            </button>
          </div>
          <div className="space-y-2">
            {startStopSteps.map((step, idx) => (
              <div key={idx} className="flex gap-2">
                <textarea
                  value={step}
                  onChange={(e) => updateStep("startStop", idx, e.target.value)}
                  placeholder={`步骤 ${idx + 1}`}
                  rows={2}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                {startStopSteps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep("startStop", idx)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors shrink-0 self-start mt-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Scale Steps */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">扩缩容步骤</h3>
            <button
              type="button"
              onClick={() => addStep("scale")}
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80"
            >
              <Plus className="size-3" />
              添加步骤
            </button>
          </div>
          <div className="space-y-2">
            {scaleSteps.map((step, idx) => (
              <div key={idx} className="flex gap-2">
                <textarea
                  value={step}
                  onChange={(e) => updateStep("scale", idx, e.target.value)}
                  placeholder={`步骤 ${idx + 1}`}
                  rows={2}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                {scaleSteps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep("scale", idx)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors shrink-0 self-start mt-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Troubleshoot Tree */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">排障树</h3>
            <button
              type="button"
              onClick={addTroubleshootNode}
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80"
            >
              <Plus className="size-3" />
              添加节点
            </button>
          </div>
          {troubleshootTree.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center border-2 border-dashed rounded-lg border-muted-foreground/20">
              暂无排障节点，点击&ldquo;添加节点&rdquo;开始构建排障树
            </p>
          ) : (
            <div className="space-y-4">
              {troubleshootTree.map((node, idx) => (
                <div key={node.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={node.question}
                        onChange={(e) => updateTroubleshootNode(idx, "question", e.target.value)}
                        placeholder="常见问题"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-medium"
                      />
                      <input
                        type="text"
                        value={node.solution}
                        onChange={(e) => updateTroubleshootNode(idx, "solution", e.target.value)}
                        placeholder="解决方案"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">排查步骤</span>
                          <button
                            type="button"
                            onClick={() => addTroubleshootStep(idx)}
                            className="text-xs text-primary hover:text-primary/80"
                          >
                            + 添加
                          </button>
                        </div>
                        {node.steps.map((step, stepIdx) => (
                          <input
                            key={stepIdx}
                            type="text"
                            value={step}
                            onChange={(e) => updateTroubleshootSteps(idx, stepIdx, e.target.value)}
                            placeholder={`排查步骤 ${stepIdx + 1}`}
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTroubleshootNode(idx)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors ml-2"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Emergency Plan */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">应急预案 (Markdown)</h3>
          <textarea
            value={emergencyPlan}
            onChange={(e) => setEmergencyPlan(e.target.value)}
            placeholder="## 应急响应&#10;&#10;### 场景 1&#10;..."
            rows={8}
            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </section>

        {/* Topology Export */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">拓扑导出</h3>
          <textarea
            value={topologyExport}
            onChange={(e) => setTopologyExport(e.target.value)}
            placeholder="digraph { service_a -> service_b; }"
            rows={4}
            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </section>
      </div>
    </div>
  );
}
