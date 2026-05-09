import { NextRequest, NextResponse } from "next/server";

import type { MetaSpec } from "@/types/spec";

// In-memory store (mock data)
const specs: Record<string, MetaSpec> = {
  "spec-001": {
    id: "spec-001",
    version: 3,
    userStory:
      "As a factory operator, I want to view real-time WIP statistics\nso that I can identify bottlenecks in the production lines.",
    acceptanceCriteria: [
      {
        id: "ac-1",
        given: "I am on the L1 overview dashboard",
        when: "the page loads",
        then: "I see WIP counts for all 4 production lines",
      },
      {
        id: "ac-2",
        given: "a production line has 0 WIP items",
        when: "the WIP stats render",
        then: "the line shows '0' with a muted indicator",
      },
    ],
    dataContract: {
      inputs: [
        { name: "lineKey", type: "string", required: true },
        { name: "timeRange", type: "string", required: false, constraint: "ISO 8601 duration" },
      ],
      outputs: [
        { name: "lines", type: "WipLine[]", required: true },
        { name: "total", type: "number", required: true },
      ],
    },
    uxDraft:
      "## WIP Stats Component\n\nHorizontal bar chart with 4 rows:\n- Each row shows line name + count + bar\n- Bars use chart-1 through chart-4 CSS variables\n- Total WIP badge in top-right corner\n\nClick a row to navigate to the line's detail page.",
    status: "draft",
    changeTrace: [
      {
        source: "review_board",
        timestamp: "2026-05-08T14:30:00Z",
        description: "Review Board approved: added total WIP badge requirement",
        versionFrom: 2,
        versionTo: 3,
      },
      {
        source: "gap_agent",
        timestamp: "2026-05-07T10:15:00Z",
        description: "Gap Agent identified missing data contract fields for timeRange filter",
        versionFrom: 1,
        versionTo: 2,
      },
    ],
  },
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const spec = specs[id];

  if (!spec) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 });
  }

  return NextResponse.json(spec);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  if (!specs[id]) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 });
  }

  specs[id] = {
    ...specs[id],
    ...body,
    id: specs[id].id,
    version: specs[id].version + 1,
  };

  return NextResponse.json(specs[id]);
}
