import type { MetaSpec } from "@/types/spec"

// ============================================================
// Shared in-memory spec store
// Both /api/v1/specs/[id] and /api/v1/specs/[id]/versions use this
// ============================================================

export interface VersionSnapshot {
  id: string
  version: number
  content: string
  summary: string
  timestamp: string
}

const defaultSpec001: MetaSpec = {
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
      {
        name: "timeRange",
        type: "string",
        required: false,
        constraint: "ISO 8601 duration",
      },
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
      description:
        "Review Board approved: added total WIP badge requirement",
      versionFrom: 2,
      versionTo: 3,
    },
    {
      source: "gap_agent",
      timestamp: "2026-05-07T10:15:00Z",
      description:
        "Gap Agent identified missing data contract fields for timeRange filter",
      versionFrom: 1,
      versionTo: 2,
    },
  ],
}

function specToMarkdown(spec: MetaSpec): string {
  const ac = spec.acceptanceCriteria
    .map(
      (item) =>
        `### ${item.id}\n- **Given** ${item.given}\n- **When** ${item.when}\n- **Then** ${item.then}`
    )
    .join("\n\n")

  const inputs = spec.dataContract.inputs
    .map(
      (f) => `| ${f.name} | ${f.type} | ${f.required ? "Yes" : "No"} | ${f.constraint || "—"} |`
    )
    .join("\n")

  const outputs = spec.dataContract.outputs
    .map(
      (f) => `| ${f.name} | ${f.type} | ${f.required ? "Yes" : "No"} | ${f.constraint || "—"} |`
    )
    .join("\n")

  return [
    spec.userStory.replace(/\n/g, " "),
    "",
    "## Acceptance Criteria",
    "",
    ac || "—",
    "",
    "## Data Contract",
    "",
    "### Inputs",
    `| field | type | required | constraint |`,
    "|-------|------|----------|------------|",
    inputs || "| — | — | — | — |",
    "",
    "### Outputs",
    `| field | type | required | constraint |`,
    "|-------|------|----------|------------|",
    outputs || "| — | — | — | — |",
    "",
    "## UX Draft",
    "",
    spec.uxDraft,
  ].join("\n")
}

// In-memory store
export const specs: Record<string, MetaSpec> = {
  "spec-001": { ...defaultSpec001 },
}

// Version snapshots keyed by specId:version
export const versionSnapshots: Record<string, Record<number, VersionSnapshot>> =
  {
    "spec-001": {
      1: {
        id: "spec-001-v1",
        version: 1,
        content: specToMarkdown({
          ...defaultSpec001,
          version: 1,
          userStory:
            "As a factory operator, I want to view real-time WIP statistics\nso that I can identify bottlenecks in production.",
          acceptanceCriteria: [
            {
              id: "ac-1",
              given: "I am on the L1 overview dashboard",
              when: "the page loads",
              then: "I see WIP counts for each production line",
            },
            {
              id: "ac-2",
              given: "a production line has 0 WIP items",
              when: "the WIP stats render",
              then: "the line shows '0' with a muted indicator",
            },
          ],
          dataContract: {
            inputs: [{ name: "lineKey", type: "string", required: true }],
            outputs: [
              { name: "lines", type: "WipLine[]", required: true },
              { name: "total", type: "number", required: true },
            ],
          },
          uxDraft: "Horizontal bar chart with rows showing line name + count + bar",
          changeTrace: [],
        }),
        summary: "初始 Spec 创建",
        timestamp: "2026-05-06T08:00:00Z",
      },
      2: {
        id: "spec-001-v2",
        version: 2,
        content: specToMarkdown({
          ...defaultSpec001,
          version: 2,
          uxDraft: "Horizontal bar chart with rows showing line name + count + bar",
          changeTrace: [
            {
              source: "gap_agent",
              timestamp: "2026-05-07T10:15:00Z",
              description:
                "Gap Agent identified missing data contract fields for timeRange filter",
              versionFrom: 1,
              versionTo: 2,
            },
          ],
        }),
        summary: "Gap Agent 识别到缺少 timeRange 数据契约字段",
        timestamp: "2026-05-07T10:15:00Z",
      },
      3: {
        id: "spec-001-v3",
        version: 3,
        content: specToMarkdown(defaultSpec001),
        summary: "Review Board 审批通过：增加 WIP 总计徽章需求",
        timestamp: "2026-05-09T12:05:00Z",
      },
    },
  }

/** Save a version snapshot from current spec state */
export function saveVersionSnapshot(specId: string): void {
  const spec = specs[specId]
  if (!spec) return

  if (!versionSnapshots[specId]) {
    versionSnapshots[specId] = {}
  }

  versionSnapshots[specId][spec.version] = {
    id: `${specId}-v${spec.version}`,
    version: spec.version,
    content: specToMarkdown(spec),
    summary: spec.changeTrace.length > 0
      ? spec.changeTrace[0].description
      : `版本 v${spec.version}`,
    timestamp: new Date().toISOString(),
  }
}

/** Build versions list for a spec from snapshots + current state */
export function getVersionList(specId: string): {
  id: string
  version: number
  timestamp: string
  summary: string
  isCurrent: boolean
  content?: string
}[] {
  const spec = specs[specId]
  if (!spec) return []

  const currentVersion = spec.version
  const snapshots = versionSnapshots[specId] ?? {}

  const versions = []

  for (let v = 1; v <= currentVersion; v++) {
    const snapshot = snapshots[v]
    versions.push({
      id: `${specId}-v${v}`,
      version: v,
      timestamp:
        snapshot?.timestamp ??
        spec.changeTrace
          .filter((c) => c.versionTo === v)
          .map((c) => c.timestamp)[0] ??
        new Date().toISOString(),
      summary:
        snapshot?.summary ??
        (v === 1 ? "初始 Spec 创建" : `版本 v${v}`),
      isCurrent: v === currentVersion,
      content: snapshot?.content,
    })
  }

  // Return newest first
  return versions.reverse()
}
