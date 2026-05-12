"use client";

import { Activity, Pause } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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

interface TopBarProps {
  status?: FactoryStatus;
}

export function TopBar({ status = "running" }: TopBarProps) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold tracking-tight">OPC Factory</span>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
            cfg.color,
          )}
        >
          <Icon className={cn("h-3 w-3", cfg.pulse)} />
          <span>{cfg.label}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
            OP
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
