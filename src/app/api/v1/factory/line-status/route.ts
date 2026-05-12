import { NextResponse } from "next/server";
import { productionLines } from "@/lib/mock-data";
import type { ProductionLine } from "@/lib/types";

export interface LineStatusResponse {
  data: ProductionLine[];
  updatedAt: string;
}

export interface LineStatusResponse {
  data: typeof productionLines;
  updatedAt: string;
}

export async function GET() {
  return NextResponse.json({
    data: productionLines,
    updatedAt: new Date().toISOString(),
  });
}
