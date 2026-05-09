# Claude Workpad — SYM-50

```text
SYM-50:/Users/link/code/symphony-workspaces/SYM-50@760837a
```

## Discovery Notes

- **Actor**: 需求产线 OPC (requirement pipeline operator)
- **Core Action 1 — Signoff (签收)**: OPC reviews final Spec → confirms → status changes to `signed_off` → flows to coding pipeline
- **Core Action 2 — Reject (打回)**: OPC reviews final Spec → fills mandatory reason → status changes to `rework` → flows back to requirement pipeline
- **Audit Trail**: Every signoff action records reviewer name, timestamp, action type, and optional comment
- **API Contract**: `POST /api/v1/specs/:id/signoff` with `SignoffAction` body
- **UI Contract**: Green approve button (with confirmation dialog), red reject button (with mandatory reason form), signature info display for completed actions
- **State Machine**: `in_review` → `signed_off` (approve) | `rework` (reject)

## Meta-Spec v1

### User Story
As a 需求产线 OPC (Requirement Pipeline Operator), I want to review and sign-off on a finalized Spec so that it can be formally handed off to the coding pipeline or returned for revision.

### Acceptance Criteria

| ID | Given | When | Then |
|----|-------|------|------|
| AC-1 | Spec is in `in_review` status | OPC clicks "签收" and confirms | Spec status → `signed_off`, ChangeRecord appended |
| AC-2 | Spec is in `in_review` status | OPC clicks "打回", fills reason, confirms | Spec status → `rework`, rejection reason recorded |
| AC-3 | Spec is NOT in `in_review` status | Page renders | SignoffPanel is hidden |
| AC-4 | Reject form is open, comment is empty | OPC views submit button | Button is disabled |
| AC-5 | Spec is `signed_off` or `rework` | Page renders | Signature info displayed (reviewer, time, result) |
| AC-6 | API returns error | After signoff attempt | Error message displayed in panel |

### Data Contracts

```ts
interface SignoffAction {
  action: 'approve' | 'reject'
  comment?: string  // 打回必填
  reviewerName: string
  timestamp: string
}

// MetaSpec status union extended with signoff states:
type SpecStatus = 'draft' | 'ready_for_review' | 'in_review' | 'signed_off' | 'rework'

interface ChangeRecord {
  source: 'review_board' | 'gap_agent' | 'revision_engine' | 'signoff'
  timestamp: string
  description: string
  versionFrom: number
  versionTo: number
}
```

### UX Sketch
- Panel layout: header "签收审核" → action buttons (in_review) → confirm/reject forms → signature display (signed_off/rework)
- Approve button: emerald green, with confirm dialog ("确认签收 Spec X？签收后将流转至编码产线，无法撤回。")
- Reject button: red, expands to show textarea (required) + submit button
- Signed-off display: emerald border, shows reviewer name + timestamp
- Rework display: red border, shows reviewer name, timestamp, AND rejection reason

## Maturity Scorecard

| Dimension | Score | Notes |
|-----------|-------|-------|
| Completeness | 9/10 | All spec sections filled. UX sketch implicit in code but documented here |
| Testability  | 10/10 | All 6 ACs verified by 16 component tests + 13 route tests |
| Consistency  | 10/10 | Status transitions well-defined, no contradictions |
| Clarity      | 9/10 | Developer can implement directly. Proven by existing implementation |
| **Total**    | **38/40** | **PASS** |

**Verdict: PASS** (≥ 32). No Gap Agent iteration required.

## Review Findings

- **Business**: OK — Solves the correct problem: formal signoff gate before handoff to coding pipeline
- **Architecture**: OK — API route fits existing patterns (`/api/v1/specs/[id]/signoff`), in-memory store used consistently, component follows SWR + fetch pattern
- **Risk**: SUGGESTION — In-memory store (`specs` object) loses data on server restart. Consider persistence layer for production (out of scope for this ticket)
- **Delivery**: OK — Scope clear and bounded. Delivered in one commit with 29 passing tests

No BLOCKERs found.

## Spec Changelog

v1 (initial) — No prior versions. All content derived from issue description and existing implementation.

## Checker Report

- [x] Chapter completeness: PASS — User Story, ACs (6 items), Data Contracts, UX Sketch all present
- [x] AC testability: PASS — Every AC has Given/When/Then and is verified by automated tests
- [x] Terminology consistency: PASS — "signoff", "签收", "打回", "rework" used consistently across types, route, and UI
- [x] Contract self-consistency: PASS — SignoffAction → MetaSpec.status → ChangeRecord chain is coherent

**Final Verdict: PASS** — Ready for handoff.

## Handoff Notes

- **Spec version**: v1
- **Maturity score**: 38/40
- **Open questions for coding OPC**: None — implementation already complete and verified
- **Implementation summary**:
  - `src/components/requirement/SignoffPanel.tsx` — UI component (268 lines)
  - `src/components/requirement/SignoffPanel.test.tsx` — 16 test cases
  - `src/app/api/v1/specs/[id]/signoff/route.ts` — API handler with full validation
  - `src/app/api/v1/specs/[id]/signoff/route.test.ts` — 13 test cases
  - `src/types/spec.ts` — SignoffAction interface, MetaSpec type extended
  - Integrated into `src/app/l2/spec-editor/page.tsx`
- **Test results**: 29/29 tests pass (16 component + 13 route)
- **Recommended coding approach**: SWR for data fetching, inline state machine for panel UI states, optimistic UI with error recovery

## Confusions

None — requirements were clear and implementation was straightforward.
