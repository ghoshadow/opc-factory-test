"use client";

import { useCallback } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { AlertTriangle, Clock, ArrowRight, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Alert } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const severityConfig = {
  urgent: {
    label: "紧急",
    variant: "destructive" as const,
    icon: AlertTriangle,
  },
  warning: {
    label: "警告",
    variant: "secondary" as const,
    icon: Bell,
  },
};

const routeConfig: Record<Alert["route"], { label: string; className: string }> = {
  "值班": {
    label: "值班",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  OPC: {
    label: "OPC",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  "自动处置": {
    label: "自动处置",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
};

function formatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} 小时前`;
  return date.toLocaleDateString("zh-CN");
}

export function AlertList({ className }: { className?: string }) {
  const { data: alerts, error, isLoading } = useSWR<Alert[]>(
    "/api/v1/factory/alerts",
    fetcher,
    { refreshInterval: 30_000 }
  );

  const handleClick = useCallback((alert: Alert) => {
    toast.info(`${alert.id}: ${alert.description}`, {
      description: `路由目标: ${routeConfig[alert.route].label} · ${alert.productionLine ?? "—"}`,
    });
  }, []);

  const urgentCount = alerts?.filter((a) => a.severity === "urgent").length ?? 0;

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Bell className="size-5" />
            告警与阻塞通知
          </CardTitle>
          {urgentCount > 0 && (
            <Badge variant="destructive">
              {urgentCount} 紧急
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            加载中...
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center py-16 text-destructive text-sm">
            加载失败，请重试
          </div>
        )}
        {alerts && alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
            <Bell className="size-8 opacity-30" />
            暂无告警
          </div>
        )}
        {alerts && alerts.length > 0 && (
          <ScrollArea className="max-h-[400px]">
            <div className="divide-y divide-border">
              {alerts.map((alert) => {
                const SevIcon = severityConfig[alert.severity].icon;
                return (
                  <button
                    key={alert.id}
                    onClick={() => handleClick(alert)}
                    className="w-full px-4 py-3 text-left transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none"
                  >
                    <div className="flex items-start gap-3">
                      <SevIcon
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          alert.severity === "urgent"
                            ? "text-destructive"
                            : "text-amber-500"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {alert.id}
                          </span>
                          <Badge
                            variant={severityConfig[alert.severity].variant}
                            className="text-[10px]"
                          >
                            {severityConfig[alert.severity].label}
                          </Badge>
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[10px] font-medium",
                              routeConfig[alert.route].className
                            )}
                          >
                            <ArrowRight className="mr-0.5 inline size-2.5" />
                            {routeConfig[alert.route].label}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-snug">{alert.description}</p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {formatTime(alert.timestamp)}
                          {alert.productionLine && (
                            <>
                              <span className="opacity-40">·</span>
                              {alert.productionLine}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
