import { NextResponse } from "next/server";
import { productionLines } from "@/lib/mock-data";
import type { ProductionLine } from "@/lib/types";

export interface LineStatusResponse {
  data: ProductionLine[];
  updatedAt: string;
}

export async function GET() {
  const response: LineStatusResponse = {
    data: productionLines,
    updatedAt: new Date().toISOString(),
  };
  return NextResponse.json(response);
}
