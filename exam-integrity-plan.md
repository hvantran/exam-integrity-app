# Exam Integrity Engine — Implementation Plan

> **Status legend**  
> `[ ]` Not started · `[~]` In progress · `[x]` Complete · `[!]` Blocked

> **⚠️ Scope note**  
> **Security (Spring Security / Keycloak / JWT) and API Gateway are explicitly deferred.**  
> The immediate goal is to get FE ↔ BE working end-to-end with no auth middleware in the way.  
> All auth-related tasks are tagged `[DEFERRED]` and must **not** be started until the core  
> flows are verified working. CORS on the backend uses a permissive dev config for now.

---

## Architecture Overview

```
exam-integrity-ui (React 18 + MUI v6)
       │  REST / WebSocket (STOMP)  ← plain HTTP, no Bearer token for now
       ▼
exam-integrity-backend (Spring Boot 3)
       │  Kafka  ──▶  scoring-worker (Python / FastAPI)
       │  Kafka  ──▶  proctor alert pipeline
       │  HTTP   ──▶  pdf-ingestion-service (Python / FastAPI)
       │  MongoDB (exams, drafts, sessions, questions, scores)
       │  Redis  (timer TTL, session cache)
       │
       ╳  Keycloak — DEFERRED (no security filter chain active in dev)
```

### OpenAPI Contract
The single source of truth is **`openapi.yaml`** at `services/exam-integrity-app/openapi.yaml`.

FE TypeScript types and API clients **must be generated** from this file:

```bash
# Install generator (once)
yarn add -D @openapitools/openapi-generator-cli

# Regenerate (run after any openapi.yaml change)
npx openapi-generator-cli generate \
  -i ../openapi.yaml \
  -g typescript-axios \
  -o src/generated/api \
  --additional-properties=useSingleRequestParameter=true,supportsES6=true
```

Generated output: `src/generated/api/` — **do not hand-edit these files**.

---

## FE Layer Convention

```
src/
  generated/api/          ← auto-generated Axios clients + DTOs (openapi-generator)
  services/               ← thin wrappers: map generated clients to domain models
  hooks/                  ← React Query hooks, WebSocket hooks (useQuery / useMutation)
  repositories/           ← optional caching / offline layer (if needed)
  components/             ← atomic design (atoms / molecules / organisms / templates)
  pages/                  ← route-level components (wire hooks → templates)
  design-system/          ← tokens, theme
  auth/                   ← DEFERRED — add only after core flows verified
```

### Service layer rule
Each service file wraps **one** generated API client, adds error normalisation, and exposes typed functions — no Axios calls from hooks or components directly.  
**No auth headers for now** — the generated Axios client base URL comes from `REACT_APP_API_BASE_URL` only.

### Hook layer rule
All data fetching uses **React Query** (`@tanstack/react-query`). Hooks call service functions only.  
All mutations return `{ mutate, isPending, error }` — templates receive these as props.  
Use `isLoading` from query result to drive the `isLoading` prop already wired in templates.

---

## Task Board

### EPIC 1 — FE Foundation

