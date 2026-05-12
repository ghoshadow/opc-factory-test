import { NextResponse } from "next/server";

import { sampleLogs, sampleMetrics, sampleTraces } from "@/lib/sre-ops-data";
import type { ObservabilityResponse } from "@/types/factory";

export async function GET() {
  const response: ObservabilityResponse = {
    metrics: sampleMetrics,
    logs: sampleLogs,
    traces: sampleTraces,
    updatedAt: new Date().toISOString(),
  };
  return NextResponse.json(response);
}
