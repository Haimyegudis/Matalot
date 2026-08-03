import { useState } from 'react'
import type { Chore } from '../lib/db-types'
import { ChoreIcon } from './icons'
import { Burst } from './Burst'

interface Props {
  chore: Chore
  /** name of whoever already did it (shared chores), null if open */
  doneBy: string | null
  /** current kid already did it */
  doneByMe: boolean
  readonly?: boolean
  onDone: () => Promise<void>
}

export function ChoreButton({ chore, doneBy, doneByMe, readonly, onDone }: Props) {
  const [bursting, setBursting] = useState(false)
  const [busy, setBusy] = useState(false)
  const done = doneByMe || doneBy !== null

  async function handleTap() {
    if (done || readonly || busy) return
    setBusy(true)
    setBursting(true)
    try {
      await onDone()
    } finally {
      setBusy(false)
      setTimeout(() => setBursting(false), 950)
    }
  }

  return (
    <button
      onClick={handleTap}
      disabled={readonly && !done}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '18px 10px 14px',
        minHeight: 132,
        background: done ? 'rgba(43,33,69,.05)' : 'var(--paper)',
        border: 'var(--border)',
        borderRadius: 'var(--r-md)',
        boxShadow: done ? 'none' : 'var(--pop)',
        transition: 'transform .08s ease, box-shadow .08s ease',
        opacity: done && !doneByMe ? 0.75 : 1,
      }}
    >
      <span
        style={{
          width: 56,
          height: 56,
          filter: done ? 'grayscale(0.7) opacity(0.6)' : 'none',
          animation: done ? 'none' : 'float-slow 3.2s ease-in-out infinite',
        }}
      >
        <ChoreIcon name={chore.icon} size={56} />
      </span>
      <span style={{ fontWeight: 600, fontSize: '0.98rem', lineHeight: 1.2 }}>{chore.title}</span>

      {done ? (
        <span style={{ fontSize: '0.8rem', color: doneByMe ? 'var(--good)' : 'var(--ink-soft)', fontWeight: 600 }}>
          {doneByMe ? '✓ עשיתי!' : `בוצע ע"י ${doneBy}`}
        </span>
      ) : (
        <span
          style={{
            fontSize: '0.78rem',
            background: 'var(--sunny)',
            border: '2px solid rgba(43,33,69,.16)',
            borderRadius: 999,
            padding: '2px 10px',
            fontWeight: 700,
          }}
        >
          {chore.points === 1 ? 'נקודה' : `${chore.points} נקודות`}
        </span>
      )}

      {doneByMe && (
        <span
          style={{
            position: 'absolute',
            top: -10,
            insetInlineEnd: -6,
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'var(--good)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            fontSize: '1rem',
            border: '2.5px solid #fff',
            boxShadow: 'var(--pop)',
            animation: 'pop-in .3s ease',
          }}
        >
          ✓
        </span>
      )}
      {bursting && <Burst />}
    </button>
  )
}
