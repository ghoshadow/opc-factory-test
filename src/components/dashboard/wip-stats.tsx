import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardWipStats as WipStatsType } from "@/lib/types";
import { GitBranch, Code, TestTube, Server } from "lucide-react";

interface WipStatsProps {
  data: WipStatsType;
}

const lineConfig = [
  { key: "requirementLine" as const, label: "需求产线", icon: GitBranch, color: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800" },
  { key: "codingLine" as const, label: "编码产线", icon: Code, color: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" },
  { key: "testingLine" as const, label: "测试产线", icon: TestTube, color: "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800" },
  { key: "sreLine" as const, label: "SRE产线", icon: Server, color: "bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800" },
];

export function WipStats({ data }: WipStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">WIP 统计</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {lineConfig.map(({ key, label, icon: Icon, color }) => {
            const line = data[key];
            return (
              <div key={key} className={`rounded-lg border p-4 ${color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{label}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {line.total}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(line.byPhase).map(([phase, count]) => (
                    <div key={phase} className="flex justify-between text-xs text-muted-foreground">
                      <span>{phase}</span>
                      <span className="font-mono">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
