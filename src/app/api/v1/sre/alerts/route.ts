import { NextResponse } from "next/server";

import { sampleAlertRules } from "@/lib/sre-ops-data";
import type { AlertsResponse } from "@/types/factory";

export async function GET() {
  const response: AlertsResponse = {
    rules: sampleAlertRules,
    firingCount: sampleAlertRules.filter((r) => r.state === "firing").length,
    total: sampleAlertRules.length,
  };
  return NextResponse.json(response);
}
