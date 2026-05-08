import { Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RefreshTimestampProps {
  lastUpdated: string | null;
  onRefresh: () => void;
  isLoading: boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function RefreshTimestamp({ lastUpdated, onRefresh, isLoading }: RefreshTimestampProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      {lastUpdated && (
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          最后刷新 {formatTime(lastUpdated)}
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
        className="h-7 gap-1.5 text-xs"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
        刷新
      </Button>
    </div>
  );
}
