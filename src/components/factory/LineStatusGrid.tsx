import type { LineStatusData } from "@/types/factory";

import { LineStatusCard } from "./LineStatusCard";

interface LineStatusGridProps {
  lines: LineStatusData[];
}

export function LineStatusGrid({ lines }: LineStatusGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {lines.map((line) => (
        <LineStatusCard key={line.id} line={line} />
      ))}
    </div>
  );
}
