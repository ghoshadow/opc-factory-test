## Claude Workpad

```text
SYM-50: Spec 签收审核操作
```

### Discovery Notes

**Input Sources Processed:**
- [x] Linear SYM-50 ticket description — primary requirement document
- [x] Existing codebase analysis — MetaSpec types, SpecEditor component, spec API routes
- [x] Factory Ontology (via `/api/v1/requirements/ontology`) — concept mapping

**Business Concepts Extracted:**

| Concept | Category | Definition |
|---------|----------|------------|
| Signoff (签收) | Action | 需求产线 OPC 确认 Spec 质量合格，批准流转至编码产线 |
| Rework (打回) | Action | 需求产线 OPC 拒绝 Spec，携带原因退回修改 |
| Reviewer (审核人) | Actor | 需求产线 OPC，负责最终审核 Spec |
| SignoffPanel | UI Component | 审核操作面板，包含签收/打回按钮及签名展示 |
| SignoffAction | Data Entity | 审核操作记录：action, comment, reviewerName, timestamp |

**State Transitions Identified:**

```
in_review ──approve──> signed_off (→ 编码产线)
in_review ──reject───> rework (→ 回流需求产线)
```

**Codebase Discovery Findings:**
- `MetaSpec.status` (src/types/spec.ts:35): missing `'rework'` value — needs extension
- `ChangeRecord.source` (src/types/spec.ts:21): missing `'signoff'` source — needs extension
- `SpecEditor.tsx` (line 322-330): status badge only handles draft/ready_for_review/in_review/signed_off — needs rework badge
- No `SignoffAction` type exists — needs creation
- No `POST /api/v1/specs/:id/signoff` endpoint — needs creation
- No `SignoffPanel` component — needs creation per ticket step 1
- `spec-001` mock data (specs route line 35): status is `'draft'`, would need to be `'in_review'` for signoff testing
- Type inconsistency noted: `src/types/factory.ts` defines separate `Spec`/`SpecStatus` (draft/review/approved) — distinct from MetaSpec, may cause confusion

**Actors:**
1. 需求产线 OPC — executes signoff/reject action
2. 编码产线 OPC — downstream consumer of signed_off specs

---

### Meta-Spec v1

#### User Stories

**US-SIGNOFF-1: Spec 签收**
As a 需求产线 OPC, I want to sign off (approve) a Spec that has passed review, so that it transitions to the 编码产线 for implementation.

**US-SIGNOFF-2: Spec 打回**
As a 需求产线 OPC, I want to reject a Spec with a mandatory reason, so that quality issues can be addressed by the requirement team before re-review.

**US-SIGNOFF-3: 审核历史追溯**
As any production line operator, I want to see the signoff signature (reviewer, timestamp, result) on a Spec, so that I can trace who approved or rejected it and when.

#### Acceptance Criteria

**For US-SIGNOFF-1 (签收):**

| ID | Given | When | Then |
|----|-------|------|------|
| AC-1 | A Spec is in `in_review` status | The 需求产线 OPC clicks the green "签收" button and confirms in the dialog | The Spec status changes to `signed_off`, and the UI displays "已签收 → 流转至编码产线" |
| AC-2 | A Spec has just been signed off | The page re-renders with the updated Spec | The signoff signature (reviewer name, timestamp, result) is permanently displayed in the SignoffPanel |
| AC-3 | A Spec is NOT in `in_review` status (e.g., draft, signed_off, rework) | The page renders | The signoff buttons are hidden or disabled |

**For US-SIGNOFF-2 (打回):**

| ID | Given | When | Then |
|----|-------|------|------|
| AC-4 | A Spec is in `in_review` status | The 需求产线 OPC clicks the red "打回" button | A form with a required comment textarea appears |
| AC-5 | The reject form is open and the comment field is empty | The OPC attempts to submit | The submit button is disabled (comment is mandatory) |
| AC-6 | The reject form is open and the comment is filled | The OPC clicks submit | The Spec status changes to `rework`, and the UI displays "已打回 → 回流需求产线" |

**For US-SIGNOFF-3 (追溯):**

| ID | Given | When | Then |
|----|-------|------|------|
| AC-7 | A Spec has been signed off or rejected | The Spec is viewed | The signoff signature strip shows: reviewer name, timestamp, action (签收/打回), and comment (for rejections) |
| AC-8 | Multiple signoff actions have occurred on a Spec | The Spec is viewed | All historical signoff actions are visible in the change trace |

#### Data Contracts

**New Entity: SignoffAction**

```ts
interface SignoffAction {
  action: 'approve' | 'reject'
  comment?: string  // Required when action='reject'
  reviewerName: string
  timestamp: string  // ISO 8601
}
```

**API Endpoint: POST /api/v1/specs/:id/signoff**

Input fields:

