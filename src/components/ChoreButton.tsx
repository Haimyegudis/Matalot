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
      className="card"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '16px 10px 14px',
        minHeight: 132,
        background: done ? 'rgba(255,255,255,.025)' : undefined,
        boxShadow: doneByMe ? 'var(--glow-lime)' : undefined,
        transition: 'transform .1s ease, box-shadow .2s ease',
        opacity: done && !doneByMe ? 0.55 : 1,
      }}
    >
      <span style={{ filter: done ? 'grayscale(0.75) opacity(0.55)' : 'none' }}>
        <ChoreIcon name={chore.icon} size={58} />
      </span>
      <span style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>{chore.title}</span>

      {done ? (
        <span style={{ fontSize: '0.8rem', color: doneByMe ? 'var(--good)' : 'var(--ink-soft)', fontWeight: 700 }}>
          {doneByMe ? '✓ בוצע' : `בוצע ע"י ${doneBy}`}
        </span>
      ) : (
        <span
          style={{
            fontSize: '0.76rem',
            background: 'rgba(251,191,36,.14)',
            color: 'var(--sunny)',
            border: '1px solid rgba(251,191,36,.35)',
            borderRadius: 999,
            padding: '2px 10px',
            fontWeight: 700,
          }}
        >
          {chore.points === 1 ? '+1' : `+${chore.points}`}
        </span>
      )}

      {doneByMe && (
        <span
          style={{
            position: 'absolute',
            top: -8,
            insetInlineEnd: -5,
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'var(--good)',
            color: '#101505',
            display: 'grid',
            placeItems: 'center',
            fontSize: '0.9rem',
            fontWeight: 800,
            boxShadow: 'var(--glow-lime)',
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
