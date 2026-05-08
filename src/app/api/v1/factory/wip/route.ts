import { NextResponse } from "next/server";

export interface WipLine {
  name: string;
  slug: string;
  count: number;
  color: string;
}

export interface WipResponse {
  lines: WipLine[];
  total: number;
}

const wipData: WipResponse = {
  lines: [
    { name: "需求产线", slug: "requirements", count: 4, color: "#3B82F6" },
    { name: "编码产线", slug: "coding", count: 5, color: "#10B981" },
    { name: "测试产线", slug: "testing", count: 3, color: "#F59E0B" },
    { name: "SRE产线", slug: "sre", count: 1, color: "#8B5CF6" },
  ],
  total: 13,
};

export async function GET() {
  return NextResponse.json(wipData);
}