| # | Task | Owner | Status | Done when |
|---|------|-------|--------|-----------|
| FE-01 | Install `openapi-generator-cli` and add `yarn gen:api` script to `package.json` | FE | `[x]`DONE | `src/generated/api/` present, `yarn gen:api` re-runs cleanly |
| FE-02 | Create `src/types/exam.types.ts` — re-export or extend generated DTOs with UI-only types | FE | `[x]`DONE | `TS` compiles with 0 errors on `QuestionType`, `ReviewDashboard`, etc. |
| FE-03 | Create `src/services/examService.ts` — wraps `ExamsApi` (listExams, getExam) | FE | `[x]`DONE | Unit test: mock axios, assert mapped response shape |
| FE-04 | Create `src/services/draftService.ts` — wraps `ExamDraftApi` (listDrafts, getDraft, editQuestion, addQuestion, publishDraft, rejectDraft) | FE | `[x]`DONE | Unit test per method |
| FE-05 | Create `src/services/sessionService.ts` — wraps `ExamSessionApi` (createSession, getSession, getTimer, getQuestion, saveAnswer, submitExam, getReviewDashboard) | FE | `[x]`DONE | Unit test per method |
| FE-06 | Create `src/services/questionBankService.ts` — wraps `QuestionBankApi` (searchQuestionBank) | FE | `[x]`DONE | Unit test |
| FE-07 | Create `src/services/proctorService.ts` — wraps `ProctorApi` (reportEvent) | FE | `[x]`DONE | Unit test |
| FE-08 | Install React Query, create `src/hooks/useExams.ts` (`useExamList`, `useExam`) | FE | `[x]`DONE | `isLoading` / `data` / `error` correctly exposed |
| FE-09 | Create `src/hooks/useDraft.ts` (`useDraftList`, `useDraft`, `useEditQuestion`, `usePublishDraft`) | FE | `[x]`DONE | Mutation invalidates cache on success |
| FE-10 | Create `src/hooks/useSession.ts` (`useCreateSession`, `useSession`, `useQuestion`, `useSaveAnswer`, `useSubmitExam`) | FE | `[x]`DONE | `useSubmitExam` redirects to `/review/{sessionId}` on 202 |
| FE-11 | Create `src/hooks/useReviewDashboard.ts` — polls `GET /api/sessions/{sessionId}/review` every 2 s until no `PENDING_ESSAY` score | FE | `[x]`DONE | Polling stops when scoring complete |
| FE-12 | Create `src/hooks/useWebSocketTimer.ts` — STOMP subscribe to `/topic/session/{sessionId}`, fallback to REST poll on disconnect | FE | `[x]`DONE | Timer ticks in `StudentManTimerDisplay`; force-submit event triggers `useSubmitExam` |
| FE-13 | Create `src/hooks/useProctor.ts` — attach `window.blur/focus`, `copy`, `contextmenu`, `fullscreenchange` listeners and call `proctorService.reportEvent` | FE | `[x]`DONE | No direct DOM listeners outside this hook |
| FE-14 | Create `src/pages/ExamPage.tsx` — wires `useSession`, `useQuestion`, `useSaveAnswer`, `useSubmitExam`, `useWebSocketTimer`, `useProctor` → `StudentManExamLayout` | FE | `[x]`DONE | Page renders with real session data; submit nav works |
| FE-15 | Create `src/pages/ReviewPage.tsx` — wires `useReviewDashboard` → `StudentManReviewLayout` | FE | `[x]`DONE | Skeleton shown while polling; results render on complete |
| FE-16 | Create `src/pages/LandingPage.tsx` — wires `useExamList` → `StudentManLandingLayout` | FE | `[x]`DONE | Filter by tags works |
| FE-17 | Create `src/pages/IngestionPage.tsx` — wires `useDraftList` + upload mutation → `TeacherManIngestionLayout` | FE | `[x]`DONE | PDF upload shows `isLoading` skeleton; list refreshes on complete |
| FE-18 | Create `src/pages/QuestionReviewPage.tsx` — wires `useDraft`, `useEditQuestion` → `TeacherManQuestionReviewLayout` | FE | `[x]`DONE | Save/approve/exclude per question works |
| FE-19 | Create `src/pages/QuestionBankPage.tsx` — wires `useQuestionBank` → `TeacherManQuestionBankLayout` | FE | `[x]`DONE | Search, type filter, tag filter work |
| FE-20 | Create `src/pages/FinalPublicationPage.tsx` — wires `usePublishDraft` → `TeacherManFinalPublicationLayout` | FE | `[x]`DONE | Publish calls `POST /api/drafts/{draftId}/publish`; nav to ingestion list on success |
| FE-21 | Add React Router routes for all pages in `App.tsx` | FE | `[x]`DONE | All routes resolve without 404 in dev server |
| FE-22 | **[DEFERRED]** Add Keycloak JS adapter (`keycloak-js`), `AuthProvider`, `useAuth`; inject Bearer token via Axios request interceptor | FE | `[DEFERRED]` | Start only after all FE-BE flows verified working |
| FE-23 | Create `src/repositories/draftRepository.ts` — local React Query cache accessor for draft data (reuse cached draft, avoid redundant fetches) | FE | `[x]`DONE | `useDraft` reads from cache before network |

---