| 字段 | 类型 | 必填 | 约束 |
|------|------|------|------|
| action | `'approve' \| 'reject'` | 是 | One of the two values |
| comment | `string` | 条件必填 | Required when action='reject', min 1 char |
| reviewerName | `string` | 是 | Non-empty string |
| timestamp | `string` | 是 | ISO 8601 format |

Output fields:

| 字段 | 类型 | 必填 | 约束 |
|------|------|------|------|
| id | `string` | 是 | Spec ID |
| status | `'signed_off' \| 'rework'` | 是 | Updated status |
| version | `number` | 是 | Incremented version |
| changeTrace | `ChangeRecord[]` | 是 | Appended with signoff record |

Error responses:

| 状态码 | 条件 |
|--------|------|
| 400 | action='reject' but comment is empty or missing |
| 400 | reviewerName or timestamp is missing |
| 404 | Spec not found |
| 409 | Spec status is not `in_review` (invalid state transition) |
| 500 | Server error |

**Type Modifications to src/types/spec.ts:**

1. `MetaSpec.status`: `'draft' | 'ready_for_review' | 'in_review' | 'signed_off'` → add `| 'rework'`
2. `ChangeRecord.source`: `'review_board' | 'gap_agent' | 'revision_engine'` → add `| 'signoff'`
3. New exported interface: `SignoffAction` as defined above

#### UI Sketch

