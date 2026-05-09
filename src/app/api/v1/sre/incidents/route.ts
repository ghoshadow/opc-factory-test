import { NextResponse } from "next/server";

import { sampleIncidents } from "@/lib/sre-ops-data";
import type { IncidentsResponse } from "@/types/factory";

export async function GET() {
  const response: IncidentsResponse = {
    incidents: sampleIncidents,
    openCount: sampleIncidents.filter((i) => i.status === "open" || i.status === "investigating")
      .length,
    total: sampleIncidents.length,
  };
  return NextResponse.json(response);
}
