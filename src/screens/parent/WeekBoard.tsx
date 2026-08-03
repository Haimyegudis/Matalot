import { useState } from 'react'
import { useSession } from '../../lib/session'
import type { FamilyData } from '../../lib/store'
import { weekBounds, weeklyScores, dayKey } from '../../lib/logic'
import { ChoreIcon } from '../../components/icons'
import { ProfileFace } from '../../components/AvatarSvg'
import { Sheet } from '../../components/Sheet'
import type { Completion } from '../../lib/db-types'

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

export function WeekBoard({ data }: { data: FamilyData }) {
  const { profiles, currentProfile } = useSession()
  const kids = profiles.filter((p) => p.role === 'child')
  const [offset, setOffset] = useState(0)
  const [selected, setSelected] = useState<Completion | null>(null)

  const ref = new Date()
  ref.setDate(ref.getDate() + offset * 7)
  const week = weekBounds(ref)
  const scores = weeklyScores(data.completions, data.tasks, data.chores, kids, week)
  const choreById = new Map(data.chores.map((c) => [c.id, c]))
  const todayStr = dayKey(new Date())

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(week.start)
    d.setDate(d.getDate() + i)
    return d
  })

  async function revoke() {
    if (!selected) return
    await data.revokeCompletion(selected.id, currentProfile!.id)
    setSelected(null)
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn--ghost" style={{ padding: '6px 12px' }} onClick={() => setOffset(offset - 1)}>◀</button>
        <span style={{ fontWeight: 700 }}>
          {week.start.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
          {' – '}
          {days[6].toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
          {offset === 0 && ' (השבוע)'}
        </span>
        <button className="btn btn--ghost" style={{ padding: '6px 12px' }} onClick={() => setOffset(offset + 1)} disabled={offset >= 0}>▶</button>
      </div>

      {/* totals */}
      <div style={{ display: 'grid', gridTemplateColumns: `1fr ${kids.map(() => '2fr').join(' ')}`, gap: 8 }}>
        <div />
        {kids.map((k) => (
          <div key={k.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderColor: k.color }}>
            <ProfileFace profile={k} size={36} />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{k.name}</div>
              <div style={{ fontFamily: 'var(--font-display)', color: k.color }}>{scores[k.id] ?? 0} נק׳</div>
            </div>
          </div>
        ))}

        {days.map((d, di) => {
          const key = dayKey(d)
          const isToday = key === todayStr
          return (
            <div key={key} style={{ display: 'contents' }}>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: isToday ? 800 : 600,
                  color: isToday ? 'var(--grape)' : 'var(--ink-soft)',
                  alignSelf: 'center',
                }}
              >
                {DAY_NAMES[di]}
                <br />
                {d.getDate()}/{d.getMonth() + 1}
              </div>
              {kids.map((k) => {
                const cell = data.completions.filter(
                  (c) => c.profile_id === k.id && c.day === key && !c.revoked_by,
                )
                const cellTasks = data.tasks.filter(
                  (t) => t.child_id === k.id && t.status === 'done' && t.completed_at && dayKey(new Date(t.completed_at)) === key,
                )
                return (
                  <div
                    key={k.id}
                    className="card"
                    style={{
                      minHeight: 46,
                      padding: 6,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 4,
                      alignItems: 'center',
                      background: isToday ? 'rgba(139,92,246,.12)' : undefined,
                    }}
                  >
                    {cell.map((c) => (
                      <button key={c.id} onClick={() => setSelected(c)} title={choreById.get(c.chore_id)?.title}>
                        <ChoreIcon name={choreById.get(c.chore_id)?.icon ?? 'star'} size={28} />
                      </button>
                    ))}
                    {cellTasks.map((t) => (
                      <span key={t.id} title={`${t.title} (משימה)`} style={{ position: 'relative' }}>
                        <ChoreIcon name={t.icon} size={28} />
                        <span style={{ position: 'absolute', top: -4, insetInlineEnd: -4, fontSize: '0.6rem' }}>📌</span>
                      </span>
                    ))}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      <Sheet open={selected !== null} onClose={() => setSelected(null)}>
        {selected && (
          <div style={{ display: 'grid', gap: 14, textAlign: 'center', paddingBottom: 8 }}>
            <h2 style={{ fontSize: '1.2rem' }}>{choreById.get(selected.chore_id)?.title}</h2>
            <div style={{ color: 'var(--ink-soft)' }}>
              {profiles.find((p) => p.id === selected.profile_id)?.name} ·{' '}
              {new Date(selected.completed_at).toLocaleString('he-IL', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
            </div>
            <button className="btn btn--coral" onClick={revoke}>
              ביטול הביצוע (הנקודה תרד)
            </button>
            <button className="btn btn--ghost" onClick={() => setSelected(null)}>השארה</button>
          </div>
        )}
      </Sheet>
    </div>
  )
}
