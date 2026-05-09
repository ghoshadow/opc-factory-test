import { OntologyManager } from "@/components/ontology/OntologyManager";

export default function OntologyPage() {
  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">两层本体</h1>
        <p className="text-sm text-muted-foreground mt-1">
          工厂本体（只读） · 业务本体（可编辑） · 跨项目知识复用
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <OntologyManager />
      </div>
    </div>
  );
}
