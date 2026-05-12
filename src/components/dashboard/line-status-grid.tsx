import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Code, TestTube, Server, CheckCircle2, AlertTriangle, XCircle, Pause } from "lucide-react";

type LineKey = "requirement" | "coding" | "testing" | "sre"
type LineStatus = "healthy" | "degraded" | "blocked" | "idle"

interface DashboardLine {
  line: LineKey
  name: string
  status: LineStatus
  activeItems: number
  completedToday: number
  currentPhase: string
  nextMilestone: string
}

interface LineStatusGridProps {
  data: DashboardLine[];
}

const lineIcons: Record<LineKey, typeof GitBranch> = {
  requirement: GitBranch,
  coding: Code,
  testing: TestTube,
  sre: Server,
};

const statusConfig: Record<LineStatus, { icon: typeof CheckCircle2; label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  healthy: { icon: CheckCircle2, label: "正常", variant: "default", color: "text-green-600" },
  degraded: { icon: AlertTriangle, label: "降级", variant: "secondary", color: "text-amber-600" },
  blocked: { icon: XCircle, label: "阻塞", variant: "destructive", color: "text-red-600" },
  idle: { icon: Pause, label: "空闲", variant: "outline", color: "text-gray-500" },
};

export function LineStatusGrid({ data }: LineStatusGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((line) => {
        const Icon = lineIcons[line.line];
        const status = statusConfig[line.status];
        const StatusIcon = status.icon;
        return (
          <Card key={line.line}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">{line.name}</CardTitle>
                </div>
                <Badge variant={status.variant} className="gap-1">
                  <StatusIcon className={`h-3 w-3 ${status.color}`} />
                  {status.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-md bg-muted p-2">
                  <div className="text-lg font-bold">{line.activeItems}</div>
                  <div className="text-xs text-muted-foreground">活跃工单</div>
                </div>
                <div className="rounded-md bg-muted p-2">
                  <div className="text-lg font-bold">{line.completedToday}</div>
                  <div className="text-xs text-muted-foreground">今日完成</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>当前阶段</span>
                  <span className="font-medium text-foreground">{line.currentPhase}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>下个里程碑</span>
                  <span className="font-medium text-foreground">{line.nextMilestone}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
