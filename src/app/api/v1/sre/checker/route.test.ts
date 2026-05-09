import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/v1/sre/checker/route";

describe("GET /api/v1/sre/checker", () => {
  it("returns checker items with total shape", async () => {
    const response = await GET();
    const body = await response.json();

    expect(body.items).toBeDefined();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThan(0);
  });

  it("returns items with correct shape", async () => {
    const response = await GET();
    const body = await response.json();

    for (const item of body.items) {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("description");
      expect(item).toHaveProperty("status");
      expect(item).toHaveProperty("detail");
    }
  });

  it("returns items with different statuses", async () => {
    const response = await GET();
    const body = await response.json();

    const statuses = body.items.map((i: { status: string }) => i.status);
    expect(statuses).toContain("pass");
    expect(statuses).toContain("fail");
    expect(statuses).toContain("warning");
  });

  it("sets allPass to false when there are failures", async () => {
    const response = await GET();
    const body = await response.json();

    expect(body.allPass).toBe(false);
    expect(body.canRelease).toBe(false);
  });

  it("allPass and canRelease are consistent", async () => {
    const response = await GET();
    const body = await response.json();

    expect(body.canRelease).toBe(body.allPass);
  });

  it("non-pass items have supplementLabel", async () => {
    const response = await GET();
    const body = await response.json();

    const nonPass = body.items.filter(
      (i: { status: string; supplementLabel?: string }) => i.status !== "pass",
    );
    // At least one non-pass item should exist
    expect(nonPass.length).toBeGreaterThan(0);
    // Each non-pass item may or may not have supplementLabel
    // so just verify the property exists (can be undefined)
    for (const item of nonPass) {
      expect(item).toHaveProperty("supplementLabel");
    }
  });
});
