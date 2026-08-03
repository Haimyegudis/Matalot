import { describe, it, expect } from 'vitest'
import { weekBounds, weeklyScores, showerFirstTonight, dayKey } from './logic'
import type { Chore, Completion, Profile, TaskRow } from './db-types'

const kidA: Profile = { id: 'a', family_id: 'f', name: 'דני', role: 'child', gender: 'male', avatar: null, photo_url: null, color: '#f00', sort: 0 }
const kidB: Profile = { id: 'b', family_id: 'f', name: 'יעל', role: 'child', gender: 'female', avatar: null, photo_url: null, color: '#00f', sort: 1 }

function chore(over: Partial<Chore>): Chore {
  return { id: 'c1', family_id: 'f', title: 'זבל', icon: 'trash', points: 1, assigned_to: null, is_shower: false, active: true, sort: 0, ...over }
}
function comp(over: Partial<Completion>): Completion {
  return { id: Math.random().toString(), chore_id: 'c1', profile_id: 'a', family_id: 'f', completed_at: '2026-08-03T10:00:00+03:00', day: '2026-08-03', revoked_by: null, ...over }
}

describe('dayKey', () => {
  it('formats local date', () => {
    expect(dayKey(new Date(2026, 7, 3))).toBe('2026-08-03')
    expect(dayKey(new Date(2026, 0, 9))).toBe('2026-01-09')
  })
})

describe('weekBounds', () => {
  it('Sunday maps to itself as start', () => {
    // 2026-08-02 is a Sunday
    const { start, end } = weekBounds(new Date(2026, 7, 2, 15, 30))
    expect(dayKey(start)).toBe('2026-08-02')
    expect(dayKey(end)).toBe('2026-08-09')
    expect(start.getHours()).toBe(0)
  })
  it('Saturday belongs to week started previous Sunday', () => {
    // 2026-08-08 is a Saturday
    const { start } = weekBounds(new Date(2026, 7, 8, 23, 59))
    expect(dayKey(start)).toBe('2026-08-02')
  })
  it('crosses month boundary', () => {
    // 2026-09-01 is a Tuesday -> week starts Sunday 2026-08-30
    const { start } = weekBounds(new Date(2026, 8, 1))
    expect(dayKey(start)).toBe('2026-08-30')
  })
})

describe('weeklyScores', () => {
  const week = weekBounds(new Date(2026, 7, 3)) // week of Aug 2-8 2026
  const chores = [chore({ id: 'c1', points: 2 }), chore({ id: 'c2', points: 1 })]

  it('sums chore points per kid, skips revoked and out-of-week', () => {
    const completions = [
      comp({ chore_id: 'c1', profile_id: 'a' }),                                  // +2 A
      comp({ chore_id: 'c2', profile_id: 'a', revoked_by: 'p' }),                 // revoked
      comp({ chore_id: 'c2', profile_id: 'b' }),                                  // +1 B
      comp({ chore_id: 'c2', profile_id: 'b', day: '2026-07-30', completed_at: '2026-07-30T10:00:00+03:00' }), // out of week
    ]
    const scores = weeklyScores(completions, [], chores, [kidA, kidB], week)
    expect(scores['a']).toBe(2)
    expect(scores['b']).toBe(1)
  })

  it('adds done tasks completed within week', () => {
    const tasks: TaskRow[] = [
      { id: 't1', family_id: 'f', child_id: 'a', title: 'שיעורים', icon: 'book', points: 3, remind_at: null, reminded_at: null, status: 'done', completed_at: '2026-08-04T17:00:00+03:00', created_at: '' },
      { id: 't2', family_id: 'f', child_id: 'a', title: 'עוד', icon: 'book', points: 5, remind_at: null, reminded_at: null, status: 'pending', completed_at: null, created_at: '' },
    ]
    const scores = weeklyScores([], tasks, chores, [kidA, kidB], week)
    expect(scores['a']).toBe(3)
    expect(scores['b']).toBe(0)
  })
})

describe('showerFirstTonight', () => {
  const shower = chore({ id: 'sh', is_shower: true })

  it('null with no history', () => {
    expect(showerFirstTonight([], shower.id, [kidA, kidB], new Date(2026, 7, 3))).toBeNull()
  })

  it('suggests the kid who was NOT first on most recent shower day', () => {
    const completions = [
      comp({ chore_id: 'sh', profile_id: 'a', day: '2026-08-02', completed_at: '2026-08-02T19:00:00+03:00' }),
      comp({ chore_id: 'sh', profile_id: 'b', day: '2026-08-02', completed_at: '2026-08-02T19:30:00+03:00' }),
    ]
    expect(showerFirstTonight(completions, shower.id, [kidA, kidB], new Date(2026, 7, 3))).toBe('b')
  })

  it('single-kid history: the other kid is suggested first', () => {
    const completions = [
      comp({ chore_id: 'sh', profile_id: 'a', day: '2026-08-02', completed_at: '2026-08-02T19:00:00+03:00' }),
    ]
    expect(showerFirstTonight(completions, shower.id, [kidA, kidB], new Date(2026, 7, 3))).toBe('b')
  })

  it('ignores today and revoked rows', () => {
    const completions = [
      comp({ chore_id: 'sh', profile_id: 'b', day: '2026-08-03', completed_at: '2026-08-03T19:00:00+03:00' }), // today
      comp({ chore_id: 'sh', profile_id: 'b', day: '2026-08-02', completed_at: '2026-08-02T19:00:00+03:00', revoked_by: 'p' }),
      comp({ chore_id: 'sh', profile_id: 'a', day: '2026-08-01', completed_at: '2026-08-01T19:00:00+03:00' }),
    ]
    expect(showerFirstTonight(completions, shower.id, [kidA, kidB], new Date(2026, 7, 3))).toBe('b')
  })
})
