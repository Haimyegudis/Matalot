# Matalot (מטלות) — Kids Chores App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hebrew RTL family chores-tracking PWA (2 kids + parents), real-time sync via Supabase, parent/kid modes, weekly points, avatar builder, web-push reminders, shipped as TWA APK.

**Architecture:** React+Vite+TS SPA on Vercel; new dedicated Supabase project (Postgres+Auth+Realtime+Edge Functions+Storage). One Supabase auth user per family; per-device profile selection in localStorage; parent mode behind PIN (hash in DB). All screens derive from `completions`/`tasks` rows — no denormalized score storage.

**Tech Stack:** React 18, Vite, TypeScript, react-router-dom, @supabase/supabase-js v2, Vitest, Supabase Edge Functions (Deno, npm:web-push), pg_cron+pg_net, Bubblewrap TWA (pattern from WorkDiary/android-twa).

## Global Constraints

- UI language: Hebrew, `dir="rtl"` on root; all dates/times Israel local (device TZ).
- Week = Sunday 00:00 → Saturday 23:59 local time.
- Kid-facing UI: big touch targets (min 64px), icon-first, short text.
- Points default 1 per chore; scores always computed client-side from rows, never stored.
- Deleting a chore sets `active=false` (history preserved).
- Revoked completions keep the row (`revoked_by` set).
- No gamification beyond weekly points (spec YAGNI).
- Repo: https://github.com/Haimyegudis/Matalot.git, dir `C:\APPS\Matalot`. Commit after every task.
- Secrets (`.env.local`, db password, VAPID keys) never committed.

---

### Task 1: Infrastructure — Supabase project + Vite scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `.gitignore`, `.env.local` (untracked), `vercel.json`, `supabase/config.toml`

**Interfaces:**
- Produces: running dev server; `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in `.env.local`; Supabase project ref recorded in `docs/superpowers/plans/notes.md`.

- [ ] **Step 1:** `npx supabase projects create Matalot --org-id jduhdpylrdwaknehwjdj --region eu-central-1 --db-password <generated>` (generate 24-char password, save to `.env.local` as comment + `SUPABASE_DB_PASSWORD`). Wait until ACTIVE_HEALTHY (`npx supabase projects list`).
- [ ] **Step 2:** Scaffold Vite react-ts app in repo root (`npm create vite@latest . -- --template react-ts`), install deps: `@supabase/supabase-js react-router-dom`, dev: `vitest @types/node`. `index.html`: `<html lang="he" dir="rtl">`, title "מטלות".
- [ ] **Step 3:** Fetch anon key (`npx supabase projects api-keys --project-ref <ref>`), write `.env.local`. `.gitignore`: node_modules, dist, .env.local, .vercel.
- [ ] **Step 4:** `vercel.json` SPA rewrite `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`. Verify `npm run dev` serves and `npm run build` passes.
- [ ] **Step 5:** Commit `chore: scaffold vite app + supabase project`.

### Task 2: Database schema, RLS, seed

**Files:**
- Create: `supabase/migrations/0001_schema.sql`, `supabase/migrations/0002_seed_notes.sql` (seed done via app setup screen instead — see Task 3), `src/lib/db-types.ts`

**Interfaces:**
- Produces: tables `families, profiles, chores, completions, tasks, push_subscriptions`; TS types `Family, Profile, Chore, Completion, TaskRow, AvatarConfig`.

- [ ] **Step 1:** Write `0001_schema.sql`:

```sql
create table families (
  id uuid primary key default gen_random_uuid(),
  owner_uid uuid not null unique references auth.users(id),
  name text not null,
  parent_pin_hash text not null
);
create table profiles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  role text not null check (role in ('parent','child')),
  avatar jsonb,
  photo_url text,
  color text not null default '#f59e0b',
  sort int not null default 0
);
create table chores (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  icon text not null default 'star',
  points int not null default 1 check (points between 1 and 99),
  assigned_to uuid references profiles(id) on delete set null,
  is_shower boolean not null default false,
  active boolean not null default true,
  sort int not null default 0
);
create table completions (
  id uuid primary key default gen_random_uuid(),
  chore_id uuid not null references chores(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  completed_at timestamptz not null default now(),
  day date not null,
  revoked_by uuid references profiles(id)
);
-- shared (non-shower) chore: one completion per day total
create unique index uq_shared_completion on completions (chore_id, day) where revoked_by is null
  and chore_id in (select id from chores where assigned_to is null and is_shower = false); -- NOTE: subquery not allowed in index predicate; enforced via trigger instead (Step 2)
create unique index uq_per_child_completion on completions (chore_id, day, profile_id) where revoked_by is null;
create table tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  child_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  icon text not null default 'star',
  points int not null default 1,
  remind_at timestamptz,
  reminded_at timestamptz,
  status text not null default 'pending' check (status in ('pending','done')),
  completed_at timestamptz
);
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  endpoint text not null unique,
  keys jsonb not null,
  device_label text
);
```

- [ ] **Step 2:** Replace invalid partial-index-with-subquery: keep `uq_per_child_completion`; add BEFORE INSERT trigger `enforce_shared_single`:

```sql
create or replace function enforce_shared_single() returns trigger as $$
declare c chores;
begin
  select * into c from chores where id = new.chore_id;
  if c.assigned_to is null and not c.is_shower then
    if exists (select 1 from completions where chore_id = new.chore_id and day = new.day and revoked_by is null) then
      raise exception 'ALREADY_DONE' using errcode = '23505';
    end if;
  end if;
  return new;
