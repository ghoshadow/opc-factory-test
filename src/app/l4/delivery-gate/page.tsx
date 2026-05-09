import { DeliveryGatePanel } from "@/components/quality/DeliveryGatePanel";

export default function DeliveryGatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">交付门禁总览</h1>
        <p className="text-sm text-muted-foreground mt-1">
          跨产线质量检查汇总 · 四产线门禁状态一目了然
        </p>
      </div>
      <div className="max-w-5xl">
        <DeliveryGatePanel />
      </div>
    </div>
  );
}
