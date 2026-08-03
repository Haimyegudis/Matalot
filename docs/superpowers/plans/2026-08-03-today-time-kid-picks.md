# Today+Time Chores, Per-Kid Day Picks, Shower Yesterday — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Parent can pick a catalog chore for a specific kid (today only), create a chore for "today at HH:MM" with an inline push reminder, and the shower card always shows who showered first yesterday.

**Architecture:** Extend `day_picks` with `child_id` (null = both kids) and `remind_at`/`reminded_at`. Board filtering respects pick scope. The existing per-minute `remind-due` edge function gains a third query over due day_picks. Shower line is a pure helper over completions.

**Tech Stack:** React + TS + Vite, Supabase (Postgres 15+, edge functions/Deno, web-push), vitest.

## Global Constraints

- Hebrew UI, RTL. Gender inflection via `g()` from `src/lib/gender.ts`.
- `days` semantics on chores: `null` = daily, `[]` = catalog/general list, `[0..6]` = weekdays.
- Pick scope is for that day only; `assigned_to` (permanent) untouched by picks.
- Live DB: apply migration with a node+pg script (same approach as prior reset script); supabase CLI not linked.

---

### Task 1: Migration + DayPick type

**Files:**
- Create: `supabase/migrations/0012_pick_child_remind.sql`
- Modify: `src/lib/db-types.ts` (DayPick interface)

**Interfaces:**
- Produces: `DayPick` gains `child_id: string | null`, `remind_at: string | null`, `reminded_at: string | null`.

- [ ] **Step 1: Write migration**

```sql
-- per-kid day picks + optional same-day reminder
alter table day_picks add column child_id uuid references profiles(id) on delete cascade;
alter table day_picks add column remind_at timestamptz;
alter table day_picks add column reminded_at timestamptz;

alter table day_picks drop constraint day_picks_chore_id_day_key;
alter table day_picks add constraint day_picks_chore_day_child
  unique nulls not distinct (chore_id, day, child_id);
```

- [ ] **Step 2: Extend `DayPick` in db-types.ts**

```ts
export interface DayPick {
  id: string
  family_id: string
  chore_id: string
  day: string
  added_by: string | null
  /** null = both kids */
  child_id: string | null
  remind_at: string | null
  reminded_at: string | null
}
```

- [ ] **Step 3: Apply migration to live DB** — node pg script in scratchpad (connection: `db.hlwmwxafdaljvzjghuiw.supabase.co:5432`, user `postgres`, password from `.env.local` `SUPABASE_DB_PASSWORD`), run the SQL above verbatim, verify with `select column_name from information_schema.columns where table_name='day_picks'`.

- [ ] **Step 4: Commit** — `git add supabase/migrations/0012_pick_child_remind.sql src/lib/db-types.ts && git commit -m "feat(db): day_picks child scope + reminder columns"`

### Task 2: Logic helpers + tests (TDD)

**Files:**
- Modify: `src/lib/logic.ts`
- Test: `src/lib/logic.test.ts`

**Interfaces:**
- Produces:
  - `pickedChoreIds(picks: DayPick[], day: string, viewerId: string | null): Set<string>` — chore ids picked for `day` visible to viewer; `viewerId = null` means see all (parent).
  - `showerFirstOn(completions: Completion[], choreId: string, day: string): string | null` — profile_id of first live shower completion on `day`.

- [ ] **Step 1: Failing tests** (append to `logic.test.ts`, reuse existing fixture style)

