import type { Chore, Completion, DayPick, Profile, TaskRow } from './db-types'

export function dayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Sunday 00:00 local → next Sunday 00:00 local (exclusive). */
export function weekBounds(d: Date): { start: Date; end: Date } {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay())
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7)
  return { start, end }
}

/** Points per chore — shower and tracking-only chores are worth 0. */
export function chorePointsMap(chores: Chore[]): Map<string, number> {
  return new Map(chores.map((c) => [c.id, c.is_shower || c.track_only ? 0 : c.points]))
}

export function weeklyScores(
  completions: Completion[],
  tasks: TaskRow[],
  chores: Chore[],
  profiles: Profile[],
  week: { start: Date; end: Date },
): Record<string, number> {
  const points = chorePointsMap(chores)
  const scores: Record<string, number> = {}
  for (const p of profiles) scores[p.id] = 0

  for (const c of completions) {
    if (c.revoked_by) continue
    const t = new Date(c.completed_at)
    if (t < week.start || t >= week.end) continue
    if (!(c.profile_id in scores)) continue
    scores[c.profile_id] += points.get(c.chore_id) ?? 0
  }
  for (const task of tasks) {
    if (task.status !== 'done' || !task.completed_at) continue
    const t = new Date(task.completed_at)
    if (t < week.start || t >= week.end) continue
    if (!(task.child_id in scores)) continue
    scores[task.child_id] += task.points
  }
  return scores
}

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

/**
 * Turn-taking chores: next in turn is the sibling of whoever did it most
 * recently. Null with no history or fewer than two kids.
 */
export function nextInTurn(completions: Completion[], choreId: string, kids: Profile[]): string | null {
  if (kids.length < 2) return null
  const last = completions
    .filter((c) => c.chore_id === choreId && !c.revoked_by)
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0]
  if (!last) return null
  const other = kids.find((k) => k.id !== last.profile_id)
  return other ? other.id : null
}

/**
 * Tonight's suggested first shower: the kid who was NOT first on the most
 * recent past day that has live shower completions. Null with no history.
 */
export function showerFirstTonight(
  completions: Completion[],
  showerChoreId: string,
  kids: Profile[],
  today: Date,
): string | null {
  const todayStr = dayKey(today)
  const past = completions.filter(
    (c) => c.chore_id === showerChoreId && !c.revoked_by && c.day < todayStr,
  )
  if (past.length === 0) return null
  const lastDay = past.reduce((max, c) => (c.day > max ? c.day : max), past[0].day)
  const dayRows = past
    .filter((c) => c.day === lastDay)
    .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())
  const firstKid = dayRows[0].profile_id
  const other = kids.find((k) => k.id !== firstKid)
  return other ? other.id : null
}
