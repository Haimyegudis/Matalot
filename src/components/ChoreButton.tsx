import { useState } from 'react'
import type { Chore } from '../lib/db-types'
import { ChoreIcon } from './icons'
import { Burst } from './Burst'

interface Props {
  chore: Chore
  /** live completions of this chore today */
  doneCount: number
  /** names of kids who completed it today (shared chores) */
  doneByNames: string[]
  /** current kid completed it at least once today */
  doneByMe: boolean
  /** name of the sibling this chore is designated to (null = mine/shared) */
  assignedOther?: string | null
  readonly?: boolean
  onDone: () => Promise<void>
}

export function ChoreButton({ chore, doneCount, doneByNames, doneByMe, assignedOther, readonly, onDone }: Props) {
  const [bursting, setBursting] = useState(false)
  const [busy, setBusy] = useState(false)
  const perDay = chore.per_day ?? 1
  const closed = doneCount >= perDay
  const started = doneCount > 0

  async function handleTap() {
    if (closed || readonly || busy) return
    setBusy(true)
    setBursting(true)
    try {
      await onDone()
    } finally {
      setBusy(false)
      setTimeout(() => setBursting(false), 950)
    }
  }

  const othersLabel = doneByNames.filter(Boolean).join(', ')

  return (
    <button
      onClick={handleTap}
      disabled={readonly && !closed}
      className="card"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '16px 10px 14px',
        minHeight: 132,
        background: closed ? 'rgba(255,255,255,.025)' : undefined,
        boxShadow: closed && doneByMe ? 'var(--glow-lime)' : undefined,
        transition: 'transform .1s ease, box-shadow .2s ease',
        opacity: closed && !doneByMe ? 0.55 : 1,
      }}
    >
      <span style={{ filter: closed ? 'grayscale(0.75) opacity(0.55)' : 'none' }}>
        <ChoreIcon name={chore.icon} size={58} />
      </span>
      <span style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>{chore.title}</span>
      {assignedOther && (
        <span style={{ fontSize: '0.7rem', color: 'var(--sky)', fontWeight: 600 }}>
          של {assignedOther}
        </span>
      )}

      {closed ? (
        <span style={{ fontSize: '0.8rem', color: doneByMe ? 'var(--good)' : 'var(--ink-soft)', fontWeight: 700 }}>
          {othersLabel ? `✓ ${othersLabel}` : '✓ בוצע'}
        </span>
      ) : started ? (
        <span style={{ display: 'grid', gap: 2, justifyItems: 'center' }}>
          <span
            style={{
              fontSize: '0.76rem',
              background: 'rgba(163,230,53,.12)',
              color: 'var(--good)',
              border: '1px solid rgba(163,230,53,.35)',
              borderRadius: 999,
              padding: '2px 10px',
              fontWeight: 700,
            }}
          >
            {doneCount}/{perDay} — אפשר שוב
          </span>
          {othersLabel && (
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', fontWeight: 600 }}>{othersLabel}</span>
          )}
        </span>
      ) : chore.track_only ? null : (
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
          {perDay > 1 ? ` ×${perDay}` : ''}
        </span>
      )}

      {closed && doneByMe && (
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