```ts
describe('pickedChoreIds', () => {
  const pick = (chore_id: string, day: string, child_id: string | null): DayPick => ({
    id: 'p' + chore_id + (child_id ?? ''), family_id: 'f', chore_id, day,
    added_by: null, child_id, remind_at: null, reminded_at: null,
  })
  it('shared pick visible to any kid', () => {
    expect(pickedChoreIds([pick('c1', 'd1', null)], 'd1', 'kidA').has('c1')).toBe(true)
  })
  it('scoped pick visible only to that kid', () => {
    const picks = [pick('c1', 'd1', 'kidA')]
    expect(pickedChoreIds(picks, 'd1', 'kidA').has('c1')).toBe(true)
    expect(pickedChoreIds(picks, 'd1', 'kidB').has('c1')).toBe(false)
  })
  it('parent (null viewer) sees all; other days excluded', () => {
    const picks = [pick('c1', 'd1', 'kidA'), pick('c2', 'd2', null)]
    const set = pickedChoreIds(picks, 'd1', null)
    expect(set.has('c1')).toBe(true)
    expect(set.has('c2')).toBe(false)
  })
})

describe('showerFirstOn', () => {
  const comp = (profile_id: string, day: string, completed_at: string): Completion => ({
    id: profile_id + completed_at, chore_id: 'sh', profile_id, family_id: 'f',
    completed_at, day, revoked_by: null,
  })
  it('returns earliest completer that day', () => {
    const cs = [comp('B', 'd1', '2026-08-02T19:00:00Z'), comp('A', 'd1', '2026-08-02T18:00:00Z')]
    expect(showerFirstOn(cs, 'sh', 'd1')).toBe('A')
  })
  it('ignores revoked and other days; null when none', () => {
    const cs = [{ ...comp('A', 'd1', '2026-08-02T18:00:00Z'), revoked_by: 'p' }]
    expect(showerFirstOn(cs, 'sh', 'd1')).toBeNull()
    expect(showerFirstOn([], 'sh', 'd1')).toBeNull()
  })
})
```

- [ ] **Step 2: Run** `npx vitest run src/lib/logic.test.ts` — expect FAIL (functions not exported).

- [ ] **Step 3: Implement in `logic.ts`**

```ts
/** Chore ids picked into `day` that `viewerId` should see; null viewer (parent) sees all. */
export function pickedChoreIds(picks: DayPick[], day: string, viewerId: string | null): Set<string> {
  return new Set(
    picks
      .filter((p) => p.day === day && (viewerId === null || p.child_id === null || p.child_id === viewerId))
      .map((p) => p.chore_id),
  )
}

/** First (earliest) live completion of `choreId` on `day`, or null. */
export function showerFirstOn(completions: Completion[], choreId: string, day: string): string | null {
  const rows = completions
    .filter((c) => c.chore_id === choreId && c.day === day && !c.revoked_by)
    .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())
  return rows[0]?.profile_id ?? null
}
```

(Import `DayPick` in logic.ts type imports.)

- [ ] **Step 4: Run** `npx vitest run` — expect PASS (all suites).
- [ ] **Step 5: Commit** — `git commit -m "feat(logic): pick visibility + shower-first-on-day helpers"`

### Task 3: store — addDayPick with scope

**Files:**
- Modify: `src/lib/store.tsx:45,157-169`

**Interfaces:**
- Produces: `addDayPick(choreId: string, profileId: string, childId?: string | null, remindAt?: string | null): Promise<void>` — inserts pick with scope + reminder. Existing callers stay valid (optional params).

- [ ] **Step 1: Update signature in `FamilyData` and implementation**

```ts
addDayPick: (choreId: string, profileId: string, childId?: string | null, remindAt?: string | null) => Promise<void>
```

```ts
const addDayPick = useCallback(
  async (choreId: string, profileId: string, childId: string | null = null, remindAt: string | null = null) => {
    await supabase.from('day_picks').insert({
      family_id: familyRef.current!,
      chore_id: choreId,
      day: dayKey(new Date()),
      added_by: profileId,
      child_id: childId,
      remind_at: remindAt,
    })
    // duplicate insert (unique chore+day+child) is fine — someone else already added it
    await refetch()
  },
  [refetch],
)
```

- [ ] **Step 2: `npx tsc -b --noEmit` clean. Commit** — `git commit -m "feat(store): day pick child scope + reminder"`

### Task 4: KidHome — scoped picks UI + board filter + ⏰ tile

**Files:**
- Modify: `src/screens/KidHome.tsx`
- Modify: `src/components/ChoreButton.tsx` (new optional `remindLabel` prop)

**Interfaces:**
- Consumes: `pickedChoreIds` (Task 2), `addDayPick` (Task 3).
- Produces: `ChoreButton` prop `remindLabel?: string | null` — renders "⏰ עד HH:MM" line when set and not done.

- [ ] **Step 1: Board filtering** — replace `pickedToday` computation:

```ts
const viewerId = me.role === 'parent' ? null : me.id
const pickedToday = pickedChoreIds(data.dayPicks, day, viewerId)
```

Catalog (sheet list): a chore stays listed until fully covered. Compute per chore the pick rows of today:

```ts
const todayPicks = data.dayPicks.filter((p) => p.day === day)
const coveredForAll = (choreId: string) =>
  todayPicks.some((p) => p.chore_id === choreId && p.child_id === null) ||
  kids.every((k) => todayPicks.some((p) => p.chore_id === choreId && p.child_id === k.id))
const catalogChores = data.chores.filter(
  (c) => mine(c) && c.days !== null && c.days.length === 0 &&
    (me.role === 'parent' ? !coveredForAll(c.id) : !pickedToday.has(c.id)),
)
```

