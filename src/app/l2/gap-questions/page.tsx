"use client";

import { GapQuestions } from "@/components/requirement/GapQuestions";

export default function GapQuestionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gap 追问</h1>
        <p className="text-sm text-muted-foreground mt-1">
          成熟度评审未达标时，由 Gap Agent 自动生成补充问题，OPC 逐项回答后触发重新评分
        </p>
      </div>

      <GapQuestions specId="spec-001" />
    </div>
  );
}
