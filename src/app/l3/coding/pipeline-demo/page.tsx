"use client";

import { PipelineNode } from "@/components/ui/PipelineNode";

const demoStages = [
  { label: "需求入厂", status: "done" as const },
  { label: "Spec 评审", status: "done" as const },
  { label: "编码实现", status: "running" as const },
  { label: "Code Review", status: "waiting" as const },
  { label: "测试验证", status: "waiting" as const },
  { label: "交付门禁", status: "waiting" as const },
];

export default function PipelineDemoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pipeline 流程图</h1>
        <p className="text-sm text-muted-foreground mt-1">通用 Pipeline 流程图组件展示</p>
      </div>
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-3">
          {demoStages.map((stage, i) => (
            <div key={i} className="flex items-center shrink-0">
              <PipelineNode
                label={stage.label}
                status={stage.status}
                isActive={stage.status === "running"}
              />
              {i < demoStages.length - 1 && (
                <div className="flex items-center shrink-0">
                  <div
                    className={`h-px w-8 ${stage.status === "done" ? "bg-blue-400" : "bg-muted-foreground/20"}`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