- [ ] **Step 2: Pick buttons in sheet** — for parents, per catalog row replace the single button. Scope button disabled when that scope already covered (shared pick covers everyone):

```tsx
{me.role === 'parent' && !c.assigned_to ? (
  <div style={{ display: 'grid', gap: 4 }}>
    {[{ id: null as string | null, name: 'שניהם' }, ...kids].map((k) => {
      const covered =
        todayPicks.some((p) => p.chore_id === c.id && p.child_id === null) ||
        (k.id !== null && todayPicks.some((p) => p.chore_id === c.id && p.child_id === k.id))
      return (
        <button key={k.id ?? 'all'} className="btn btn--teal" disabled={covered}
          style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: covered ? 0.45 : 1 }}
          onClick={() => pickFromCatalog(c.id, k.id)}>
          ➕ {k.name}
        </button>
      )
    })}
  </div>
) : (
  <button className="btn btn--teal" style={{ padding: '8px 16px', fontSize: '0.88rem' }}
    onClick={() => pickFromCatalog(c.id, null)}>
    ➕ להיום
  </button>
)}
```

```ts
async function pickFromCatalog(choreId: string, childId: string | null = null) {
  await data.addDayPick(choreId, me.id, childId)
  showToast('נוספה להיום ✓')
}
```

- [ ] **Step 3: ⏰ on tile** — in the `activeChores.map`, find today's pick with reminder relevant to viewer, pass to ChoreButton:

