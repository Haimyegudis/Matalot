import type { Chore, Completion, Profile } from '../lib/db-types'
import { showerFirstTonight } from '../lib/logic'
import { g } from '../lib/gender'
import { ChoreIcon } from './icons'

export function ShowerCard({
  chore, completions, kids, currentKid, day, readonly, onDone,
}: {
  chore: Chore
  completions: Completion[]
  kids: Profile[]
  currentKid: Profile
  day: string
  readonly?: boolean
  onDone: () => Promise<void>
}) {
  const todayRows = completions
    .filter((c) => c.chore_id === chore.id && c.day === day && !c.revoked_by)
    .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())
  const mine = todayRows.some((c) => c.profile_id === currentKid.id)
  const suggested = showerFirstTonight(
    completions.filter((c) => c.chore_id === chore.id),
    chore.id,
    kids,
    new Date(`${day}T12:00:00`),
  )
  const suggestedKid = kids.find((k) => k.id === suggested)
  const nameOf = (id: string) => kids.find((k) => k.id === id)?.name ?? '?'

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        background: 'linear-gradient(135deg, rgba(34,211,238,.16), rgba(255,255,255,.03) 65%)',
      }}
    >
      <span style={{ width: 52, height: 52, flexShrink: 0 }}>
        <ChoreIcon name="shower" size={52} />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>מקלחת</div>
        {todayRows.length > 0 ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', fontWeight: 600 }}>
            {todayRows.map((c, i) => `${i + 1}. ${nameOf(c.profile_id)}`).join('  ')}
          </div>
        ) : suggestedKid ? (
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--sky)' }}>
            הערב {g(suggestedKid, 'ראשון', 'ראשונה')}: {suggestedKid.name} 🚿
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>מי מתקלח ראשון הערב?</div>
        )}
      </div>
      {!readonly && (
        <button
          className={mine ? undefined : 'btn btn--teal'}
          onClick={mine ? undefined : onDone}
          disabled={mine}
          style={mine ? { color: 'var(--good)', fontWeight: 700, fontSize: '0.9rem' } : { padding: '10px 16px', fontSize: '0.95rem' }}
        >
          {mine ? '✓ התקלחתי' : 'התקלחתי!'}
        </button>
      )}
    </div>
  )
}
