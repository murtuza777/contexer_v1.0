

## Contexer Agentic Plan (Viber, Visual Observer, Error Fixer, Context Composer)

The codebase already has a strong builder pipeline and in-browser/Electron execution. Below is a practical, incremental plan to add your four core features and migrate persistence to Supabase (PostgreSQL):

### 1) Viber — Autonomous Builder Agent
- Purpose: Orchestrate prompt sessions that iteratively build/repair features based on project context and live observations.
- Reuse: Builder mode pipeline at `apps/we-dev-next/src/app/api/chat/handlers/builderHandler.ts` and prompt builder in `apps/we-dev-next/src/app/api/chat/utils/promptBuilder.ts`.
- Add:
  - Orchestrator API: `POST /api/agents/viber/run` that accepts `project_id`, `target_feature`, and recent observations/errors. It will:
    - Pull latest Context Composer data (see Section 2)
    - Construct a repair/build prompt (inject files, diffs, and observations)
    - Call existing builder stream to apply edits
    - Log run, diffs, and outcome to Supabase (see Data Model)
  - Autonomy loop: keep running until user stops or acceptance check passes. Acceptance comes from Visual Observer status or user feedback.
- Hooks you already have:
  - File selection/diff: `processFiles`, `getHistoryDiff`
  - Large context handling: `handleTokenLimit`

### 2) Context Composer — Input Module
- Purpose: Capture and version the product idea, stack, user stories/README.md for Viber.
- UI (client): New panel `Context Composer` in the left sidebar (client app at `apps/we-dev-client`). Inputs:
  - Plain English app description
  - README.md upload/paste
  - Stack selection (e.g., Next.js + Supabase)
  - Non-functional requirements, constraints
- Persistence (server): Supabase table `project_contexts` (schema below). CRUD API:
  - `GET/POST/PUT /api/context` scoped by `project_id` and `user_id`
- Consumption: Viber reads the latest context snapshot per run; prevent mid-run mutations (only allow updates between sessions).

### 3) Visual Observer — Live Preview + Terminal Watcher
- Purpose: Observe preview/browser/terminal to detect failures and success criteria.
- Terminal (client): You already detect errors in `apps/we-dev-client/src/components/WeIde/components/Terminal/utils/weTerminal.ts` (e.g., matching “error”/“failure” and emitting). Extend to:
  - Normalize errors (strip ANSI) and push to a small in-memory queue and to Supabase `observations` table via `POST /api/observer`.
  - Extract dev server URL (already parsed) and register it as the preview target for the observer.
- Browser Preview (client): Enhance `PreviewIframe` to capture:
  - `window.onerror`, `unhandledrejection`, console.error, and network failures
  - Blank screen detection (no paint after N seconds)
  - Send structured events to the same observer endpoint; surface in `ErrorDisplay` UI.
- Acceptance checks: For a selected feature, define lightweight checks (URL contains text, element present, no console errors). Viber uses these signals to decide whether to continue or request user approval.

### 4) Error Fixer — Auto Repair Loop
- Purpose: Automatically trigger a focused repair prompt when Visual Observer reports a failure.
- Flow:
  - Observer event -> Debounce/group -> Build a minimal “repair prompt” including: error snippet, stack, last diff, and relevant files
  - Call builder handler with a repair objective (no new features)
  - Apply edits, re-run, and re-check
- UI: Keep the existing `ErrorDisplay` but add an “Auto-fix on” toggle per project; show last fix attempts and provide “Revert”/“Apply” controls.

### Data Model (Supabase / PostgreSQL)
Create these tables (simplified). Use RLS as appropriate.

```sql
-- projects (optional if you already have one)
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  created_at timestamptz default now()
);

-- project_contexts: latest idea/stack/README and history
create table if not exists project_contexts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid not null,
  description text,
  readme text,
  stack jsonb,
  version int not null default 1,
  created_at timestamptz default now()
);

-- runs: each Viber session or repair attempt
create table if not exists runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid,
  type text check (type in ('build','repair')),
  target_feature text,
  status text check (status in ('running','succeeded','failed','stopped')),
  prompt text,
  diff_summary text,
  created_at timestamptz default now(),
  finished_at timestamptz
);

-- observations: terminal/browser signals
create table if not exists observations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  run_id uuid references runs(id) on delete cascade,
  source text check (source in ('terminal','preview','network','console')),
  level text check (level in ('info','warn','error')),
  message text,
  raw jsonb,
  created_at timestamptz default now()
);

-- prompts: prompts and model metadata for replay/debug
create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references runs(id) on delete cascade,
  role text,
  content text,
  meta jsonb,
  created_at timestamptz default now()
);
```

### Supabase Integration (replacing MongoDB)
- Install: `pnpm add @supabase/supabase-js` in both apps.
- Env (server `apps/we-dev-next/.env`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- Server client: add `apps/we-dev-next/src/lib/supabase.ts` to create Admin client for DB writes.
- Client: optional anon client for reading project context; write operations go through server routes.
- Mongoose note: `apps/we-dev-next/package.json` includes `mongoose`, but the current builder pipeline does not require it. New persistence should prefer Supabase. Gradually migrate any user/session or credit/quota tracking to Supabase tables or Supabase Auth.

### Minimal New Endpoints (server)
- `POST /api/context` — create/update a context snapshot
- `GET /api/context?project_id=...` — latest snapshot
- `POST /api/observer` — ingest observation events
- `POST /api/agents/viber/run` — start/continue a run; returns stream/log id

### Client Hook Points (existing code to extend)
- Terminal events: `apps/we-dev-client/src/components/WeIde/components/Terminal/utils/weTerminal.ts`
- Error surface: `apps/we-dev-client/src/components/AiChat/chat/components/ChatInput/ErrorDisplay.tsx` and `useFileStore` error queue
- Preview capture: enhance `apps/we-dev-client/src/components/PreviewIframe.tsx` to forward console/network errors
- Event bus: reuse the existing emitter utilities in `apps/we-dev-client/src/components/AiChat/utils/EventEmitter.ts`

### Autonomy & Control
- A project-level toggle to start/stop Viber autonomy
- Per-run “Approve/Reject” modal when acceptance is ambiguous
- Revert: store file diffs per run; provide “Revert last run” in the UI using the stored `oldFiles` + diff

### Quick Setup Checklist
- Add Supabase env and install `@supabase/supabase-js`
- Create the four tables above (or adjust to your needs)
- Add the three new API routes
- Extend Terminal + Preview instrumentation
- Add the `Context Composer` panel in the client
- Implement the `Viber` run loop using the existing builder handler

### User Flow
1. User lands → logs in → dashboard
2. Opens `Context Composer`, defines the app idea, README, and stack, saves
3. Starts `Viber` with a target feature → builder generates edits
4. Visual Observer watches terminal/preview; Error Fixer auto-repairs
5. On success, Viber asks for approval; otherwise, continues autonomously until stopped
6. User can stop/revert any time; history is tracked per run
## Question
- If electron reports an error during the second run, please delete the client workspace
- electron If there is no preview when starting, run pnpm run electron:dev

## Contact US

send email to <a href="mailto:enzuo@wegc.cn">enzuo@wegc.cn</a>

## WeChat Group Chat
<img src="./docs/img/code.png" alt="alt text" width="200"/>

If you cannot join the WeChat group, you can add

<img src="./docs/img/self.png" alt="alt text" width="200"/>

## Star History

<a href="https://star-history.com/?utm_source=bestxtools.com#contexer-dev/contexer&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=contexer-dev/contexer&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=contexer-dev/contexer&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=contexer-dev/contexer&type=Date" />
 </picture>
</a>
