"use client";

import { useCallback, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronUp,
  FileText,
  HelpCircle,
  Loader2,
  RotateCcw,
  Send,
} from "lucide-react";
import useSWR from "swr";

import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  GapAnswer,
  GapAnswersResponse,
  GapQuestion,
  GapSeverity,
  GapSubmitResponse,
} from "@/types/requirement";

const fetcher = (url: string): Promise<GapAnswersResponse> => fetch(url).then((res) => res.json());

const severityConfig: Record<
  GapSeverity,
  { label: string; barClass: string; badgeClass: string; iconClass: string }
> = {
  critical: {
    label: "严重",
    barClass: "bg-red-500",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    iconClass: "text-red-500",
  },
  major: {
    label: "重要",
    barClass: "bg-amber-500",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    iconClass: "text-amber-500",
  },
  minor: {
    label: "建议",
    barClass: "bg-blue-400",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    iconClass: "text-blue-400",
  },
};

function SeverityBadge({ severity }: { severity: GapSeverity }) {
  const cfg = severityConfig[severity];
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${cfg.badgeClass}`}
    >
      {cfg.label}
    </span>
  );
}

function SeverityBar({ severity }: { severity: GapSeverity }) {
  const cfg = severityConfig[severity];
  return <div className={`w-1 self-stretch rounded-full shrink-0 ${cfg.barClass}`} />;
}

function QuestionCard({
  question,
  answer,
  onChange,
  disabled,
}: {
  question: GapQuestion;
  answer: string;
  onChange: (questionId: string, value: string) => void;
  disabled: boolean;
}) {
  const cfg = severityConfig[question.severity];

  return (
    <div className="flex gap-0 rounded-lg border bg-card overflow-hidden">
      <SeverityBar severity={question.severity} />
      <div className="flex-1 p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground bg-muted rounded px-1.5 py-0.5">
              #{question.number}
            </span>
            <SeverityBadge severity={question.severity} />
          </div>
        </div>
        <p className="text-sm font-medium leading-relaxed">{question.description}</p>
        {question.hint && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <HelpCircle className="size-3.5 mt-0.5 shrink-0" />
            <span>{question.hint}</span>
          </div>
        )}
        <textarea
          className="w-full min-h-[72px] rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-y disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="请输入你的回答..."
          value={answer}
          onChange={(e) => onChange(question.id, e.target.value)}
          disabled={disabled}
        />
        {answer.length > 0 && (
          <p className="text-[10px] text-muted-foreground text-right tabular-nums">
            {answer.length} 字
          </p>
        )}
      </div>
    </div>
  );
}

interface GapQuestionsProps {
  specId: string;
}

export function GapQuestions({ specId }: GapQuestionsProps) {
  const { data, error, isLoading } = useSWR<GapAnswersResponse>(
    `/api/v1/specs/${specId}/gap-answers`,
    fetcher,
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GapSubmitResponse | null>(null);

  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    // Clear result when user changes answers
    setResult(null);
  }, []);

  const answeredCount = data
    ? data.questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length
    : 0;
  const totalCount = data?.questions.length ?? 0;
  const allAnswered = totalCount > 0 && answeredCount === totalCount;

  const handleSubmit = useCallback(async () => {
    if (!data || !allAnswered) return;
    setSubmitting(true);
    try {
      const answerList: GapAnswer[] = data.questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] ?? "",
      }));
      const res = await fetch(`/api/v1/specs/${specId}/gap-answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerList }),
      });
      if (res.ok) {
        const json: GapSubmitResponse = await res.json();
        setResult(json);
      }
    } finally {
      setSubmitting(false);
    }
  }, [data, answers, allAnswered, specId]);

  const handleReset = useCallback(() => {
    setAnswers({});
    setResult(null);
  }, []);

  // Loading state
  if (isLoading) {
    return <GapQuestionsSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-6 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium">加载失败</p>
            <p className="text-xs text-muted-foreground">无法获取 Gap 问题列表，请稍后重试</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Empty state — no gaps
  if (data.questions.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="无需补充"
        description="当前 Spec 成熟度已达阈值，无需补充问题"
      />
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Gap 追问</h2>
            <p className="text-xs text-muted-foreground">成熟度未达阈值，请补充以下问题</p>
          </div>
        </div>
        {!result && (
          <div className="flex items-center gap-1 text-sm tabular-nums">
            <span className="text-primary font-semibold">{answeredCount}</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold">{totalCount}</span>
            <span className="text-muted-foreground ml-1">已回答</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {!result && totalCount > 0 && (
        <div className="space-y-1">
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(answeredCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Result banner */}
      {result && (
        <div
          className={`rounded-lg border p-4 ${
            result.passed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
          }`}
        >
          {result.passed ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">评分通过</p>
                <p className="text-xs text-emerald-600/70">{result.message}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <AlertTriangle className="size-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-700">评分未通过</p>
                <p className="text-xs text-amber-600/70">{result.message}</p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <RotateCcw className="size-3" />
                  修改回答并重新提交
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Questions */}
      {!result && (
        <div className="space-y-3">
          {data.questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              answer={answers[question.id] ?? ""}
              onChange={handleAnswerChange}
              disabled={submitting}
            />
          ))}
        </div>
      )}

      {/* Submit button */}
      {!result && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <Send className="size-4" />
                提交并重新打分
              </>
            )}
          </button>
        </div>
      )}

      {/* Collapse all hint */}
      {!result && data.questions.length > 0 && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center justify-center gap-1 w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronUp className="size-3" />
          回到顶部
        </button>
      )}
    </div>
  );
}

function GapQuestionsSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-0 rounded-lg border overflow-hidden">
          <Skeleton className="w-1 shrink-0" />
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-8 rounded" />
              <Skeleton className="h-5 w-12 rounded-md" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-[72px] w-full rounded-md" />
          </div>
        </div>
      ))}
      <div className="flex justify-end">
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>
    </div>
  );
}
