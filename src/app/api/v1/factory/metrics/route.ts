import { NextResponse } from "next/server";
import { generateMockDashboardData } from "@/lib/mock-data";

export async function GET() {
  const data = generateMockDashboardData();
  return NextResponse.json(data);
}
