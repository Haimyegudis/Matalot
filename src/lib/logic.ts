import type { Chore, Completion, Profile, TaskRow } from './db-types'

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

export function weeklyScores(
  completions: Completion[],
  tasks: TaskRow[],
  chores: Chore[],
  profiles: Profile[],
  week: { start: Date; end: Date },
): Record<string, number> {
  const points = new Map(chores.map((c) => [c.id, c.points]))
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
