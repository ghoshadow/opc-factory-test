import { NextResponse } from "next/server";

import { sampleRollbacks } from "@/lib/sre-ops-data";
import type { RollbackResponse } from "@/types/factory";

export async function GET() {
  const response: RollbackResponse = {
    records: sampleRollbacks,
    total: sampleRollbacks.length,
  };
  return NextResponse.json(response);
}
