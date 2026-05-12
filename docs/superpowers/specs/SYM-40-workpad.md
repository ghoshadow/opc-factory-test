## Claude Workpad

```text
SYM-40:~/code/symphony-workspaces/SYM-40@32f2839
```

### Discovery Notes

**Source**: Linear ticket SYM-40 description (2026-05-10)

**Extracted Requirement Signals**:

1. **Primary Actor**: External system / API client submitting requirements for intake
2. **Core Workflow**: Submit → Validate → Assign ID → Return queued status
3. **Key Business Concepts**:
   - **Intake Item** (入厂需求): A requirement submitted into the intake queue
   - **Intake Type** (需求类型): Classification — 初步需求 (preliminary), 功能需求 (feature), 技术需求 (technical), Bug 报告 (bug report)
   - **Priority** (优先级): Urgency level — P0 (urgent), P1 (high), P2 (medium), P3 (low)
   - **Status** (状态): Lifecycle — queued → triaging → accepted | rejected
4. **Data Flow**:
   - Client POSTs JSON body with type, title, description, priority
   - Server validates via zod schema (double validation: frontend + backend)
   - On success: generate UUID, set status=queued, record timestamp, return 201
   - On validation failure: return 400 with field-level error map
   - On malformed JSON: return 400 with generic error
5. **API Contract** (as implemented, adapted from ticket):
   - `POST /api/v1/intake` — submit intake item
   - `GET /api/v1/intake` — list intake items (with optional status/type/priority filters, priority-sorted)
6. **Validation Rules** (frontend-backend aligned):
   - `type`: enum ["初步需求", "功能需求", "技术需求", "Bug 报告"]
   - `title`: string, 1-200 chars
   - `description`: string, 1-5000 chars
   - `priority`: enum ["P0", "P1", "P2", "P3"]
7. **Implementation Artifacts**:
   - `src/app/api/v1/intake/route.ts` — GET + POST handlers (implemented)
   - `src/lib/validations/intake.ts` — zod schema (implemented)
   - `src/types/requirement.ts` — TypeScript types (implemented)
   - `src/components/requirement/IntakeForm.tsx` — frontend form (implemented, using simulated API call)
8. **Noted Gaps**:
   - Frontend form uses `setTimeout` simulation instead of calling actual POST endpoint
   - No automated tests for the intake API route
   - Ticket original spec used different type labels ("Bug单", "改动单") and priority labels ("urgent"/"high"/"medium"/"low") — implementation adapted to existing codebase conventions (P0-P3, expanded types)
   - No persistence layer — data is in-memory mock

### Meta-Spec v1

#### User Stories

**US-1: Submit Intake Item**
- **Actor**: API Client (internal system / frontend application)
- **Action**: POST a validated intake item payload to `/api/v1/intake`
- **Goal**: The item is accepted into the intake queue with a unique ID and `queued` status

**US-2: List Intake Queue**
- **Actor**: API Client (dashboard / queue management UI)
- **Action**: GET `/api/v1/intake` with optional filter params
- **Goal**: Receive a filtered, priority-sorted list of intake items

**US-3: Double Validation**
- **Actor**: API Client (frontend form)
- **Action**: Submit data that passes frontend (zod) AND backend (zod) validation
- **Goal**: Only valid data enters the intake queue; invalid data returns structured field-level errors

#### Acceptance Criteria

**AC-1.1**: Valid intake submission returns 201
- **Given** a valid JSON body with type, title, description, and priority
- **When** the client sends POST /api/v1/intake
- **Then** the response has status 201, and the body contains `{ id: string, status: "queued", createdAt: ISO8601 string }`

**AC-1.2**: Invalid intake submission returns 400 with field errors
- **Given** a JSON body that fails zod validation (e.g., missing title, invalid type)
- **When** the client sends POST /api/v1/intake
- **Then** the response has status 400, and the body contains `{ error: string, fields: Record<string, string> }` mapping field paths to error messages

**AC-1.3**: Malformed JSON body returns 400
- **Given** a request body that is not valid JSON
- **When** the client sends POST /api/v1/intake
- **Then** the response has status 400, and the body contains `{ error: string }` indicating invalid JSON format

**AC-2.1**: Unfiltered list returns all items sorted by priority
- **Given** existing intake items in the queue
- **When** the client sends GET /api/v1/intake without query params
- **Then** the response contains `{ items: IntakeItem[], total: number }` with items sorted P0 → P1 → P2 → P3

**AC-2.2**: Status filter returns matching items only
- **Given** existing items with mixed statuses
- **When** the client sends GET /api/v1/intake?status=queued
- **Then** only items with status `queued` are returned

**AC-2.3**: Type filter returns matching items only
- **Given** existing items with mixed types
- **When** the client sends GET /api/v1/intake?type=Bug 报告
- **Then** only items of type `Bug 报告` are returned

