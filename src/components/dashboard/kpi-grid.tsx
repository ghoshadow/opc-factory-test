import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiData } from "@/lib/types";
import { TrendingUp, Users, CheckCircle2, AlertTriangle, Clock, BarChart3, Play } from "lucide-react";

interface KpiGridProps {
  data: KpiData;
}

const kpiConfig = [
  { key: "totalItems" as const, label: "总工单", icon: BarChart3, format: (v: number) => v.toString(), color: "text-blue-600" },
  { key: "inProgress" as const, label: "进行中", icon: Play, format: (v: number) => v.toString(), color: "text-amber-600" },
  { key: "completed" as const, label: "已完成", icon: CheckCircle2, format: (v: number) => v.toString(), color: "text-green-600" },
  { key: "blocked" as const, label: "已阻塞", icon: AlertTriangle, format: (v: number) => v.toString(), color: "text-red-600" },
  { key: "passRate" as const, label: "通过率", icon: TrendingUp, format: (v: number) => `${v}%`, color: "text-emerald-600" },
  { key: "avgCycleTime" as const, label: "平均周期", icon: Clock, format: (v: string) => v, color: "text-purple-600" },
  { key: "activeAgents" as const, label: "活跃 Agent", icon: Users, format: (v: number) => v.toString(), color: "text-indigo-600" },
];

export function KpiGrid({ data }: KpiGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {kpiConfig.map(({ key, label, icon: Icon, format, color }) => {
        const value = data[key];
        return (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {format(value as never)}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
