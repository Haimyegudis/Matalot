import { describe, it, expect, vi } from 'vitest'
import { createQueue, type QueuedOp } from './offlineQueue'

function fakeStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
  }
}

const op = (id: string): QueuedOp => ({
  kind: 'completeChore',
  payload: { choreId: id, profileId: 'a', day: '2026-08-03' },
  queuedAt: '2026-08-03T10:00:00+03:00',
})

describe('offlineQueue', () => {
  it('push persists to storage', () => {
    const storage = fakeStorage()
    const q = createQueue(storage)
    q.push(op('c1'))
    const q2 = createQueue(storage)
    expect(q2.pending()).toHaveLength(1)
  })

  it('flush sends ops in order and drops sent ones', async () => {
    const storage = fakeStorage()
    const q = createQueue(storage)
    q.push(op('c1'))
    q.push(op('c2'))
    const sent: string[] = []
    await q.flush(async (o) => {
      sent.push(o.payload.choreId)
      return 'ok'
    })
    expect(sent).toEqual(['c1', 'c2'])
    expect(q.pending()).toHaveLength(0)
  })

  it('already_done ops are dropped, not retried', async () => {
    const storage = fakeStorage()
    const q = createQueue(storage)
    q.push(op('c1'))
    await q.flush(async () => 'already_done')
    expect(q.pending()).toHaveLength(0)
  })

  it('error keeps op queued and stops flushing later ops', async () => {
    const storage = fakeStorage()
    const q = createQueue(storage)
    q.push(op('c1'))
    q.push(op('c2'))
    const sender = vi.fn(async () => 'error' as const)
    await q.flush(sender)
    expect(sender).toHaveBeenCalledTimes(1)
    expect(q.pending()).toHaveLength(2)
  })
})
