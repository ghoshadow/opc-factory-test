import { NextRequest, NextResponse } from "next/server";

// Reflow: 将诊断完成的 incident 回流至 Intake 创建 Bug
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // In production this would:
  // 1. Look up the incident by id
  // 2. Create a Bug issue in Intake pipeline
  // 3. Update incident status to "已回流"
  // 4. Link the created bug reference

  return NextResponse.json({
    incidentId: id,
    status: "已回流",
    bugRef: `BUG-${Date.now()}`,
    reflowedAt: new Date().toISOString(),
    message: `Incident ${id} 已回流至 Intake，自动生成 Bug 工单`,
  });
}
