import { notFound } from "next/navigation";
import { productionLines } from "@/lib/mock-data";
import { StatusBadge } from "@/components/factory/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LineDetailPageProps {
  params: Promise<{ lineId: string }>;
}

export default async function LineDetailPage({ params }: LineDetailPageProps) {
  const { lineId } = await params;
  const line = productionLines.find((l) => l.id === lineId);

  if (!line) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{line.name}</h1>
        <StatusBadge status={line.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pipeline Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline 流程图</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground justify-center">
              <span className="rounded-md bg-muted px-3 py-1.5 text-xs font-medium">
                需求提交
              </span>
              <span className="text-border">→</span>
              <span className="rounded-md bg-muted px-3 py-1.5 text-xs font-medium">
                Spec 产出
              </span>
              <span className="text-border">→</span>
              <span className="rounded-md bg-muted px-3 py-1.5 text-xs font-medium">
                成熟度评审
              </span>
              <span className="text-border">→</span>
              <span className="rounded-md bg-muted px-3 py-1.5 text-xs font-medium">
                交付
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Kanban */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">看板</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-md bg-muted p-3">
                <div className="text-lg font-bold">{line.wip}</div>
                <div className="text-muted-foreground">在制</div>
              </div>
              <div className="rounded-md bg-muted p-3">
                <div className="text-lg font-bold">{line.completed}</div>
                <div className="text-muted-foreground">已完成</div>
              </div>
              <div className="rounded-md bg-muted p-3">
                <div className="text-lg font-bold">
                  {line.wip + line.completed}
                </div>
                <div className="text-muted-foreground">总计</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deliverables */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">交付物</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Spec 文档
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                本体条目
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                需求规格书
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                评审记录
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Production Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">详细信息</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">OPC 负责人</dt>
              <dd className="font-medium">{line.opc}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">职能</dt>
              <dd className="font-medium">{line.function}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">异常</dt>
              <dd className="font-medium">{line.anomaly}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
