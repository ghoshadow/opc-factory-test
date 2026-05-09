## Claude Workpad — SYM-48: Gap Agent 追问界面

```text
SYM-48 @ 5313607
```

### Discovery Notes (Stage 1)

- **Actors:** OPC (Operator), Gap Agent (auto-generates questions), Maturity Judge (scorer)
- **Key Concepts:** Gap Question, Gap Answer, Re-scoring, Maturity Threshold
- **Trigger:** Maturity Judge score < threshold → Gap Agent auto-generates questions
- **Flow:** OPC views questions → answers each → submits all → re-scoring triggers
- **Data:** GET/POST `/api/v1/specs/:id/gap-answers`, GapQuestion (severity: critical/major/minor), GapAnswer, GapSubmitResponse
- **Existing Code:** `GapQuestions.tsx` (335 lines, fully implemented), API route with mock data, types defined in `requirement.ts`

### Meta-Spec (Stage 2)

**Spec ID:** `spec-gap-questions` | **Version:** 2

**User Stories:**
- US-01: View Gap Questions (OPC navigates to page, sees auto-generated question list with severity)
- US-02: Answer Gap Questions (OPC types text responses into individual answer fields)
- US-03: Submit Answers and Trigger Re-scoring (OPC clicks submit, API POSTs answers, Maturity Judge re-scores)
- US-04: Retry After Failed Re-scoring (OPC reviews result, modifies answers, resubmits)

**Acceptance Criteria (10):**
- AC-01: Gap question list viewable (number, severity, description, hint, textarea)
- AC-02: Empty state when no gaps (checkmark + "无需补充")
- AC-03: Loading skeleton during fetch (4 animated cards)
- AC-04: Error state on fetch failure (warning + "加载失败")
- AC-05: Answer text input editable (char count, progress update)
- AC-06: Progress bar + "X/Y 已回答" counter
- AC-07: Submit disabled until all answered
- AC-08: POST answers → result banner (green pass / amber fail)
- AC-09: Retry button on fail (resets to question view with preserved answers)
- AC-10: Submit loading state (spinner + "提交中...")

**Data Contracts:**
- GapQuestion: { id, number, description, severity, hint }
- GapAnswer: { questionId, answer }
- GapAnswersResponse: { questions: GapQuestion[] }
- GapSubmitResponse: { newScore, threshold, passed, message }
- GapSeverity enum: "critical" | "major" | "minor"

**UI Sketch:** See workpad — ASCII wireframe with severity color bars (red/amber/blue)

### Maturity Scorecard (Stage 3)

| Dimension | Score | Notes |
|-----------|-------|-------|
| Completeness | 8/10 | All core sections present. Missing: error response schemas, accessibility requirements. |
| Testability  | 9/10 | All 10 ACs have verifiable Given/When/Then. |
| Consistency  | 9/10 | US→AC mapping clean, data contracts align with API. |
| Clarity      | 8/10 | Implementable. Missing: Maturity Judge integration point specification. |
| **Total**    | **34/40** | PASS |

### Gap Report (Stage 4)

**SKIPPED** — Maturity score 34/40 ≥ 32 threshold. No gaps to fill.

### Review Findings (Stage 5)

- **Business:** B-01 (SUGGESTION) — post-PASS navigation not specified; B-02 (OK) — US align with business goal; B-03 (SUGGESTION) — no skip/defer option
- **Architecture:** A-01 (SUGGESTION, downgraded from BLOCKER) — hardcoded specId follows existing codebase pattern; A-02 (OK) — API follows RESTful conventions; A-03 (SUGGESTION) — SWR mutate optimization optional
- **Risk:** R-01 (SUGGESTION) — server-side questionId validation; R-02 (SUGGESTION) — rate limiting; R-03 (OK) — no PII/sensitive data
- **Delivery:** D-01 (OK) — well-bounded scope; D-02 (SUGGESTION) — no automated tests; D-03 (OK) — uses existing design system

### Spec Changelog (Stage 6)

v1 → v2:
1. A-01 addressed: hardcoded specId acknowledged as existing convention, dynamic routing deferred
2. B-01 added: post-PASS navigation note (future enhancement)
3. D-02 deferred: test coverage as follow-up task
4. A-03, B-03, R-01, R-02: explicitly rejected with reasoning (premature optimization or out of scope)

### Checker Report (Stage 7)

- [x] Chapter completeness: PASS — all 4 sections present in Meta-Spec v2
- [x] AC testability: PASS — all 10 ACs use verifiable Given/When/Then
- [x] Terminology consistency: PASS — consistent across types, component, API, spec
- [x] Contract self-consistency: PASS — no conflicting field definitions

### Handoff Notes (Stage 8)

- **Spec version:** v2
- **Maturity score:** 34/40 (PASS)
- **Build status:** PASS (TypeScript + Next.js build clean)
- **Open questions for coding OPC:**
  1. When should dynamic `[specId]` routing be implemented? (currently uses `specId="spec-001"` consistent with all L2 pages)
  2. Post-PASS navigation: should the page redirect to the spec editor or maturity page, or stay with the banner?
  3. Test coverage: add component tests as a follow-up task?
- **Recommended coding approach:**
  - The GapQuestions component is self-contained with loading/error/empty/success states
  - It can be embedded in any page that has a specId
  - The API routes have mock data — productionize when a database layer is added
  - The component uses SWR for fetching and local useState for answers — no global state dependency

### Confusions

- The 8-stage requirement pipeline is a meta-process for producing spec documentation. Since the UI component was already built in a previous attempt, stages 1-7 produced documentation that validated the existing implementation rather than driving new code.
- Linear interaction (posting workpad comment, moving to Human Review) is pending — Linear CLI/API access was not available in this session.