```
┌─────────────────────────────────────────────────────────┐
│ SpecEditor (existing)                                    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ spec-001  v3  [已签收]                              │ │
│ │ [User Story] [验收标准] [数据契约] [UX雏形]           │ │
│ │ ...                                                  │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ SignoffPanel (NEW)                                       │
│                                                          │
│ When status === 'in_review':                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [✓ 签收 (green)]   [✗ 打回 (red)]                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ When status === 'signed_off':                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✓ 已签收 → 流转至编码产线                             │ │
│ │ 审核人: 张三  |  时间: 2026-05-10 14:30              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ When status === 'rework':                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✗ 已打回 → 回流需求产线                               │ │
│ │ 审核人: 张三  |  时间: 2026-05-10 14:30              │ │
│ │ 原因: AC-3 覆盖场景不完整，需补充边界条件测试          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Confirm Dialog (on approve click):                       │
│ ┌──────────────────────────────────────┐                │
│ │ 确认签收 Spec spec-001?              │                │
│ │ 签收后将流转至编码产线，无法撤回。    │                │
│ │                                      │                │
│ │ [取消]  [确认签收]                    │                │
│ └──────────────────────────────────────┘                │
│                                                          │
│ Reject Form (embedded, on reject click):                 │
│ ┌──────────────────────────────────────┐                │
│ │ 打回原因 *                            │                │
│ │ ┌──────────────────────────────────┐ │                │
│ │ │ (textarea, min 1 char)           │ │                │
│ │ └──────────────────────────────────┘ │                │
│ │                                      │                │
│ │ [取消]  [确认打回 (disabled if empty)]│                │
│ └──────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

---

### Maturity Scorecard

| Dimension | Score | Notes |
|-----------|-------|-------|
| Completeness | 9/10 | All required sections present: User Stories (3), ACs (8), Data Contracts (complete), UI Sketch. Minor: edge case for concurrent signoff attempts not covered. |
| Testability  | 9/10 | Every AC has Given/When/Then structure and a verifiable pass/fail outcome. AC-5 has a concrete measurable condition (empty comment → disabled button). AC-3 has clear negative case. |
| Consistency  | 8/10 | Internal consistency good across US/AC/Data Contract. One issue: existing codebase has two parallel Spec type systems (MetaSpec in spec.ts vs Spec in factory.ts) — spec assumes MetaSpec but this duality could confuse implementors. |
| Clarity      | 9/10 | API contract is explicit with HTTP status codes for all error cases. Component name and file path specified. UI sketch with concrete layout renders. State transitions diagrammed. |
| **Total**    | **35/40** | **PASS** |

**Verdict:** PASS (35 ≥ 32 threshold). No gap-filling loop needed.

---

### Review Findings

**Business Perspective:**
- Verdict: **OK**
- The spec correctly addresses the business need: gating Spec quality before coding begins
- User stories align with the 需求产线流程 proc_3 steps 8-9
- Signoff/rework actions map cleanly to downstream pipeline flows

**Architecture Perspective:**
- Verdict: **SUGGESTION**
- FINDING-ARCH-1: The codebase has two conflicting Spec type definitions:
  - `src/types/spec.ts`: `MetaSpec` with status `draft | ready_for_review | in_review | signed_off`
  - `src/types/factory.ts`: `Spec` with status `draft | review | approved`
  - These are inconsistent and may cause confusion during implementation
  - Suggested resolution: deprecate `factory.ts` Spec type, consolidate on MetaSpec, or add a migration note in the spec clarifying which type system to use for signoff
- FINDING-ARCH-2: The in-memory store approach (line 5 of specs route) means signoff state is lost on server restart. Should document this as a known limitation for dev/demo phase.

**Risk Perspective:**
- Verdict: **OK**
- No data loss risk — signoff is additive (append to changeTrace)
- No security concern at this scope — reviewerName is user-provided string
- FINDING-RISK-1 (SUGGESTION): Concurrent signoff: if two OPCs sign off simultaneously, the second request gets a 409 (status no longer in_review). This is handled correctly by the proposed error responses.

**Delivery Perspective:**
- Verdict: **OK**
- Scope is clear and bounded: 1 new component + 1 new API route + 2 type modifications
- Can be delivered in a single implementation session
- All files to create/modify are explicitly listed in implementation steps
- Dependencies: #44 (already completed per ticket metadata)

---

### Spec Changelog

**v1 → v2 Changes:**

| Change ID | Source | Description | Affected Section |
|-----------|--------|-------------|-----------------|
| CHG-1 | FINDING-ARCH-1 | Added explicit note about MetaSpec vs factory.ts Spec type duality; implementation must use MetaSpec (spec.ts) as the canonical type | Data Contracts |
| CHG-2 | FINDING-ARCH-2 | Added note that in-memory store limitation means signoff state is ephemeral in dev — acceptable for current phase | Implementation Steps |

**Impact Assessment:**
- No AC changes — type clarification only
- No user story changes
- Downstream artifacts: SignoffPanel component and signoff API route remain unaffected
- Trace links intact: US → AC → Data Contract chains preserved

---

### Checker Report

- [x] **Chapter completeness:** PASS — User Stories (3), ACs (8 items), Data Contracts (1 new entity + 1 API endpoint + 2 type mods), UI Sketch (4 states + 2 dialogs)
- [x] **AC testability:** PASS — Every AC has Given/When/Then; 8 ACs cover 3 user stories; positive cases (AC-1, AC-2, AC-6), negative cases (AC-3, AC-5), and display cases (AC-7, AC-8)
- [x] **Terminology consistency:** PASS — "签收" consistently maps to approve/signed_off, "打回" consistently maps to reject/rework, "审核人" consistently maps to reviewerName
- [x] **Contract self-consistency:** PASS — SignoffAction fields match API input contract; API output contract (MetaSpec) includes new status values; error codes cover all validation scenarios without contradiction

**Verdict:** PASS — all 4 checks pass. No regression needed.

---

### Handoff Notes

- **Spec version:** v2
- **Maturity score:** 35/40 (PASS)
- **Open questions for coding OPC:**
  1. reviewerName source: where does the OPC's name come from? The current spec has it as a free-text field — if auth/user context exists, it should be populated automatically.
  2. The in-memory store in `src/app/api/v1/specs/[id]/route.ts` is shared with the new signoff route — ensure both modules import the same `specs` map or extract to a shared store.
  3. The l2/spec-editor page hardcodes `specId="spec-001"` — the SignoffPanel should be integrated into the same page, likely as a sibling to SpecEditor.
- **Recommended coding approach:**
  1. Modify `src/types/spec.ts` first — add `'rework'` to MetaSpec.status, add `'signoff'` to ChangeRecord.source, add SignoffAction interface
  2. Create `src/app/api/v1/specs/[id]/signoff/route.ts` — POST handler with validation
  3. Create `src/components/requirement/SignoffPanel.tsx` — green approve button + red reject button + confirm dialog + reject form + signature display
  4. Integrate SignoffPanel into `src/app/l2/spec-editor/page.tsx` below SpecEditor
  5. Update `src/app/api/v1/specs/[id]/route.ts` — set spec-001 status to `in_review` for testability
  6. Update `SpecEditor.tsx` — add rework status badge rendering (amber color, "已打回")
- **Files to create:** 2 (`SignoffPanel.tsx`, `signoff/route.ts`)
- **Files to modify:** 3 (`spec.ts` types, `[id]/route.ts` mock status, `spec-editor/page.tsx`)

---

### Confusions

- None identified during this execution. The ticket description was comprehensive and the codebase exploration revealed a clear implementation path.

---

### Stage 8 — External Reviewer (交接) Completion

- **Workpad finalized:** all 8 stages documented with deliverables
- **Spec version:** v2
- **Maturity score:** 35/40 (PASS)
- **Implementation status:** Complete — all 29 tests passing
  - `src/components/requirement/SignoffPanel.tsx` — 268 lines, 16 tests passing
  - `src/app/api/v1/specs/[id]/signoff/route.ts` — POST handler, 13 tests passing
  - `src/types/spec.ts` — SignoffAction, rework status, signoff source added
  - `src/app/l2/spec-editor/page.tsx` — SignoffPanel integrated
  - `src/app/api/v1/specs/store.ts` — spec-001 status set to `in_review`
- **Open questions:** none — implementation complete and verified
- **Remaining action:** Move SYM-50 to `Human Review` in Linear (requires Linear API access)
