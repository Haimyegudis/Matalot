import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../lib/session'
import type { FamilyData } from '../lib/store'
import { weekBounds, weeklyScores, dayKey } from '../lib/logic'
import { ChoreButton } from '../components/ChoreButton'
import { ScoreBar } from '../components/ScoreBar'
import { ShowerCard } from '../components/ShowerCard'
import { ChoreIcon } from '../components/icons'

export function KidHome({ data, yesterday }: { data: FamilyData; yesterday?: boolean }) {
  const { profiles, currentProfile } = useSession()
  const [toast, setToast] = useState('')
  const me = currentProfile!
  const kids = profiles.filter((p) => p.role === 'child')

  const target = new Date()
  if (yesterday) target.setDate(target.getDate() - 1)
  const day = dayKey(target)

  const scores = weeklyScores(data.completions, data.tasks, data.chores, kids, weekBounds(new Date()))

  // assignment is a designation, not a lock — kids see and may take any chore
  const activeChores = data.chores.filter((c) => c.active && !c.is_shower)
  const showerChore = data.chores.find((c) => c.is_shower && c.active)

  const dayCompletions = data.completions.filter((c) => c.day === day && !c.revoked_by)
  const nameOf = (id: string) => profiles.find((p) => p.id === id)?.name ?? '?'

  const myTasks = data.tasks.filter(
    (t) => t.child_id === me.id && (t.status === 'pending' || (t.completed_at && t.completed_at.startsWith(day))),
  )

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2400)
  }

  async function doChore(choreId: string) {
    const result = await data.completeChore(choreId, me.id)
    if (result === 'already_done') showToast('מישהו כבר עשה את זה! 😅')
    else data.notify('completion', { profileId: me.id, title: data.chores.find((c) => c.id === choreId)?.title ?? '' })
  }

  const dateLabel = target.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="screen" style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.55rem' }}>
            {yesterday ? 'אתמול' : `היי ${me.name}`}
          </h1>
          <div style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', fontWeight: 600 }}>{dateLabel}</div>
        </div>
        <Link
          to={yesterday ? '/' : '/yesterday'}
          className="btn btn--ghost"
          style={{ padding: '8px 14px', fontSize: '0.9rem', textDecoration: 'none' }}
        >
          {yesterday ? 'להיום ⬅' : 'אתמול 🕐'}
        </Link>
      </header>

      <ScoreBar kids={kids} scores={scores} currentId={me.id} />

      {!yesterday && myTasks.length > 0 && (
        <section style={{ display: 'grid', gap: 10 }}>
          <h2 style={{ fontSize: '1.05rem' }}>משימות בשבילך</h2>
          {myTasks.map((t) => (
            <div
              key={t.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                background: t.status === 'done' ? 'rgba(255,255,255,.025)' : 'linear-gradient(135deg, rgba(251,191,36,.16), rgba(255,255,255,.03) 60%)',
              }}
            >
              <ChoreIcon name={t.icon} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{t.title}</div>
                {t.remind_at && t.status === 'pending' && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--coral)', fontWeight: 700 }}>
                    ⏰ עד {new Date(t.remind_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
              {t.status === 'done' ? (
                <span style={{ color: 'var(--good)', fontWeight: 700 }}>✓ בוצע</span>
              ) : (
                <button
                  className="btn btn--coral"
                  style={{ padding: '10px 16px', fontSize: '0.95rem' }}
                  onClick={async () => {
                    await data.completeTask(t.id)
                    data.notify('completion', { profileId: me.id, title: t.title })
                  }}
                >
                  סיימתי!
                </button>
              )}
            </div>
          ))}
        </section>
      )}

      {showerChore && (
        <ShowerCard
          chore={showerChore}
          completions={data.completions}
          kids={kids}
          currentKid={me}
          day={day}
          readonly={yesterday}
          onDone={() => doChore(showerChore.id)}
        />
      )}

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {activeChores.map((chore) => {
          const rows = dayCompletions.filter((c) => c.chore_id === chore.id)
          const mine = rows.some((c) => c.profile_id === me.id)
          const names = [...new Set(rows.map((c) => nameOf(c.profile_id)))]
          const assignedOther =
            chore.assigned_to && chore.assigned_to !== me.id ? nameOf(chore.assigned_to) : null
          return (
            <ChoreButton
              key={chore.id}
              chore={chore}
              doneCount={rows.length}
              doneByNames={names}
              doneByMe={mine}
              assignedOther={assignedOther}
              readonly={yesterday}
              onDone={() => doChore(chore.id)}
            />
          )
        })}
      </section>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(var(--nav-h) + 16px)',
            insetInlineStart: '50%',
            transform: 'translateX(50%)',
            background: '#2a2440',
            color: '#fff',
            border: 'var(--border)',
            borderRadius: 999,
            padding: '10px 20px',
            fontWeight: 600,
            zIndex: 50,
            animation: 'pop-in .25s ease',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
