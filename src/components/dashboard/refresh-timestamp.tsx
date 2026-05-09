"use client";

import { RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";

interface RefreshTimestampProps {
  timestamp: string;
  onRefresh: () => void;
  isLoading: boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function RefreshTimestamp({ timestamp, onRefresh, isLoading }: RefreshTimestampProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span>
        最后刷新: {formatDate(timestamp)} {formatTime(timestamp)}
      </span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        <RefreshCw className={cn("size-3", isLoading && "animate-spin")} />
        <span>刷新</span>
      </button>
    </div>
  );
}
