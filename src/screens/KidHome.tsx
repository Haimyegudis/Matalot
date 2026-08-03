import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../lib/session'
import { supabase } from '../lib/supabase'
import type { FamilyData } from '../lib/store'
import { weekBounds, weeklyScores, dayKey, pickedChoreIds, nextInTurn } from '../lib/logic'
import { g } from '../lib/gender'
import type { Chore, Profile } from '../lib/db-types'
import { ChoreButton } from '../components/ChoreButton'
import { ScoreBar } from '../components/ScoreBar'
import { ShowerCard } from '../components/ShowerCard'
import { ChoreIcon, IconPicker, ICON_LABELS } from '../components/icons'
import { Sheet } from '../components/Sheet'
import { Celebration } from '../components/Celebration'
import { playMagic } from '../lib/sound'

/** "whose turn" line for turn-taking chores, with the user's requested phrasing */
function turnPhrase(chore: Chore, kid: Profile, isSelf: boolean): string {
  const subject = isSelf ? `${kid.name}, ${g(kid, 'אתה', 'את')}` : kid.name
  if (chore.title.includes('זבל')) return `🗑 ${subject} ${g(kid, 'מוציא', 'מוציאה')} את הזבל`
  if (chore.title.includes('שלג')) return `🐕 ${subject} ${g(kid, 'מוציא', 'מוציאה')} את שלגונה לטיול`
  return isSelf ? `🔁 ${kid.name}, תורך!` : `🔁 התור של ${kid.name}`
}

export function KidHome({ data, yesterday }: { data: FamilyData; yesterday?: boolean }) {
  const { profiles, currentProfile, family } = useSession()
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

  // reaching the parent-set weekly goal fires the celebration once per week
  const [celebrating, setCelebrating] = useState(false)
  const goal = family?.points_goal ?? null
  const myScore = scores[me.id] ?? 0
  const weekKey = dayKey(weekBounds(new Date()).start)
  useEffect(() => {
    if (yesterday || me.role !== 'child' || !goal || myScore < goal) return
    const key = `celebrated:${me.id}:${weekKey}:${goal}`
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')
    setCelebrating(true)
  }, [myScore, goal, me.id, me.role, yesterday, weekKey])

  // assigned chores are exclusive to their kid; shared chores open to all.
  // days: null = fixed daily tile, [d,...] = those weekdays, [] = catalog —
  // appears only when someone pulled it into this day via the + list.
  const dow = target.getDay()
  const mine = (c: (typeof data.chores)[number]) =>
    c.active && !c.is_shower && (me.role === 'parent' || c.assigned_to === null || c.assigned_to === me.id)
  const viewerId = me.role === 'parent' ? null : me.id
  const pickedToday = pickedChoreIds(data.dayPicks, day, viewerId)
  const todayPicks = data.dayPicks.filter((p) => p.day === day)
  // catalog chores live on the board by pick scope alone — a pick for a specific
  // kid overrides the chore's permanent assignment for that day
  const activeChores = data.chores.filter(
    (c) =>
      c.active &&
      !c.is_shower &&
      (c.days !== null && c.days.length === 0
        ? pickedToday.has(c.id)
        : mine(c) && (c.days === null || c.days.includes(dow))),
  )
  // a catalog chore stays listed until it's covered for everyone it can apply to
  const coveredForAll = (choreId: string) =>
    todayPicks.some((p) => p.chore_id === choreId && p.child_id === null) ||
    kids.every((k) => todayPicks.some((p) => p.chore_id === choreId && p.child_id === k.id))
  const catalogChores = data.chores.filter(
    (c) =>
      c.days !== null &&
      c.days.length === 0 &&
      (me.role === 'parent' ? c.active && !c.is_shower && !coveredForAll(c.id) : mine(c) && !pickedToday.has(c.id)),
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

  // the server cron notifies the kid about the new pick (≤1 min)
  async function pickFromCatalog(choreId: string, childId: string | null = null) {
    await data.addDayPick(choreId, me.id, childId)
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
          // together-chores count per kid: my tile closes when I hit per_day;
          // parent's tile closes only when every kid did
          const together = !chore.single_daily && !chore.turn_taking && !chore.assigned_to
          const countOf = (pid: string) => rows.filter((c) => c.profile_id === pid).length
          const doneCount = together
            ? me.role === 'parent' && kids.length > 0
              ? Math.min(...kids.map((k) => countOf(k.id)))
              : countOf(me.id)
            : rows.length
          const remindPick = todayPicks.find(
            (p) =>
              p.chore_id === chore.id &&
              p.remind_at &&
              (p.child_id === null || me.role === 'parent' || p.child_id === me.id),
          )
          const pickedFor =
            me.role === 'parent'
              ? todayPicks.find((p) => p.chore_id === chore.id && p.child_id)?.child_id ?? null
              : null
          const nextId = chore.turn_taking && !yesterday ? nextInTurn(data.completions, chore.id, kids) : null
          const nextKid = kids.find((k) => k.id === nextId)
          // parent can remove a chore that was pulled onto today's board
          const removable =
            me.role === 'parent' && !yesterday && chore.days !== null && chore.days.length === 0
          const btn = (
            <ChoreButton
              key={removable ? undefined : chore.id}
              chore={chore}
              doneCount={doneCount}
              doneByNames={names}
              doneByMe={mine}
              assignedOther={
                pickedFor
                  ? `${nameOf(pickedFor)} היום`
                  : me.role === 'parent' && chore.assigned_to
                    ? nameOf(chore.assigned_to)
                    : null
              }
              remindLabel={
                remindPick
                  ? `⏰ עד ${new Date(remindPick.remind_at!).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
                  : null
              }
              turnLabel={nextKid ? turnPhrase(chore, nextKid, nextKid.id === me.id) : null}
              readonly={viewOnly}
              onDone={() => doChore(chore.id)}
            />
          )
          if (!removable) return btn
          return (
            <div key={chore.id} style={{ position: 'relative', display: 'grid' }}>
              {btn}
              <button
                onClick={async () => {
                  await data.removeDayPick(chore.id, day)
                  showToast('הוסרה מהיום ✓')
                }}
                aria-label="הסרה מהיום"
                style={{
                  position: 'absolute',
                  top: -7,
                  insetInlineStart: -5,
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'var(--bad, #ef4444)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'grid',
                  placeItems: 'center',
                  border: '2px solid rgba(255,255,255,.25)',
                  zIndex: 2,
                }}
              >
                ✕
              </button>
            </div>
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
                  {me.role === 'parent' ? (
                    <div style={{ display: 'grid', gap: 4 }}>
                      {[{ id: null as string | null, name: 'שניהם' }, ...kids].map((k) => {
                        const covered =
                          todayPicks.some((p) => p.chore_id === c.id && p.child_id === null) ||
                          (k.id !== null && todayPicks.some((p) => p.chore_id === c.id && p.child_id === k.id))
                        return (
                          <button
                            key={k.id ?? 'all'}
                            className="btn btn--teal"
                            disabled={covered}
                            style={{ padding: '6px 12px', fontSize: '0.8rem', opacity: covered ? 0.45 : 1 }}
                            onClick={() => pickFromCatalog(c.id, k.id)}
                          >
                            ➕ {k.name}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <button
                      className="btn btn--teal"
                      style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                      onClick={() => pickFromCatalog(c.id)}
                    >
                      ➕ להיום
                    </button>
                  )}
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

      {celebrating && goal && (
        <Celebration name={me.name} goal={goal} onClose={() => setCelebrating(false)} />
      )}

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
