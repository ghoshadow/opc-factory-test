import { CodingCheckerPanel } from "@/components/quality/CodingCheckerPanel";
import { ReqCheckerPanel } from "@/components/quality/ReqCheckerPanel";

export default function CheckerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Checker 门禁</h1>
        <p className="text-sm text-muted-foreground mt-1">需求产线 · 编码产线质量检查</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ReqCheckerPanel />
        <CodingCheckerPanel />
      </div>
    </div>
  );
}
