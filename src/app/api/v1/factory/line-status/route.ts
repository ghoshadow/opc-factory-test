import { NextResponse } from "next/server";
import { productionLines } from "@/lib/mock-data";

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
