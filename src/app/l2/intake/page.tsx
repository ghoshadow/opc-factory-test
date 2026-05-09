import { IntakeList } from "@/components/requirement/IntakeList";

export default function IntakePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">入厂需求队列</h1>
        <p className="text-sm text-muted-foreground mt-1">
          展示所有入厂需求，按优先级排序，支持按类型、优先级和状态筛选
        </p>
      </div>

      <IntakeList />
    </div>
  );
}