**AC-2.4**: Priority filter returns matching items only
- **Given** existing items with mixed priorities
- **When** the client sends GET /api/v1/intake?priority=P0
- **Then** only items with priority `P0` are returned

**AC-3.1**: Frontend and backend share the same validation schema
- **Given** the zod schema at `src/lib/validations/intake.ts`
- **When** both the frontend form and the API route import and use `intakeSchema`
- **Then** the same validation rules (type enum, title length 1-200, description length 1-5000, priority enum) apply in both environments

#### Data Contracts

**Entity: IntakeItem**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | UUID-derived, non-empty | Unique identifier (e.g., "SYM-XXXX") |
| type | IntakeType | enum: "初步需求" \| "功能需求" \| "技术需求" \| "Bug 报告" | Requirement classification |
| title | string | 1-200 characters | Brief title |
| description | string | 1-5000 characters | Detailed description |
| priority | IntakePriority | enum: "P0" \| "P1" \| "P2" \| "P3" | Urgency level |
| status | IntakeStatus | enum: "queued" \| "triaging" \| "accepted" \| "rejected" | Lifecycle state |
| submittedAt | string | ISO 8601 datetime | Submission timestamp |

**Request Body: POST /api/v1/intake**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| type | IntakeType | Yes | Must be one of the 4 defined types |
| title | string | Yes | 1-200 chars |
| description | string | Yes | 1-5000 chars |
| priority | IntakePriority | Yes | Must be one of the 4 defined priorities |

**Response Body: 201 Created**

| Field | Type | Description |
|-------|------|-------------|
| id | string | Generated UUID-based identifier |
| status | "queued" | Always "queued" on creation |
| createdAt | string (ISO 8601) | Server timestamp of creation |

**Response Body: 400 Bad Request**

| Field | Type | Description |
|-------|------|-------------|
| error | string | Human-readable error summary in Chinese |
| fields | Record<string, string>? | Field-level error map (key = field path, value = error message) |

#### UI Sketch

The intake form (`src/components/requirement/IntakeForm.tsx`) presents:

```
┌─────────────────────────────────────┐
│  需求类型 (Segmented Control)        │
│  [初步需求] [功能需求] [技术需求] [Bug报告] │
│                                     │
│  需求标题 (Text Input)               │
│  ┌─────────────────────────────────┐│
│  │ placeholder: 请输入需求标题       ││
│  └─────────────────────────────────┘│
│                                     │
│  需求描述 (Textarea, 5 rows)         │
│  ┌─────────────────────────────────┐│
│  │ placeholder: 10-5000 字符        ││
│  │                                 ││
│  └─────────────────────────────────┘│
│  ⚠️ 描述建议至少 10 字符 (amber warning)│
│                                     │
│  优先级 (Segmented Control)          │
│  [P0] [P1] [P2] [P3]               │
│                                     │
│  [ 提交需求 ]  (Full-width button)    │
│  → toast: "需求已提交" on success    │
└─────────────────────────────────────┘
```

### Maturity Scorecard

| Dimension | Score | Notes |
|-----------|-------|-------|
| Completeness | 8/10 | All core sections filled. Minor gaps: no NFRs (rate limiting, auth), persistence strategy not specified, idempotency not addressed |
| Testability  | 9/10 | All ACs use Given/When/Then with clear pass/fail criteria. Directly testable via HTTP. AC-3.1 is structural but verifiable |
| Consistency  | 9/10 | No contradictions. Type enums, priority values, and field constraints are uniform across user stories, ACs, and data contracts |
| Clarity      | 7/10 | API contract is explicit and implementable. Minor ambiguity: persistence mechanism unspecified, auth/rate-limit expectations unstated |
| **Total**    | **33/40** | **PASS** |

### Gap Report (when GAP)

### Review Findings

- **Business**: SUGGESTION — The implementation's type labels ("功能需求", "技术需求", "Bug 报告") deviate from the ticket's original design ("初步需求", "Bug单", "改动单"). This adaptation aligns with the broader codebase convention (P0-P3 priorities in `src/types/factory.ts`). The deviation should be explicitly documented as intentional.

- **Business**: OK — User stories (submit, list, validate) align with the Factory requirement intake workflow. The `status: "queued"` correctly maps to the Plane Todo state.

- **Architecture**: SUGGESTION — The frontend `IntakeForm` component uses `new Promise(resolve => setTimeout(...))` to simulate an API call rather than calling the actual POST `/api/v1/intake` endpoint. The form and API are disconnected.

- **Architecture**: SUGGESTION — The in-memory `mockItems` array in the API route should eventually be replaced with a persistence layer. This is out of scope for the current ticket but should be tracked as technical debt.