### EPIC 1b — BE: Dev CORS & Security Permissive Config

| # | Task | Owner | Status | Done when |
|---|------|-------|--------|-----------|
| BE-00 | Disable Spring Security filter chain for dev profile — `SecurityConfig` sets `.authorizeHttpRequests(r -> r.anyRequest().permitAll())` and `.csrf(csrf -> csrf.disable())` | BE | `[x]` | `curl http://localhost:8090/exam-integrity-backend/api/exams` returns 200 without any token |
| BE-00b | Add permissive CORS config for dev — allow `http://localhost:3000` on all methods/headers | BE | `[x]` | Browser FE on port 3000 can call BE on port 8090 without CORS error |

---

### EPIC 2 — BE: Exam Draft Workflow

| # | Task | Owner | Status | Done when |
|---|------|-------|--------|-----------|
| BE-01 | `ExamDraftController.uploadPdf` — call `pdf-ingestion-service` via `WebClient`, map `IngestionResponse` → `ExamDraft`, save via `ExamDraftRepository` | BE | `[x]` | Integration test: POST multipart, assert `201` + `draftId` in body |
| BE-02 | `ExamDraftController.listDrafts` — query `ExamDraftRepository.findByStatus`; teacher identity filter deferred until auth is active | BE | `[x]` | Returns filtered list; empty list → `[]` not `null` |
| BE-03 | `ExamDraftController.getDraft` — fetch full draft, transition `PENDING_REVIEW → UNDER_REVIEW`, return `ExamDraftFullDTO`; multi-teacher lock check deferred until auth active | BE | `[x]` | Draft transitions to `UNDER_REVIEW` on first `GET` |
| BE-04 | `ExamDraftController.editQuestion` — patch `DraftQuestion` fields, set `reviewStatus`, persist | BE | `[x]` | `204`; version-check to prevent stale write (`409`) |
| BE-05 | `ExamDraftController.removeQuestion` — delete question, re-sequence `questionNumber` on remaining | BE | `[x]` | Re-sequence verified in unit test |
| BE-06 | `ExamDraftController.addQuestion` — from bank (copy) or inline, insert at `position`, re-sequence | BE | `[x]` | `201` with new `DraftQuestionDTO`; position insert tested |
| BE-07 | `ExamDraftController.publishDraft` — validate (≥1 approved, essay rubric present), create `Exam`, copy questions to bank (dedup by SHA-256), set `ExamDraft.status=APPROVED` | BE | `[x]` | `400` on missing rubric; bank dedup tested |
| BE-08 | `ExamDraftController.rejectDraft` — set status `REJECTED`, persist reason | BE | `[x]` | `409` when already `APPROVED` |
| BE-09 | Add `ExamDraftService` — extract all draft business logic out of controllers | BE | `[x]` | Controllers thin (≤20 LOC each); service unit-tested |
| BE-10 | Add `QuestionBankController` + `QuestionBankService` — `GET /api/questions` paginated with `q`, `type`, `tags` filters using MongoDB text index | BE | `[x]` | Query with `type=MCQ&tags=toan` returns typed results |

---

### EPIC 3 — BE: Session & Scoring Workflow

