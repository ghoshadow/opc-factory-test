import { NextResponse } from "next/server";
import { productionLines } from "@/lib/mock-data";

export interface Deliverable {
  id: string
  name: string
  type: string
  status: "done" | "in_progress" | "pending"
  updatedAt: string
}

export type LineStatusResponse = typeof productionLines

export async function GET() {
  return NextResponse.json(productionLines);
}
