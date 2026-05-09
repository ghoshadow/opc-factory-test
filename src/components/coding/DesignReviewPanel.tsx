"use client";

import { AlertTriangle, Check, Clock, PencilRuler, X } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { DesignReviewItem, ReviewItemStatus } from "@/types/factory";

const statusConfig: Record<
  ReviewItemStatus,
  { icon: typeof Check; label: string; badgeClass: string }
> = {
  pass: {
    icon: Check,
    label: "通过",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  fail: {
    icon: X,
    label: "未通过",
    badgeClass: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    label: "警告",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  pending: {
    icon: Clock,
    label: "待审查",
    badgeClass: "bg-muted text-muted-foreground",
  },
};

function ReviewItem({ item }: { item: DesignReviewItem }) {
  const cfg = statusConfig[item.status];
  const Icon = cfg.icon;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
      <div className={`mt-0.5 shrink-0 rounded-full p-1 ${cfg.badgeClass}`}>
        <Icon className="size-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm font-medium">{item.name}</h4>
          <span
            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ${cfg.badgeClass}`}
          >
            {cfg.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
        <p className="text-xs mt-1.5 leading-relaxed">{item.detail}</p>
      </div>
    </div>
  );
}

export function DesignReviewPanel({
  items,
  isLoading,
}: {
  items?: DesignReviewItem[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-3">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center gap-3">
          <PencilRuler className="size-5 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">暂无 Design Review 数据</p>
        </div>
      </div>
    );
  }

  const passCount = items.filter((i) => i.status === "pass").length;

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PencilRuler className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Design Review</h3>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {passCount}/{items.length} 通过
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <ReviewItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