| # | Task | Owner | Status | Done when |
|---|------|-------|--------|-----------|
| BE-11 | `SessionController.createSession` — call `SessionService.createSession`, return `SessionDTO` with `remainingSeconds` | BE | `[x]` | `409` when student already has `ACTIVE` session |
| BE-12 | `SessionController.getSession` — read session + Redis TTL | BE | `[x]` | Returns `remainingSeconds=0` after TTL expiry |
| BE-13 | `SessionController.getTimer` — REST fallback for remaining seconds | BE | `[x]` | Returns `long` value from Redis `PTTL` |
| BE-14 | `SessionController.getQuestion` — verify session `ACTIVE` (no auth check needed yet), return `QuestionSummaryDTO` (no `correctAnswer`) | BE | `[x]` | `403` on non-ACTIVE session; `correctAnswer` never in response |
| BE-15 | `SessionController.saveAnswer` — upsert `ExamSession.answers` map | BE | `[x]` | `403` after submission; idempotent (repeat PATCH = `204`) |
| BE-16 | `SessionController.submitExam` — set `SUBMITTED`, publish `exam.submitted` Kafka event, return `202` | BE | `[x]` | `409` on double-submit |
| BE-17 | `ScoringOrchestratorService.handleExamSubmitted` — iterate answers: MCQ → `scoreMcq` → save; Essay → emit `scoring.request` Kafka event | BE | `[x]`DONE | MCQ scores persisted; essay events emitted |
| BE-18 | `ScoringOrchestratorService.scoreMcq` — implement correct/incorrect logic, handle blank/null answers | BE | `[x]`DONE | Unit test: correct, incorrect, blank, multi-answer |
| BE-19 | `ScoringOrchestratorService` listen `scoring.result` topic — persist essay scores, compute `finalScore10`, update session | BE | `[x]`DONE | `getReviewDashboard` returns 200 (not 202) after all scores received |
| BE-20 | `SessionController.getReviewDashboard` — map scores + questions to `ReviewDashboardDTO`; `202` while `PENDING_ESSAY` scores exist | BE | `[x]`DONE | Polling contract matches OpenAPI spec |
| BE-21 | `TimerBroadcastScheduler` — 1-second STOMP tick to `/topic/session/{sessionId}`; force-submit when TTL hits 0 | BE | `[x]`DONE | Client receives ticks; expired session auto-submits |

---

### EPIC 4 — BE: Proctoring

| # | Task | Owner | Status | Done when |
|---|------|-------|--------|-----------|
| BE-22 | `ProctorController.reportEvent` — validate `eventType`, publish to `proctor.alert` Kafka topic | BE | `[x]`DONE | `202` returned; Kafka message confirmed in integration test |
| BE-23 | Proctoring consumer (new `ProctorScoringService`) — accumulate `riskScore` per session, set `status=FLAGGED` when `>= 70` | BE | `[x]`DONE | Flagged session visible in teacher proctor view |

---

### EPIC 5 — Python Services

| # | Task | Owner | Status | Done when |
|---|------|-------|--------|-----------|
| PY-01 | `pdf-ingestion-service`: complete `question_parser.py` — detect MCQ / ESSAY_SHORT / ESSAY_LONG, extract `options`, `correctAnswer`, `points` from normalised text | PY | `[x]` | Tested against 3 sample PDFs: pass rate ≥ 90% on MCQ |
| PY-02 | `pdf-ingestion-service`: `exam_set_detector.py` — detect multiple "MA DE" blocks, return set count and boundaries | PY | `[x]` | Multi-set PDF correctly splits into N parsed exams |
| PY-03 | `pdf-ingestion-service`: `ocr_pipeline.py` — PaddleOCR integration, per-page confidence, output `rawText` + `ocrConfidence` | PY | `[x]` | Scanned PDF produces `ocrConfidence >= 0.7` on clean scan |
| PY-04 | `scoring-worker`: `keyword_scorer.py` — Vietnamese keyword matching, partial credit | PY | `[x]`DONE | Unit tests: full match, partial, zero |
| PY-05 | `scoring-worker`: `essay_scorer.py` — aggregate: keyword 35%, steps 25%, finalAnswer 20%, semantic 15%, format 5% | PY | `[x]` | Score formula verified against rubric fixture |
| PY-06 | `scoring-worker`: `semantic_scorer.py` — sentence-transformers cosine similarity for Vietnamese answers | PY | `[x]` | Semantic similarity > 0.8 for paraphrased correct answer |
| PY-07 | `scoring-worker`: `kafka_consumer.py` — consume `scoring.request`, run scoring pipeline, publish `scoring.result` | PY | `[x]`DONE | End-to-end: submit → Kafka → score → result persisted |

---

### EPIC 6 — Infrastructure & Quality

