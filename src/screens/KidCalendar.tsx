import { useState } from 'react'
import { useSession } from '../lib/session'
import type { FamilyData } from '../lib/store'
import { dayKey, chorePointsMap } from '../lib/logic'
import { Sheet } from '../components/Sheet'
import { ChoreIcon } from '../components/icons'
import { ProfileFace } from '../components/AvatarSvg'

const WEEKDAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

export function KidCalendar({ data }: { data: FamilyData }) {
  const { currentProfile, profiles } = useSession()
  const me = currentProfile!
  const isParent = me.role === 'parent'
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [kidFilter, setKidFilter] = useState<string | null>(null)
  const kids = profiles.filter((p) => p.role === 'child')

  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leading = first.getDay()

  const chorePoints = chorePointsMap(data.chores)
  const choreById = new Map(data.chores.map((c) => [c.id, c]))
  const nameOf = (id: string) => profiles.find((p) => p.id === id)?.name ?? '?'

  // parent sees everyone (with optional per-kid filter); kid sees only their own
  const scopeId = isParent ? kidFilter : me.id
  const scopedCompletions = data.completions.filter(
    (c) => !c.revoked_by && (scopeId ? c.profile_id === scopeId : isParent),
  )
  const scopedTasks = data.tasks.filter(
    (t) => t.status === 'done' && t.completed_at && (scopeId ? t.child_id === scopeId : isParent),
  )

  const pointsPerDay = new Map<string, number>()
  for (const c of scopedCompletions) {
    pointsPerDay.set(c.day, (pointsPerDay.get(c.day) ?? 0) + (chorePoints.get(c.chore_id) ?? 0))
  }
  for (const t of scopedTasks) {
    const d = dayKey(new Date(t.completed_at!))
    pointsPerDay.set(d, (pointsPerDay.get(d) ?? 0) + t.points)
  }
  const activityDays = new Set([
    ...scopedCompletions.map((c) => c.day),
    ...scopedTasks.map((t) => dayKey(new Date(t.completed_at!))),
  ])

  function prevMonth() {
    if (month === 0) { setYear(year - 1); setMonth(11) } else setMonth(month - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(year + 1); setMonth(0) } else setMonth(month + 1)
  }

  const selCompletions = selected
    ? scopedCompletions
        .filter((c) => c.day === selected)
        .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())
    : []
  const selTasks = selected
    ? scopedTasks.filter((t) => dayKey(new Date(t.completed_at!)) === selected)
    : []

  async function removeCompletion(id: string) {
    await data.revokeCompletion(id, me.id)
    setConfirmId(null)
  }

  return (
    <div className="screen" style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn--ghost" style={{ padding: '8px 14px' }} onClick={prevMonth}>◀</button>
        <h1 style={{ fontSize: '1.5rem' }}>{MONTHS[month]} {year}</h1>
        <button className="btn btn--ghost" style={{ padding: '8px 14px' }} onClick={nextMonth}>▶</button>
      </header>

      {isParent && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={() => setKidFilter(null)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              fontWeight: 700,
              border: kidFilter === null ? '2.5px solid var(--grape)' : 'var(--border)',
              background: kidFilter === null ? 'rgba(139,92,246,.15)' : 'rgba(255,255,255,.05)',
            }}
          >
            הכל
          </button>
          {kids.map((k) => (
            <button
              key={k.id}
              onClick={() => setKidFilter(k.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 14px 5px 8px',
                borderRadius: 999,
                fontWeight: 700,
                border: kidFilter === k.id ? `2.5px solid ${k.color}` : 'var(--border)',
                background: kidFilter === k.id ? `${k.color}22` : 'rgba(255,255,255,.05)',
              }}
            >
              <ProfileFace profile={k} size={28} />
              {k.name}
            </button>
          ))}
        </div>
      )}

      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
          {WEEKDAYS.map((d) => (
            <div key={d} style={{ fontWeight: 700, color: 'var(--ink-soft)', fontSize: '0.8rem' }}>{d}</div>
          ))}
          {Array.from({ length: leading }, (_, i) => <div key={`x${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1
            const key = dayKey(new Date(year, month, d))
            const pts = pointsPerDay.get(key) ?? 0
            const hasActivity = activityDays.has(key)
            const isToday = key === dayKey(now)
            return (
              <button
                key={d}
                onClick={() => hasActivity && setSelected(key)}
                style={{
                  aspectRatio: '1',
                  borderRadius: 12,
                  border: isToday ? '2px solid var(--grape)' : '2px solid transparent',
                  background: hasActivity ? 'rgba(251,191,36,.18)' : 'rgba(255,255,255,.045)',
                  color: hasActivity ? 'var(--sunny)' : 'var(--ink)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                {d}
                {pts > 0 && <span style={{ fontSize: '0.68rem' }}>+{pts}</span>}
              </button>
            )
          })}
        </div>
      </div>

      <Sheet open={selected !== null} onClose={() => { setSelected(null); setConfirmId(null) }}>
        {selected && (
          <div style={{ display: 'grid', gap: 10, paddingBottom: 8 }}>
            <h2 style={{ fontSize: '1.2rem' }}>
              {new Date(`${selected}T12:00:00`).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            {selCompletions.map((c) => {
              const chore = choreById.get(c.chore_id)
              const confirming = confirmId === c.id
              return (
                <div key={c.id} className="card" style={{ padding: '10px 14px', display: 'grid', gap: 8 }}>
                  <button
                    onClick={() => isParent && setConfirmId(confirming ? null : c.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'start' }}
                  >
                    <ChoreIcon name={chore?.icon ?? 'star'} size={36} />
                    <span style={{ flex: 1 }}>
                      <span style={{ fontWeight: 700, display: 'block' }}>{chore?.title}</span>
                      {isParent && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', fontWeight: 600 }}>
                          {nameOf(c.profile_id)}
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
                      {new Date(c.completed_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </button>
                  {confirming && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn--coral"
                        style={{ flex: 1, padding: '9px 10px', fontSize: '0.88rem' }}
                        onClick={() => removeCompletion(c.id)}
                      >
                        הסרה (הנקודה תרד)
                      </button>
                      <button
                        className="btn btn--ghost"
                        style={{ flex: 1, padding: '9px 10px', fontSize: '0.88rem' }}
                        onClick={() => setConfirmId(null)}
                      >
                        השארה
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            {selTasks.map((t) => (
              <div key={t.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
                <ChoreIcon name={t.icon} size={36} />
                <span style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, display: 'block' }}>{t.title} (משימה)</span>
                  {isParent && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', fontWeight: 600 }}>{nameOf(t.child_id)}</span>
                  )}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--sunny)', fontWeight: 700 }}>+{t.points}</span>
              </div>
            ))}
          </div>
        )}
      </Sheet>
    </div>
  )
}
