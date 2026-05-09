"use client";

import useSWR from "swr";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Activity, Pause, AlertTriangle } from "lucide-react";
import type { AlertData } from "@/types/factory";

type FactoryStatus = "running" | "paused";

const statusConfig: Record<
  FactoryStatus,
  { label: string; icon: typeof Activity; color: string; pulse?: string }
> = {
  running: {
    label: "运行中",
    icon: Activity,
    color: "text-status-active",
    pulse: "animate-pulse",
  },
  paused: {
    label: "已暂停",
    icon: Pause,
    color: "text-status-paused",
  },
};

const alertFetcher = (url: string): Promise<AlertData[]> =>
  fetch(url).then((res) => res.json());

interface TopBarProps {
  status?: FactoryStatus;
}

export function TopBar({ status = "running" }: TopBarProps) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;

  const { data } = useSWR<AlertData[]>(
    "/api/v1/factory/alerts",
    alertFetcher,
    { refreshInterval: 10000 }
  );

  const urgentCount = data?.filter((a) => a.level === "urgent").length ?? 0;

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold tracking-tight">OPC Factory</span>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
            cfg.color
          )}
        >
          <Icon className={cn("h-3 w-3", cfg.pulse)} />
          <span>{cfg.label}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {urgentCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
            <AlertTriangle className="h-3 w-3" />
            <span>{urgentCount} 紧急</span>
          </div>
        )}
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
            OP
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
