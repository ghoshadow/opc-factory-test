import { NextRequest, NextResponse } from "next/server";

import { getSkills } from "@/data/skills";
import type { ProductionLine, SkillsResponse } from "@/types/factory";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const line = searchParams.get("line") as ProductionLine | null;

  const all = getSkills();
  const filtered = line ? all.filter((s) => s.line === line) : all;

  const response: SkillsResponse = { skills: filtered };
  return NextResponse.json(response);
}
