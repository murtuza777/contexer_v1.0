# 🎯 Visual Observer (VO)

## Overview

Visual Observer validates user stories against a live preview of your app. It sends acceptance criteria to a backend Playwright runner which opens the app (e.g. Vite on 5173) and performs action/expectation checks. Results are shown in WeIde with pass/fail, confidence, screenshots, and a downloadable report suitable for a future assistant ("Viber").

## What’s built today

- Backend Playwright validator (`/api/visual-observer/validate`) that returns real pass/fail and confidence.
- Frontend VO UI in WeIde with:
  - Live progress, per-story status, selection and details view.
  - Backend health indicator; Start is disabled if backend is down.
  - Run summary (passed/partial/failed) and result browsing.
  - Report generation after a run: JSON (machine‑readable) and Markdown (human‑readable).
  - Download buttons for JSON and Markdown reports.
- CORS and OPTIONS on related API routes to avoid preflight issues.
- Temporary autosave guard to avoid spamming the backend when it’s down (removable later).

## Intended use case (for Viber)

- VO produces a structured report containing story-by-story, criteria-level results with confidence. This can be provided to a troubleshooting assistant (Viber, future) to:
  - Identify failed criteria and likely causes.
  - Prioritize fixes based on counts and confidence.
  - Track progress across iterations.

## Architecture (high level)

Frontend (WeIde):
- `src/components/WeIde/components/VisualObserver/index.tsx` – main VO UI (run, summary, report generation/download)
- `ValidationPanel.tsx` – detailed results for a selected story
- `TestRunner.tsx` – start/stop controls and progress
- `ScreenshotViewer.tsx` – modal for screenshots (if present)
- `services/visualObserverApi.ts` – calls the backend validator

Backend (Next.js API):
- `src/app/api/visual-observer/validate/route.ts`
  - Uses Playwright Chromium to visit the provided `projectUrl`
  - Maps acceptance criteria to actions via `utils/visual-observer/storyMapper`
  - Returns per-criteria and overall results, confidence, and optional screenshots

## How it works

1) VO detects a likely preview URL (e.g. `http://localhost:5173`).
2) You click Start Validation; VO calls `POST /api/visual-observer/validate` for each story.
3) Backend runs real Playwright actions/expectations and responds with pass/fail + confidence.
4) UI aggregates results, shows a run summary, and generates exportable reports.

## Usage

Prereqs:
- Backend running on `http://localhost:3000` (Next.js dev).
- Frontend running on `http://localhost:5173` (Vite dev) or your actual preview URL.
- Playwright Chromium installed in the backend project:
  - In `apps/contexer-dev-backend`: `pnpm install` then `npx playwright install chromium`

Steps:
1. Open WeIde → Visual Observer.
2. Ensure Backend Available indicator is green.
3. Click Start Validation to run all stories (or Test/View per story).
4. After completion, click Generate Report, then Download JSON/Markdown.

## Report format (for Viber)

JSON (example):
```json
{
  "projectId": "<uuid>",
  "projectName": "My Project",
  "targetUrl": "http://localhost:5173",
  "generatedAt": "2025-09-08T12:34:56.000Z",
  "summary": {
    "totalStories": 17,
    "passed": 9,
    "failed": 5,
    "partial": 3,
    "avgConfidence": 0.76
  },
  "stories": [
    {
      "id": "story-1",
      "description": "As a user, I can log in",
      "criteriaCount": 3,
      "status": "failed",
      "confidence": 0.5,
      "criteria": [
        { "criteria": "Login button visible", "status": "passed", "confidence": 0.9 },
        { "criteria": "Submitting invalid shows error", "status": "failed", "confidence": 0.3, "error": "Expected text 'Invalid' not found" }
      ]
    }
  ]
}
```

Markdown includes the same data summarized for humans (story list, statuses, confidences, notable errors).

## Troubleshooting / FAQ

- Backend 500/CORS: We added OPTIONS + CORS on project routes and VO routes. If you still see CORS, reload both apps and retry.
- Do I need Playwright in the frontend (WeIde)? No. Only install it in the backend.
- Start button disabled? Backend health check failed; start backend on port 3000 and try again.
- Autosave spam: We temporarily guard project autosaves by pinging `/api/test`; if unhealthy, network calls are skipped quietly.

## Limitations and next steps

- VO provides real validation and structured reports. “Viber” (auto-fixer) is not implemented yet.
- Next steps when Viber is available:
  - Ingest VO’s JSON report
  - Suggest/execute code edits for failed criteria
  - Re-run VO and iterate until pass

---

Visual Observer is now ready to validate real user stories and produce reports suitable for automated follow-up by a future assistant.
