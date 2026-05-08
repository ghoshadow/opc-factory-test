import { AlertList } from "@/components/factory/AlertList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, GitPullRequest, CheckCircle2, Wrench } from "lucide-react";

const kpiCards = [
  { label: "活跃工单", value: "12", icon: Activity, color: "text-blue-500" },
  { label: "进行中 PR", value: "5", icon: GitPullRequest, color: "text-purple-500" },
  { label: "已通过检查", value: "38", icon: CheckCircle2, color: "text-green-500" },
  { label: "SRE 事件", value: "2", icon: Wrench, color: "text-amber-500" },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground font-mono">
          L1 · 工厂总览
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} size="sm">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <Icon className={`size-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AlertList className="lg:col-span-1" />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">产线状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["需求产线", "编码产线", "测试产线", "SRE产线"].map((line) => (
                <div
                  key={line}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="text-sm font-medium">{line}</span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="size-2 rounded-full bg-green-500" />
                    运行中
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
