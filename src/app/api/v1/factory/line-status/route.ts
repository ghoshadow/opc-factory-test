import { NextResponse } from "next/server";
import { productionLines } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    data: productionLines,
    updatedAt: new Date().toISOString(),
  });
}
