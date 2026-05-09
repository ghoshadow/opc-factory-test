import { NextResponse } from "next/server";

import { productionLines } from "@/lib/mock-data";
import type { ProductionLine } from "@/lib/types";

export interface LineStatusResponse {
  data: ProductionLine[];
  updatedAt: string;
}

export async function GET(): Promise<NextResponse<LineStatusResponse>> {
  return NextResponse.json({
    data: productionLines,
    updatedAt: new Date().toISOString(),
  });
}