- **Architecture**: OK — Shared zod schema between frontend and backend (`src/lib/validations/intake.ts`) is a clean architectural pattern. Both the form and API route import `intakeSchema`.

- **Risk**: SUGGESTION — ID generation uses `crypto.randomUUID().slice(0, 4).toUpperCase()` which yields only 4 hex characters (~65K possible IDs). For a development/demo system this is acceptable, but production should use a more robust strategy (full UUID, ULID, or sequential counter).

- **Risk**: SUGGESTION — No authentication or rate limiting on the API endpoint. Production deployment would need auth middleware and rate limiting.

- **Risk**: OK — No data loss risk beyond in-memory mock data volatility. No sensitive data handling concerns in the current scope.

- **Delivery**: OK — Core scope is well-defined and fully implemented. The POST and GET handlers, zod validation, types, and frontend form are all in place.

- **Delivery**: SUGGESTION — Connecting the frontend form to the real API endpoint is a small follow-up task (~1 line change). See Architecture finding above.

### Spec Changelog

**v1 (initial)** — No prior version. This is the baseline Meta-Spec produced from the ticket description.

**Review Finding Resolutions:**

| Finding ID | Perspective | Severity | Resolution |
|-----------|-------------|----------|------------|
| R-BIZ-01 | Business | SUGGESTION | Accepted — Type labels adapted from ticket spec to match codebase conventions (P0-P3, expanded types). Documented as intentional deviation. |
| R-ARCH-01 | Architecture | SUGGESTION | Accepted — Frontend form uses simulated API call. Resolution: connect form to real POST endpoint in a follow-up PR. |
| R-ARCH-02 | Architecture | SUGGESTION | Accepted — In-memory mock data is acceptable for current development phase. Tracked as technical debt. |
| R-RISK-01 | Risk | SUGGESTION | Accepted — 4-char ID generation is adequate for dev/demo. Production upgrade noted. |
| R-RISK-02 | Risk | SUGGESTION | Accepted — Auth/rate-limiting deferred to productionization phase. |

**Impact Assessment:**
- No downstream artifacts are affected by these suggestions
- The existing implementation (`route.ts`, `intake.ts`, `IntakeForm.tsx`) remains valid
- Trace links: All ACs remain linked to their user stories (US-1, US-2, US-3)

### Checker Report

- [x] **Chapter completeness**: PASS — All required sections present: Discovery Notes, Meta-Spec (User Stories + ACs + Data Contracts + UI Sketch), Maturity Scorecard, Review Findings, Spec Changelog
- [x] **AC testability**: PASS — All 8 ACs (AC-1.1 through AC-3.1) use Given/When/Then format with verifiable pass/fail conditions
- [x] **Terminology consistency**: PASS — "IntakeItem", "type" (IntakeType), "priority" (IntakePriority), "status" (IntakeStatus) used consistently across all sections
- [x] **Contract self-consistency**: PASS — Response 201 and 400 shapes match POST handler behavior; request body contract matches validation rules; no field contradictions

**Verdict: PASS** → Proceed to Stage 8 (External Reviewer)

### Handoff Notes

- **Spec version**: Meta-Spec v1
- **Maturity score**: 33/40 (PASS)
- **Internal Checker**: All 4 checks PASS
- **Implementation status**: Core implementation complete:
  - `src/app/api/v1/intake/route.ts` — POST + GET handlers
  - `src/lib/validations/intake.ts` — zod schema (shared frontend + backend)
  - `src/types/requirement.ts` — TypeScript interfaces
  - `src/components/requirement/IntakeForm.tsx` — frontend form
- **Open questions for coding OPC**:
  1. Frontend `IntakeForm` uses simulated API call (`setTimeout`) instead of calling `POST /api/v1/intake`. Connect line 54-56 to the real endpoint.
  2. ID generation uses 4 hex chars from UUID (`crypto.randomUUID().slice(0, 4)`). Consider full UUID or ULID for production.
  3. Add automated tests for the POST and GET endpoints (no existing tests found).
  4. In-memory mock data should be replaced with a database when persistence is needed.
- **Recommended coding approach**:
  - Form → API connection: replace the `await new Promise(...)` simulation with `fetch('/api/v1/intake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })`, then check response status before showing toast.
  - Tests: use Next.js route testing pattern to test validation (400 cases) and successful submission (201 case).
  - ID strategy: `crypto.randomUUID()` (full UUID) for uniqueness, or `ulid()` from the `ulid` package for sortable IDs.

### Confusions

- The ticket description specifies different type labels ("Bug单", "改动单") and priority labels ("urgent"/"high"/"medium"/"low") than what was implemented. The implementation uses "P0-P3" priorities and expanded type labels ("功能需求", "技术需求", "Bug 报告") that match the existing codebase conventions in `src/types/factory.ts`. This adaptation was made intentionally but was not explicitly documented at implementation time.

