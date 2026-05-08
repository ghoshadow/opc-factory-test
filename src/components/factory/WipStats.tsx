"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WipResponse } from "@/app/api/v1/factory/wip/route";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function WipStats() {
  const { data, error, isLoading } = useSWR<WipResponse>(
    "/api/v1/factory/wip",
    fetcher,
    { refreshInterval: 30000 }
  );

  const wip = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">在制品 (WIP)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-8 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-2.5 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive">
            加载失败，请稍后重试
          </div>
        )}

        {wip && (
          <div className="space-y-4">
            <div className="space-y-3">
              {wip.lines.map((line) => {
                const pct = wip.total > 0 ? (line.count / wip.total) * 100 : 0;
                return (
                  <div key={line.slug} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: line.color }}
                        />
                        <span className="font-medium">{line.name}</span>
                      </div>
                      <span className="tabular-nums text-muted-foreground">
                        {line.count} 件
                        <span className="ml-2 text-xs">
                          ({pct.toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: line.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t flex justify-between text-sm">
              <span className="font-semibold">合计</span>
              <span className="tabular-nums font-semibold">
                {wip.total} 件
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