end $$ language plpgsql;
create trigger trg_shared_single before insert on completions
  for each row execute function enforce_shared_single();
```

- [ ] **Step 3:** RLS: enable on all tables; policy on each: `family_id = (select id from families where owner_uid = auth.uid())` for ALL (select/insert/update/delete), using a `security definer` helper `my_family_id()`:

```sql
create or replace function my_family_id() returns uuid
language sql stable security definer as
$$ select id from families where owner_uid = auth.uid() $$;
alter table families enable row level security;
create policy fam_own on families for all using (owner_uid = auth.uid()) with check (owner_uid = auth.uid());
-- for each of profiles, chores, completions, tasks, push_subscriptions:
-- create policy <t>_fam on <t> for all using (family_id = my_family_id()) with check (family_id = my_family_id());
```

- [ ] **Step 4:** Enable realtime: `alter publication supabase_realtime add table completions, chores, tasks;` Link repo (`npx supabase link --project-ref <ref>`), `npx supabase db push`. Verify tables in remote via `npx supabase migration list`.
- [ ] **Step 5:** Write `src/lib/db-types.ts` with TS interfaces mirroring the tables (`AvatarConfig = { skin: string; hair: string; hairColor: string; eyes: string; outfit: string; accessory: string | null }`).
- [ ] **Step 6:** Commit `feat(db): schema, RLS, realtime`.

### Task 3: Supabase client, family setup + login, profile selection, PIN

**Files:**
- Create: `src/lib/supabase.ts`, `src/lib/session.ts`, `src/screens/SetupScreen.tsx`, `src/screens/ProfilePicker.tsx`, `src/lib/pin.ts`
- Test: `src/lib/pin.test.ts`

**Interfaces:**
- Produces: `supabase` client singleton; `useSession()` → `{ family, profiles, currentProfile, setCurrentProfile }`; `hashPin(pin: string): Promise<string>` (SHA-256 hex); localStorage keys `matalot.profileId`.
- Setup flow (first run, no auth session): parent enters email+password (signUp or signIn), family name, PIN, kid names → inserts family, parent profile, 2 kid profiles, default chores (זבל/star-trash, מים לרוקי/robot, טיול עם שלג/dog, מקלחת is_shower=true) — all in one screen wizard.

- [ ] **Step 1:** Test `hashPin` returns stable 64-char hex; different pins differ.
- [ ] **Step 2:** Run test — fails (no module).
- [ ] **Step 3:** Implement `pin.ts` (WebCrypto `crypto.subtle.digest('SHA-256')`).
- [ ] **Step 4:** Tests pass.
- [ ] **Step 5:** Implement `supabase.ts` (createClient from env), `session.ts` (React context: on load — `supabase.auth.getSession()`; fetch family+profiles; expose profile switch which writes localStorage).
- [ ] **Step 6:** `SetupScreen` wizard (3 steps: parent account → family+PIN → kids names) inserting rows above. `ProfilePicker`: grid of profile cards.
- [ ] **Step 7:** Manual verify in dev: create real family account, land on ProfilePicker. Commit `feat(auth): family setup, login, profile picker, PIN hash`.

### Task 4: Core domain logic + tests (pure functions)

**Files:**
- Create: `src/lib/logic.ts`
- Test: `src/lib/logic.test.ts`

**Interfaces:**
- Produces (all pure, no I/O):
  - `weekBounds(d: Date): { start: Date; end: Date }` — Sunday 00:00 to next Sunday 00:00 (exclusive) local.
  - `weeklyScores(completions: Completion[], tasks: TaskRow[], chores: Chore[], profiles: Profile[], week: {start: Date; end: Date}): Record<string, number>` — profileId→points; excludes revoked; tasks count when `status='done'` and completed_at in week.
  - `showerFirstTonight(completions: Completion[], showerChoreId: string, kids: Profile[], today: Date): string | null` — profileId of tonight's suggested first = the kid who was NOT first on the most recent day with ≥1 shower completion; null if no history.
  - `dayKey(d: Date): string` — `YYYY-MM-DD` local.

- [ ] **Step 1:** Write failing tests: week bounds across month boundary and on Saturday/Sunday edges; weekly score sums points, skips revoked, includes done tasks; shower suggestion flips daily, handles single-kid history, empty history → null.
- [ ] **Step 2:** Run `npx vitest run` — fail.
- [ ] **Step 3:** Implement `logic.ts`.
- [ ] **Step 4:** `npx vitest run` — pass.
- [ ] **Step 5:** Commit `feat(logic): week bounds, weekly scores, shower turn`.

### Task 5: Data hooks — realtime store + offline queue

**Files:**
- Create: `src/lib/store.ts` (fetch + realtime subscribe for chores/completions/tasks), `src/lib/offlineQueue.ts`
- Test: `src/lib/offlineQueue.test.ts`

**Interfaces:**
- Produces: `useFamilyData()` → `{ chores, completions, tasks, loading }` auto-refreshing on realtime events (channel per table, filter `family_id=eq.<id>`); `completeChore(choreId, profileId): Promise<'ok'|'already_done'>` — optimistic insert, on `ALREADY_DONE`/23505 returns 'already_done'; `queue.push(op)` persisting to localStorage `matalot.queue`, `queue.flush()` called on `online` event and app start; queued ops replay `completeChore`/`completeTask`.

- [ ] **Step 1:** Failing tests for offlineQueue: push persists to localStorage; flush sends ops in order via injected sender; failed 'already_done' op is dropped not retried; network-failed op stays queued.
- [ ] **Step 2:** Run — fail. **Step 3:** Implement. **Step 4:** Pass.
- [ ] **Step 5:** Implement `store.ts` with realtime subscriptions and `completeChore`/`revokeCompletion`/`completeTask` mutations (each tries network, on fetch failure enqueues + applies optimistic local state).
- [ ] **Step 6:** Commit `feat(data): realtime store + offline queue`.

### Task 6: Kid UI — Today, Yesterday, shower card (invoke frontend-design skill first)

**Files:**
- Create: `src/screens/KidHome.tsx`, `src/components/ChoreButton.tsx`, `src/components/ScoreBar.tsx`, `src/components/ShowerCard.tsx`, `src/components/icons.tsx` (icon registry: trash, dog, robot, shower, dishes, bed, homework, star, broom, plant, laundry, book), `src/styles/*`
- Modify: `src/App.tsx` (routes: `/` kid home, `/yesterday`, `/calendar`, `/profile`, `/parent/*`)

**Interfaces:**
- Consumes: `useFamilyData`, `completeChore`, `weeklyScores`, `showerFirstTonight`.
- Produces: `<ChoreButton chore onDone doneBy disabled/>`; icon registry `CHORE_ICONS: Record<string, ReactNode>` reused by parent screens.

- [ ] **Step 1:** Invoke `frontend-design` skill; establish visual system (playful kid palette, typography, motion) as CSS tokens; document in `src/styles/tokens.css`.
- [ ] **Step 2:** Build KidHome: parent-task cards on top (with reminder time badge), chore grid, shared-done state ("בוצע ע"י X" grayed), success animation on tap (CSS burst + points chip), ScoreBar with both kids' weekly totals + avatars, ShowerCard ("הערב ראשון: X 🚿").
- [ ] **Step 3:** Yesterday view: same grid, read-only, `day = today-1`.
- [ ] **Step 4:** Bottom nav (היום / יומן / פרופיל) + lock icon → parent. Verify in dev on mobile viewport; `npm run build` clean.
- [ ] **Step 5:** Commit `feat(kid): today/yesterday screens, chore grid, shower card`.

### Task 7: Calendar (journal) screen

**Files:**
- Create: `src/screens/KidCalendar.tsx`

**Interfaces:**
- Consumes: `useFamilyData`, `dayKey`. Month grid (RTL, week starts Sunday), each day cell shows points earned by current profile; tapping a day opens bottom sheet listing that day's completions+tasks with icons and times.

- [ ] **Step 1:** Build month grid with prev/next month arrows; derive per-day totals from completions of current profile.
- [ ] **Step 2:** Bottom-sheet day detail. Verify visually. Commit `feat(kid): monthly journal`.

### Task 8: Avatar builder + photo upload

**Files:**
- Create: `src/components/AvatarSvg.tsx` (renders AvatarConfig as layered SVG), `src/screens/ProfileScreen.tsx`, `src/lib/avatarOptions.ts`
- Test: `src/lib/avatarOptions.test.ts` (every option combination renders defined layer ids)

**Interfaces:**
- Produces: `<AvatarSvg config size/>` used in ProfilePicker, ScoreBar, parent dashboard; options: skin×6, hair style×6, hair color×6, eyes×4, outfit×8, accessory×5(+none). `saveAvatar(profileId, config)`; `uploadPhoto(profileId, file)` → Supabase Storage bucket `avatars` (public read), sets `photo_url`.

- [ ] **Step 1:** Failing test: `avatarOptions` lists exist, `AvatarSvg` renders without crash for random configs (testing-library or render-to-string).
- [ ] **Step 2:** Implement hand-drawn SVG layers (head/body base tinted by skin, hair paths, eye variants, outfit shapes, accessories: glasses/cap/crown/bow/headphones).
- [ ] **Step 3:** ProfileScreen with tab strip (עור/שיער/עיניים/בגדים/אקססוריז) + live preview + "או תמונה" upload path; create `avatars` bucket via migration `0002_storage.sql` (`insert into storage.buckets (id, name, public) values ('avatars','avatars',true)` + RLS policies for authenticated write).
- [ ] **Step 4:** Tests pass; manual check both paths. Commit `feat(avatar): layered SVG builder + photo upload`.

### Task 9: Parent mode

**Files:**
- Create: `src/screens/parent/PinGate.tsx`, `src/screens/parent/WeekBoard.tsx`, `src/screens/parent/ManageChores.tsx`, `src/screens/parent/NewTask.tsx`, `src/screens/parent/Settings.tsx`

**Interfaces:**
- Consumes: `hashPin` (compare to `families.parent_pin_hash`), `revokeCompletion(completionId, parentProfileId)`, chores CRUD (`insert/update` on chores incl. `active=false` for delete), tasks insert with `remind_at`.
- PinGate stores unlock in sessionStorage `matalot.parentUnlocked` (cleared on tab close).

- [ ] **Step 1:** PinGate (numeric keypad, 4-6 digits) → `/parent` routes guarded.
- [ ] **Step 2:** WeekBoard: table days(rows, א׳–ש׳)×kids(columns); cell lists completion icons; tap completion → confirm dialog → revoke (sets `revoked_by`, score drops). Week nav arrows (prev/next week).
- [ ] **Step 3:** ManageChores: list active chores with edit; add/edit form: title, icon picker (from `CHORE_ICONS`), points stepper, assignment select (משותפת/ילד A/ילד B); delete → `active=false`.
- [ ] **Step 4:** NewTask: child select, title, icon, points, datetime-local reminder → insert task. Settings: rename profiles, change PIN (re-enter old), family name.
- [ ] **Step 5:** Verify flows in dev; build clean. Commit `feat(parent): PIN gate, week board, chore mgmt, tasks, settings`.

### Task 10: Push notifications end-to-end

**Files:**
- Create: `public/sw.js` (push + notificationclick + PWA cache shell), `src/lib/push.ts`, `supabase/functions/send-push/index.ts`, `supabase/functions/remind-due/index.ts`, `supabase/migrations/0003_cron.sql`

**Interfaces:**
- `push.ts`: `enablePush(profileId)` — Notification.requestPermission → `sw.pushManager.subscribe({userVisibleOnly:true, applicationServerKey: VITE_VAPID_PUBLIC_KEY})` → upsert `push_subscriptions`.
- `send-push` (POST `{kind:'completion', profileId, choreTitle}` with user JWT): loads family parents' subscriptions (service role), sends web-push "«kid» ביצע: «title» 🎉". Called fire-and-forget from `completeChore`/`completeTask`.
- `remind-due` (invoked by cron each minute, secured by `x-cron-key` secret): selects `tasks where status='pending' and remind_at <= now() and reminded_at is null`, pushes to child's subscriptions ("⏰ «title»", url `/task/<id>`), sets `reminded_at`.
- `sw.js` `notificationclick`: focus/open `event.notification.data.url`.

- [ ] **Step 1:** Generate VAPID keys (`npx web-push generate-vapid-keys`), store: public in `.env.local` + Vercel env, both as supabase secrets (`npx supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... CRON_KEY=...`).
- [ ] **Step 2:** Implement both edge functions with `npm:web-push`; deploy (`npx supabase functions deploy send-push remind-due --no-verify-jwt` — remind-due validates CRON_KEY, send-push validates the passed JWT via `supabase.auth.getUser`).
- [ ] **Step 3:** `0003_cron.sql`: enable `pg_cron`,`pg_net`; `select cron.schedule('remind-due','* * * * *', $$select net.http_post('https://<ref>.supabase.co/functions/v1/remind-due', headers=>jsonb_build_object('x-cron-key','<CRON_KEY>'))$$);` db push.
- [ ] **Step 4:** Wire `enablePush` into ProfilePicker (after profile chosen) + Settings toggle; sw registration in `main.tsx`.
- [ ] **Step 5:** Manual E2E on desktop Chrome: reminder fires, completion notifies parent. Commit `feat(push): reminders + completion notifications`.

### Task 11: PWA manifest + offline shell

**Files:**
- Create: `public/manifest.webmanifest`, `public/icons/*` (192/512 maskable, generated from app logo SVG), modify `index.html`, extend `public/sw.js` cache-first shell.

- [ ] **Step 1:** Manifest: name "מטלות", short_name "מטלות", `dir:"rtl"`, `lang:"he"`, standalone, theme/background from design tokens, icons.
- [ ] **Step 2:** SW precache built shell (network-first for index, cache-first for assets); verify Lighthouse installable. Commit `feat(pwa): manifest + offline shell`.

### Task 12: Deploy Vercel + TWA APK + install on phone

**Files:**
- Create: `android-twa/` (bubblewrap project, pattern per `C:\APPS\WorkDiary\android-twa\README.md`), `.well-known/assetlinks.json` in `public/`

- [ ] **Step 1:** `npx vercel link` (new project "matalot") + set env vars + `npx vercel --prod`. Record prod URL.
- [ ] **Step 2:** Read `C:\APPS\WorkDiary\android-twa\README.md` for gotchas; `npx @bubblewrap/cli init --manifest <prod>/manifest.webmanifest` (package `com.haim.matalot`), new keystore → copy to `C:\APPS\keys`, build APK.
- [ ] **Step 3:** `assetlinks.json` with APK SHA-256 fingerprint → redeploy → verify no URL bar.
- [ ] **Step 4:** `adb -s 10.0.0.10:43217 install -r app-release-signed.apk`; `adb shell monkey -p com.haim.matalot 1` to launch.
- [ ] **Step 5:** Commit `feat(android): TWA wrapper`; push all to origin main.

## Self-Review Notes

- Spec coverage: setup/auth (T3), chores CRUD+assignment (T9), shared-first-wins (T2 trigger + T5), weekly points (T4/T6/T9), shower turn (T4/T6), yesterday+journal (T6/T7), avatar/photo (T8), reminders+parent notify (T10), offline queue (T5), PWA+TWA+adb (T11/T12). Covered.
- Partial-index-with-subquery pitfall handled via trigger (T2 Step 2).
- Icon registry defined once (T6) and reused (T9).