```ts
const pick = data.dayPicks.find(
  (p) => p.day === day && p.chore_id === chore.id && p.remind_at &&
    (p.child_id === null || me.role === 'parent' || p.child_id === me.id),
)
const remindLabel = pick && !mine
  ? `⏰ עד ${new Date(pick.remind_at!).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
  : null
```

ChoreButton: accept `remindLabel?: string | null`, render under the title (same style as tasks: `fontSize: '0.78rem', color: 'var(--coral)', fontWeight: 700`).

- [ ] **Step 4: `npx vitest run && npx tsc -b --noEmit`. Commit** — `git commit -m "feat(home): per-kid day picks + reminder time on tiles"`

### Task 5: ManageChores — "היום" mode + time

**Files:**
- Modify: `src/screens/parent/ManageChores.tsx`

**Interfaces:**
- Consumes: `data.dayPicks` (already in `FamilyData`), `dayKey` from logic.

- [ ] **Step 1: Draft extension** — add `today: boolean`, `remindTime: string` ('' = none). On opening an existing chore: `today = data.dayPicks.some((p) => p.chore_id === c.id && p.day === todayStr)`, `remindTime` from that pick's `remind_at` (format HH:MM local) or ''.

- [ ] **Step 2: UI** — "מתי מופיעה" gets 4th mode button **היום** (selected when `draft.today`). Selecting it sets `{ today: true, days: [] }`; selecting any other mode sets `today: false`. When today: show

```tsx
<label style={{ fontWeight: 700, fontSize: '0.85rem' }}>
  ⏰ תזכורת בשעה (אופציונלי)
  <input type="time" dir="ltr" value={draft.remindTime}
    onChange={(e) => setDraft({ ...draft, remindTime: e.target.value })} style={{ marginTop: 6 }} />
</label>
```

- [ ] **Step 3: Save logic** — chore upsert must return id (`.select().single()` on insert). After save:

```ts
const todayStr = dayKey(new Date())
if (draft.today) {
  const remindAt = draft.remindTime ? new Date(`${todayStr}T${draft.remindTime}:00`).toISOString() : null
  await supabase.from('day_picks').delete().eq('chore_id', choreId).eq('day', todayStr)
  await supabase.from('day_picks').insert({
    family_id: family!.id, chore_id: choreId, day: todayStr,
    added_by: null, child_id: draft.assigned_to, remind_at: remindAt,
  })
} else if (hadTodayPick) {
  await supabase.from('day_picks').delete().eq('chore_id', choreId).eq('day', todayStr)
}
```

(`hadTodayPick` captured when the draft was opened. `added_by: null` — parent tools; column nullable.)

- [ ] **Step 4: Summary line** in chore list rows: when a today-pick exists show `· היום` (+ `⏰ HH:MM` if remind). `npx tsc -b --noEmit`. Commit — `git commit -m "feat(parent): 'today' schedule mode with inline reminder time"`

### Task 6: remind-due — day-pick reminders

**Files:**
- Modify: `supabase/functions/remind-due/index.ts`

- [ ] **Step 1: Third block** after nudges, same claim pattern:

```ts
// due day-pick chore reminders
const { data: duePicks } = await supabaseAdmin
  .from('day_picks')
  .select('*, chores(title)')
  .is('reminded_at', null)
  .lte('remind_at', new Date().toISOString())
  .not('remind_at', 'is', null)
  .limit(50)

for (const pick of duePicks ?? []) {
  const { data: claimed } = await supabaseAdmin
    .from('day_picks')
    .update({ reminded_at: new Date().toISOString() })
    .eq('id', pick.id)
    .is('reminded_at', null)
    .select()
  if (!claimed || claimed.length === 0) continue

  let recipients: string[]
  if (pick.child_id) recipients = [pick.child_id]
  else {
    const { data: kidRows } = await supabaseAdmin
      .from('profiles').select('id').eq('family_id', pick.family_id).eq('role', 'child')
    recipients = (kidRows ?? []).map((k) => k.id)
  }
  // skip kids who already did it today
  const { data: doneRows } = await supabaseAdmin
    .from('completions').select('profile_id')
    .eq('chore_id', pick.chore_id).eq('day', pick.day).is('revoked_by', null)
  const done = new Set((doneRows ?? []).map((d) => d.profile_id))
  recipients = recipients.filter((r) => !done.has(r))

  const payload = JSON.stringify({
    title: '⏰ תזכורת ממטלות',
    body: (pick as { chores?: { title?: string } }).chores?.title ?? 'מטלה',
    url: '/',
  })
  for (const rid of recipients) {
    const { data: subs } = await supabaseAdmin
      .from('push_subscriptions').select('*').eq('profile_id', rid)
    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)
        sent++
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id)
        }
      }
    }
  }
}
```

Include `picks: duePicks?.length ?? 0` in the response JSON.

- [ ] **Step 2: Deploy** — `npx supabase functions deploy remind-due --project-ref hlwmwxafdaljvzjghuiw` (needs `SUPABASE_ACCESS_TOKEN` or prior `npx supabase login`; if missing, ask user to run `! npx supabase login`). Commit — `git commit -m "feat(push): reminders for due day-pick chores"`

### Task 7: ShowerCard — yesterday's first

**Files:**
- Modify: `src/components/ShowerCard.tsx`

**Interfaces:**
- Consumes: `showerFirstOn` (Task 2), `dayKey` from logic, `g` from gender.

- [ ] **Step 1: Compute yesterday line**

```ts
const target = new Date(`${day}T12:00:00`)
const yest = new Date(target); yest.setDate(yest.getDate() - 1)
const yesterdayFirst = showerFirstOn(completions, chore.id, dayKey(yest))
let prevLabel: string | null = null
let prevKid = kids.find((k) => k.id === yesterdayFirst)
if (prevKid) prevLabel = `אתמול ${prevKid.name} ${g(prevKid, 'התקלח ראשון', 'התקלחה ראשונה')} 🚿`
else {
  // most recent earlier day with data
  const past = completions
    .filter((c) => c.chore_id === chore.id && !c.revoked_by && c.day < day)
    .sort((a, b) => (a.day < b.day ? 1 : -1))
  const lastDay = past[0]?.day
  const firstId = lastDay ? showerFirstOn(completions, chore.id, lastDay) : null
  prevKid = kids.find((k) => k.id === firstId)
  if (prevKid) prevLabel = `בפעם הקודמת ${prevKid.name} ${g(prevKid, 'התקלח ראשון', 'התקלחה ראשונה')} 🚿`
}
```

- [ ] **Step 2: Render** — always (when `prevLabel`), under the existing status line:

```tsx
{prevLabel && (
  <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', fontWeight: 600 }}>{prevLabel}</div>
)}
```

- [ ] **Step 3: `npx vitest run && npx tsc -b --noEmit`. Commit** — `git commit -m "feat(shower): always show who showered first yesterday"`

### Task 8: Verify + ship

- [ ] `npx vitest run` — all pass.
- [ ] `npm run build` — clean.
- [ ] Migration applied (Task 1) — confirm columns live.
- [ ] Edge function deployed (Task 6).
- [ ] Push commits.