| # | Task | Owner | Status | Done when |
|---|------|-------|--------|-----------|
| INF-01 | Add `docker-compose.yml` at `exam-integrity-app/` root — MongoDB, Redis, Kafka, **all 3 services** (no Keycloak yet) | INF | `[x]`DONE | `docker compose up` brings up full stack; health checks green at `GET /health` on each service |
| INF-02 | BE: add `spring-boot-testcontainers` for MongoDB + Redis + Kafka in integration tests | BE | `[ ]` | All integration tests green in CI without external deps |
| INF-03 | FE: configure `msw` (Mock Service Worker) using `openapi.yaml` for Storybook and Vitest | FE | `[ ]` | All template stories work offline with mocked API responses |
| INF-04 | FE: add Vitest + React Testing Library, write smoke tests for each page component | FE | `[ ]` | `yarn test` green; coverage ≥ 80% on hooks and services |
| INF-05 | FE: add `.env.development` with `REACT_APP_API_BASE_URL=http://localhost:8090/exam-integrity-backend`, `REACT_APP_WS_URL=ws://localhost:8090/exam-integrity-backend` | FE | `[x]`DONE | No hard-coded URLs remain in source; no Keycloak env vars needed yet |
| INF-06 | BE: externalize `application.yml` — MongoDB URI, Redis URI, Kafka bootstrap, pdf-ingestion URL via env vars (no Keycloak props for now) | BE | `[x]`DONE | No hard-coded URIs in source |
| INF-07 | **[DEFERRED]** Add Keycloak to docker-compose; re-enable `SecurityConfig`; inject Bearer token in FE | INF | `[DEFERRED]` | Start only after all FE-BE flows verified with `docker compose up` |

---

## Sequence Diagrams (Quick Reference)

### Student Exam Flow
```
LandingPage → GET /api/exams
           → POST /api/sessions?examId=&studentId=
           → WS subscribe /topic/session/{id}          (timer ticks)
           → GET /api/sessions/{id}/questions/N        (per question)
           → PATCH /api/sessions/{id}/answers/{qId}    (auto-save)
           → POST /api/sessions/{id}/submit
           → poll GET /api/sessions/{id}/review (2 s)
           → render ReviewDashboard when no PENDING_ESSAY
```

### Teacher Draft Flow
```
IngestionPage  → POST /api/drafts  (multipart PDF)
               → GET  /api/drafts  (list)
QuestionReview → GET  /api/drafts/{id}  (opens, locks to UNDER_REVIEW)
               → PATCH /api/drafts/{id}/questions/{qId}
               → DELETE /api/drafts/{id}/questions/{qId} + POST (replace from bank)
QuestionBank   → GET /api/questions?type=MCQ&tags=toan
FinalPub       → POST /api/drafts/{id}/publish  → Exam created
```

---

## FE File Structure (Target)

```
src/
  generated/
    api/                        ← FE-01 (openapi-generator output)
  types/
    exam.types.ts               ← FE-02
  services/
    examService.ts              ← FE-03
    draftService.ts             ← FE-04
    sessionService.ts           ← FE-05
    questionBankService.ts      ← FE-06
    proctorService.ts           ← FE-07
  hooks/
    useExams.ts                 ← FE-08
    useDraft.ts                 ← FE-09
    useSession.ts               ← FE-10
    useReviewDashboard.ts       ← FE-11
    useWebSocketTimer.ts        ← FE-12
    useProctor.ts               ← FE-13
  repositories/
    draftRepository.ts          ← FE-23
  auth/                         ← FE-22 [DEFERRED — do not create yet]
  pages/
    ExamPage.tsx                ← FE-14
    ReviewPage.tsx              ← FE-15
    LandingPage.tsx             ← FE-16
    IngestionPage.tsx           ← FE-17
    QuestionReviewPage.tsx      ← FE-18
    QuestionBankPage.tsx        ← FE-19
    FinalPublicationPage.tsx    ← FE-20
  components/                   ← ✅ COMPLETE (atomic design done)
  design-system/                ← ✅ COMPLETE
  App.tsx                       ← FE-21
```

---

## Pre-existing Errors (Known — Do Not Re-introduce)

| File | Error | Action |
|---|---|---|
| `molecules/CorrectionCard/CorrectionCard.tsx` | `shadow.sm` not on token type | Fix token type in `design-system/tokens.ts` when touching shadow tokens |
| `organisms/ReviewDashboard.tsx` | `shadow.md` not on token type | Same as above |
| `organisms/StudentManQuestionPanel.stories.tsx` | `'ESSAY'` not assignable to `QuestionType` | Fix when `exam.types.ts` (FE-02) is created |
