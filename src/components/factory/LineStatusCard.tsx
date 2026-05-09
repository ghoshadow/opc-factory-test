"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { ProductionLine } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LineStatusCardProps {
  line: ProductionLine;
}

export function LineStatusCard({ line }: LineStatusCardProps) {
  const router = useRouter();

  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        line.status === "ATTENTION"
          ? "border-amber-400 ring-amber-400/20"
          : "border-transparent"
      )}
      onClick={() => router.push(`/${line.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{line.name}</CardTitle>
          <StatusBadge status={line.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">OPC:</span>
          {line.opc}
          <span className="mx-1.5 text-border">|</span>
          <span className="font-medium text-foreground">职能:</span>
          {line.function}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-md bg-muted/50 p-2 text-center">
            <div className="text-2xl font-bold text-foreground">{line.wip}</div>
            <div className="text-xs text-muted-foreground">在制</div>
          </div>
          <div className="rounded-md bg-muted/50 p-2 text-center">
            <div className="text-2xl font-bold text-foreground">
              {line.completed}
            </div>
            <div className="text-xs text-muted-foreground">已完成</div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">异常:</span>{" "}
          {line.anomaly}
        </div>
      </CardContent>
    </Card>
  );
}
