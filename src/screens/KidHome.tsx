import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../lib/session'
import { supabase } from '../lib/supabase'
import type { FamilyData } from '../lib/store'
import { weekBounds, weeklyScores, dayKey } from '../lib/logic'
import { ChoreButton } from '../components/ChoreButton'
import { ScoreBar } from '../components/ScoreBar'
import { ShowerCard } from '../components/ShowerCard'
import { ChoreIcon, IconPicker, ICON_LABELS } from '../components/icons'
import { Sheet } from '../components/Sheet'
import { playMagic } from '../lib/sound'

export function KidHome({ data, yesterday }: { data: FamilyData; yesterday?: boolean }) {
  const { profiles, currentProfile } = useSession()
  const [toast, setToast] = useState('')
  const [adding, setAdding] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newIcon, setNewIcon] = useState('star')
  const [newNote, setNewNote] = useState('')
  const [newAssignee, setNewAssignee] = useState<string | null>(null)
  const me = currentProfile!
  const kids = profiles.filter((p) => p.role === 'child')
  // parents watch — only kids mark completions
  const viewOnly = yesterday || me.role === 'parent'

  const target = new Date()
  if (yesterday) target.setDate(target.getDate() - 1)
  const day = dayKey(target)

  const scores = weeklyScores(data.completions, data.tasks, data.chores, kids, weekBounds(new Date()))

  // assigned chores are exclusive to their kid; shared chores open to all.
  // days: null = fixed daily tile, [d,...] = those weekdays, [] = catalog —
  // appears only when someone pulled it into this day via the + list.
  const dow = target.getDay()
  const mine = (c: (typeof data.chores)[number]) =>
    c.active && !c.is_shower && (me.role === 'parent' || c.assigned_to === null || c.assigned_to === me.id)
  const pickedToday = new Set(data.dayPicks.filter((p) => p.day === day).map((p) => p.chore_id))
  const activeChores = data.chores.filter(
    (c) =>
      mine(c) &&
      (c.days === null
        ? true
        : c.days.length > 0
          ? c.days.includes(dow)
          : pickedToday.has(c.id)),
  )
  const catalogChores = data.chores.filter(
    (c) => mine(c) && c.days !== null && c.days.length === 0 && !pickedToday.has(c.id),
  )
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
    playMagic()
    const result = await data.completeChore(choreId, me.id)
    if (result === 'already_done') showToast('מישהו כבר עשה את זה! 😅')
    else data.notify('completion', { profileId: me.id, title: data.chores.find((c) => c.id === choreId)?.title ?? '' })
  }

  const dateLabel = target.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })

  async function addChore() {
    const { data: created, error } = await supabase
      .from('chores')
      .insert({
        family_id: me.family_id,
        title: newTitle.trim() || ICON_LABELS[newIcon] || 'מטלה',
        note: newNote.trim() || null,
        icon: newIcon,
        points: 1,
        per_day: 1,
        days: [],
        assigned_to: newAssignee,
        sort: data.chores.length,
      })
      .select()
      .single()
    if (!error && created) {
      await data.addDayPick(created.id, me.id)
      setAdding(false)
      setNewTitle('')
      setNewIcon('star')
      setNewNote('')
      setNewAssignee(null)
      setCreating(false)
      showToast('המטלה נוספה! ✓')
    }
  }

  async function pickFromCatalog(choreId: string) {
    await data.addDayPick(choreId, me.id)
    showToast('נוספה להיום ✓')
  }

  return (
    <div className="screen" style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.55rem' }}>
            {yesterday ? 'אתמול' : `היי ${me.name}`}
          </h1>
          <div style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', fontWeight: 600 }}>{dateLabel}</div>
        </div>
      </header>

      {me.role === 'parent' && !yesterday && (
        <Link
          to="/parent"
          className="btn"
          style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}
        >
          🔓 כלי הורה — לוח · מטלות · התראות · הגדרות
        </Link>
      )}

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
                    playMagic()
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
          readonly={viewOnly}
          onDone={() => doChore(showerChore.id)}
        />
      )}

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {activeChores.map((chore) => {
          const rows = dayCompletions.filter((c) => c.chore_id === chore.id)
          const mine = rows.some((c) => c.profile_id === me.id)
          const names = [...new Set(rows.map((c) => nameOf(c.profile_id)))]
          return (
            <ChoreButton
              key={chore.id}
              chore={chore}
              doneCount={rows.length}
              doneByNames={names}
              doneByMe={mine}
              assignedOther={
                me.role === 'parent' && chore.assigned_to ? nameOf(chore.assigned_to) : null
              }
              readonly={viewOnly}
              onDone={() => doChore(chore.id)}
            />
          )
        })}
        {!yesterday && (
          <button
            onClick={() => setAdding(true)}
            className="card"
            style={{
              minHeight: 132,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              color: 'var(--ink-soft)',
              borderStyle: 'dashed',
              background: 'transparent',
            }}
          >
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>＋</span>
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>מטלה חדשה</span>
          </button>
        )}
      </section>

      <Sheet open={adding} onClose={() => { setAdding(false); setCreating(false) }}>
        <div style={{ display: 'grid', gap: 12, paddingBottom: 8 }}>
          <h2 style={{ fontSize: '1.15rem' }}>רשימת מטלות</h2>

          {!creating && (
            <>
              {catalogChores.length === 0 && (
                <div style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>הכל כבר על הלוח של היום 🎉</div>
              )}
              {catalogChores.map((c) => (
                <div key={c.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }}>
                  <ChoreIcon name={c.icon} size={38} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{c.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', fontWeight: 600 }}>
                      {c.track_only ? 'בלי נקודות' : `+${c.points}`}
                      {(c.per_day ?? 1) > 1 ? ` · ×${c.per_day}` : ''}
                    </div>
                  </div>
                  <button
                    className="btn btn--teal"
                    style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                    onClick={() => pickFromCatalog(c.id)}
                  >
                    ➕ להיום
                  </button>
                </div>
              ))}
              <button className="btn btn--ghost" onClick={() => setCreating(true)}>
                ✏️ מטלה חדשה לגמרי
              </button>
            </>
          )}

          {creating && (
            <>
          <input value={newTitle} placeholder="שם המטלה (לא חובה — יילקח מהאייקון)" onChange={(e) => setNewTitle(e.target.value)} />
          <textarea
            value={newNote}
            placeholder="הערה (אופציונלי) — למשל: במיוחד את החדר של מיה"
            rows={2}
            onChange={(e) => setNewNote(e.target.value)}
            style={{ resize: 'none' }}
          />
          <IconPicker value={newIcon} onChange={setNewIcon} />
          {me.role === 'parent' && (
            <div style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>למי המטלה?</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ id: null as string | null, name: 'משותפת' }, ...kids].map((k) => (
                  <button
                    key={k.id ?? 'all'}
                    onClick={() => setNewAssignee(k.id)}
                    style={{
                      flex: 1,
                      padding: '9px 8px',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      border: newAssignee === k.id ? '2.5px solid var(--grape)' : 'var(--border)',
                      background: newAssignee === k.id ? 'rgba(139,92,246,.14)' : 'rgba(255,255,255,.05)',
                    }}
                  >
                    {k.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
            {me.role === 'parent'
              ? 'תיכנס לרשימה הכללית; עריכה מלאה (נקודות, ימים) במצב הורה.'
              : 'המטלה תהיה משותפת ושווה נקודה אחת. הורה יכול לערוך אותה במצב הורה.'}
          </div>
          <button className="btn" onClick={addChore}>
            הוספה
          </button>
            </>
          )}
        </div>
      </Sheet>

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
