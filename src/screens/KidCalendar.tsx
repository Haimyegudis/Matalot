import { useState } from 'react'
import { useSession } from '../lib/session'
import type { FamilyData } from '../lib/store'
import { dayKey, chorePointsMap } from '../lib/logic'
import { Sheet } from '../components/Sheet'
import { ChoreIcon } from '../components/icons'

const WEEKDAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']

export function KidCalendar({ data }: { data: FamilyData }) {
  const { currentProfile } = useSession()
  const me = currentProfile!
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState<string | null>(null)

  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leading = first.getDay()

  const chorePoints = chorePointsMap(data.chores)
  const choreById = new Map(data.chores.map((c) => [c.id, c]))

  const myCompletions = data.completions.filter((c) => c.profile_id === me.id && !c.revoked_by)
  const myDoneTasks = data.tasks.filter((t) => t.child_id === me.id && t.status === 'done' && t.completed_at)

  const pointsPerDay = new Map<string, number>()
  for (const c of myCompletions) {
    pointsPerDay.set(c.day, (pointsPerDay.get(c.day) ?? 0) + (chorePoints.get(c.chore_id) ?? 0))
  }
  for (const t of myDoneTasks) {
    const d = dayKey(new Date(t.completed_at!))
    pointsPerDay.set(d, (pointsPerDay.get(d) ?? 0) + t.points)
  }

  function prevMonth() {
    if (month === 0) { setYear(year - 1); setMonth(11) } else setMonth(month - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(year + 1); setMonth(0) } else setMonth(month + 1)
  }

  const selCompletions = selected ? myCompletions.filter((c) => c.day === selected) : []
  const selTasks = selected
    ? myDoneTasks.filter((t) => dayKey(new Date(t.completed_at!)) === selected)
    : []

  return (
    <div className="screen" style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn--ghost" style={{ padding: '8px 14px' }} onClick={prevMonth}>◀</button>
        <h1 style={{ fontSize: '1.5rem' }}>{MONTHS[month]} {year}</h1>
        <button className="btn btn--ghost" style={{ padding: '8px 14px' }} onClick={nextMonth}>▶</button>
      </header>

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
            const isToday = key === dayKey(now)
            return (
              <button
                key={d}
                onClick={() => pts > 0 && setSelected(key)}
                style={{
                  aspectRatio: '1',
                  borderRadius: 12,
                  border: isToday ? '2px solid var(--grape)' : '2px solid transparent',
                  background: pts > 0 ? 'rgba(251,191,36,.18)' : 'rgba(255,255,255,.045)',
                  color: pts > 0 ? 'var(--sunny)' : 'var(--ink)',
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

      <Sheet open={selected !== null} onClose={() => setSelected(null)}>
        {selected && (
          <div style={{ display: 'grid', gap: 10, paddingBottom: 8 }}>
            <h2 style={{ fontSize: '1.2rem' }}>
              {new Date(`${selected}T12:00:00`).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            {selCompletions.map((c) => {
              const chore = choreById.get(c.chore_id)
              return (
                <div key={c.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
                  <ChoreIcon name={chore?.icon ?? 'star'} size={36} />
                  <span style={{ flex: 1, fontWeight: 600 }}>{chore?.title}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
                    {new Date(c.completed_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })}
            {selTasks.map((t) => (
              <div key={t.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
                <ChoreIcon name={t.icon} size={36} />
                <span style={{ flex: 1, fontWeight: 600 }}>{t.title} (משימה)</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>⭐{t.points}</span>
              </div>
            ))}
          </div>
        )}
      </Sheet>
    </div>
  )
}
