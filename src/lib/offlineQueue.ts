export interface QueuedOp {
  kind: 'completeChore' | 'completeTask'
  payload: Record<string, string>
  queuedAt: string
}

export type SendResult = 'ok' | 'already_done' | 'error'

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

export function createQueue(storage: StorageLike, key = 'matalot.queue') {
  let ops: QueuedOp[] = JSON.parse(storage.getItem(key) ?? '[]')

  const save = () => storage.setItem(key, JSON.stringify(ops))

  return {
    pending: () => [...ops],
    push(op: QueuedOp) {
      ops.push(op)
      save()
    },
    /** Sends ops in order. 'error' (network) keeps the op and stops. */
    async flush(sender: (op: QueuedOp) => Promise<SendResult>) {
      while (ops.length > 0) {
        const result = await sender(ops[0])
        if (result === 'error') break
        ops = ops.slice(1)
        save()
      }
    },
  }
}
