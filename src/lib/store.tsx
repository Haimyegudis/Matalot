import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import { createQueue, type QueuedOp, type SendResult } from './offlineQueue'
import { dayKey } from './logic'
import type { Chore, Completion, DayPick, TaskRow } from './db-types'

const queue = typeof localStorage !== 'undefined' ? createQueue(localStorage) : null

/** How far back we load history (covers week board + journal browsing). */
const HISTORY_DAYS = 120

async function sendOp(op: QueuedOp): Promise<SendResult> {
  try {
    if (op.kind === 'completeChore') {
      const { error } = await supabase.from('completions').insert({
        chore_id: op.payload.choreId,
        profile_id: op.payload.profileId,
        family_id: op.payload.familyId,
        day: op.payload.day,
      })
      if (!error) return 'ok'
      if (error.code === '23505') return 'already_done'
      return 'error'
    }
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'done', completed_at: new Date().toISOString() })
      .eq('id', op.payload.taskId)
    return error ? 'error' : 'ok'
  } catch {
    return 'error'
  }
}

export interface FamilyData {
  chores: Chore[]
  completions: Completion[]
  tasks: TaskRow[]
  dayPicks: DayPick[]
  loading: boolean
  refetch: () => Promise<void>
  completeChore: (choreId: string, profileId: string) => Promise<'ok' | 'already_done' | 'queued'>
  completeTask: (taskId: string) => Promise<'ok' | 'queued'>
  revokeCompletion: (completionId: string, parentProfileId: string) => Promise<void>
  addDayPick: (choreId: string, profileId: string, childId?: string | null, remindAt?: string | null) => Promise<void>
  removeDayPick: (choreId: string, day: string) => Promise<void>
  notify: (kind: 'completion', body: { profileId: string; title: string }) => void
}

export function useFamilyData(familyId: string | null): FamilyData {
  const [chores, setChores] = useState<Chore[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [dayPicks, setDayPicks] = useState<DayPick[]>([])
  const [loading, setLoading] = useState(true)
  const familyRef = useRef(familyId)
  familyRef.current = familyId

  const refetch = useCallback(async () => {
    if (!familyRef.current) return
    const since = new Date()
    since.setDate(since.getDate() - HISTORY_DAYS)
    const [c1, c2, c3, c4] = await Promise.all([
      supabase.from('chores').select('*').order('sort'),
      supabase.from('completions').select('*').gte('day', dayKey(since)),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('day_picks').select('*').gte('day', dayKey(since)),
    ])
    if (c1.data) setChores(c1.data)
    if (c2.data) setCompletions(c2.data)
    if (c3.data) setTasks(c3.data)
    if (c4.data) setDayPicks(c4.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!familyId) return
    refetch()
    const channel = supabase
      .channel('family-data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'completions' }, refetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chores' }, refetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, refetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'day_picks' }, refetch)
      .subscribe()

    const flush = () => queue?.flush(sendOp).then(refetch)
    window.addEventListener('online', flush)
    flush()
    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('online', flush)
    }
  }, [familyId, refetch])

  const notify = useCallback((kind: 'completion', body: { profileId: string; title: string }) => {
    // fire-and-forget push to parents; failures are fine
    supabase.functions.invoke('send-push', { body: { kind, ...body } }).catch(() => {})
  }, [])

  const completeChore = useCallback(
    async (choreId: string, profileId: string) => {
      const fam = familyRef.current!
      const day = dayKey(new Date())
      const op: QueuedOp = {
        kind: 'completeChore',
        payload: { choreId, profileId, familyId: fam, day },
        queuedAt: new Date().toISOString(),
      }
      const result = await sendOp(op)
      if (result === 'ok') {
        await refetch()
        return 'ok'
      }
      if (result === 'already_done') return 'already_done'
      queue?.push(op)
      // optimistic local row so the kid sees it done
      setCompletions((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          chore_id: choreId,
          profile_id: profileId,
          family_id: fam,
          completed_at: new Date().toISOString(),
          day,
          revoked_by: null,
        },
      ])
      return 'queued'
    },
    [refetch],
  )

  const completeTask = useCallback(
    async (taskId: string) => {
      const op: QueuedOp = {
        kind: 'completeTask',
        payload: { taskId },
        queuedAt: new Date().toISOString(),
      }
      const result = await sendOp(op)
      if (result === 'ok') {
        await refetch()
        return 'ok'
      }
      queue?.push(op)
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: 'done' as const, completed_at: new Date().toISOString() } : t,
        ),
      )
      return 'queued'
    },
    [refetch],
  )

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

  const removeDayPick = useCallback(
    async (choreId: string, day: string) => {
      await supabase.from('day_picks').delete().eq('chore_id', choreId).eq('day', day)
      await refetch()
    },
    [refetch],
  )

  const revokeCompletion = useCallback(
    async (completionId: string, parentProfileId: string) => {
      await supabase
        .from('completions')
        .update({ revoked_by: parentProfileId })
        .eq('id', completionId)
      await refetch()
    },
    [refetch],
  )

  return { chores, completions, tasks, dayPicks, loading, refetch, completeChore, completeTask, revokeCompletion, addDayPick, removeDayPick, notify }
}
