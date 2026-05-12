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
