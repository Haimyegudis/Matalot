import { useState } from 'react'
import { useSession } from '../../lib/session'
import { supabase } from '../../lib/supabase'
import type { FamilyData } from '../../lib/store'
import type { Chore } from '../../lib/db-types'
import { ChoreIcon, IconPicker, ICON_LABELS } from '../../components/icons'
import { Sheet } from '../../components/Sheet'
import { NudgeCard } from './NudgeCard'
import { dayKey } from '../../lib/logic'

interface Draft {
  id?: string
  title: string
  note: string
  icon: string
  points: number
  per_day: number
  track_only: boolean
  /** null = daily, [] = general list, [0..6] = specific weekdays */
  days: number[] | null
  assigned_to: string | null
  /** "YYYY-MM-DD" the chore is scheduled onto (day_pick); '' = not scheduled */
  pickDay: string
  /** "HH:MM" reminder for the scheduled day; '' = none */
  remindTime: string
  /** the pick day that existed when the draft was opened; '' = none */
  prevPickDay: string
}

const DAY_NAMES = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']

export function ManageChores({ data }: { data: FamilyData }) {
  const { family, profiles, currentProfile } = useSession()
  const kids = profiles.filter((p) => p.role === 'child')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [busy, setBusy] = useState(false)

  const active = data.chores.filter((c) => c.active && !c.is_shower)
  const shower = data.chores.find((c) => c.is_shower)
  const todayStr = dayKey(new Date())
  // nearest current-or-future scheduling of the chore
  const upcomingPickOf = (choreId: string) =>
    data.dayPicks
      .filter((p) => p.chore_id === choreId && p.day >= todayStr)
      .sort((a, b) => (a.day < b.day ? -1 : 1))[0]

  async function saveDraft() {
    if (!draft) return
    setBusy(true)
    draft.title = draft.title.trim() || ICON_LABELS[draft.icon] || 'מטלה'
    const days = draft.pickDay ? [] : draft.days
    let choreId = draft.id
    if (draft.id) {
      await supabase
        .from('chores')
        .update({ title: draft.title, note: draft.note.trim() || null, icon: draft.icon, points: draft.points, per_day: draft.per_day, track_only: draft.track_only, days, assigned_to: draft.assigned_to })
        .eq('id', draft.id)
    } else {
      const { data: created } = await supabase
        .from('chores')
        .insert({
          family_id: family!.id,
          title: draft.title,
          note: draft.note.trim() || null,
          icon: draft.icon,
          points: draft.points,
          per_day: draft.per_day,
          track_only: draft.track_only,
          days,
          assigned_to: draft.assigned_to,
          sort: active.length,
        })
        .select()
        .single()
      choreId = created?.id
    }
    if (choreId && (draft.pickDay || draft.prevPickDay)) {
      if (draft.prevPickDay && draft.prevPickDay !== draft.pickDay) {
        await supabase.from('day_picks').delete().eq('chore_id', choreId).eq('day', draft.prevPickDay)
      }
      if (draft.pickDay) {
        await supabase.from('day_picks').delete().eq('chore_id', choreId).eq('day', draft.pickDay)
        const remindAt = draft.remindTime
          ? new Date(`${draft.pickDay}T${draft.remindTime}:00`).toISOString()
          : null
        await supabase.from('day_picks').insert({
          family_id: family!.id,
          chore_id: choreId,
          day: draft.pickDay,
          child_id: draft.assigned_to,
          remind_at: remindAt,
        })
        const d = new Date(`${draft.pickDay}T12:00:00`)
        const timeLabel =
          draft.pickDay === todayStr
            ? draft.remindTime ? `עד ${draft.remindTime}` : null
            : `${d.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric' })}${draft.remindTime ? ` בשעה ${draft.remindTime}` : ''}`
        const recipients = draft.assigned_to ? [draft.assigned_to] : kids.map((k) => k.id)
        supabase.functions
          .invoke('send-push', {
            body: { kind: 'assigned', profileIds: recipients, title: draft.title, timeLabel },
          })
          .catch(() => {})
      }
    }
    await data.refetch()
    setBusy(false)
    setDraft(null)
  }

  async function deactivate(chore: Chore) {
    await supabase.from('chores').update({ active: false }).eq('id', chore.id)
    await data.refetch()
    setDraft(null)
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {active.map((c) => (
        <button
          key={c.id}
          className="card"
          onClick={() => {
            const pick = upcomingPickOf(c.id)
            const remind = pick?.remind_at ? new Date(pick.remind_at) : null
            const pickDay = pick ? pick.day.slice(0, 10) : ''
            setDraft({
              id: c.id, title: c.title, note: c.note ?? '', icon: c.icon, points: c.points,
              per_day: c.per_day ?? 1, track_only: c.track_only ?? false, days: c.days, assigned_to: c.assigned_to,
              pickDay,
              remindTime: remind ? `${String(remind.getHours()).padStart(2, '0')}:${String(remind.getMinutes()).padStart(2, '0')}` : '',
              prevPickDay: pickDay,
            })
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', textAlign: 'start' }}
        >
          <ChoreIcon name={c.icon} size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{c.title}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
              {c.assigned_to ? `של ${kids.find((k) => k.id === c.assigned_to)?.name ?? '?'}` : 'משותפת — מי שעושה מקבל'}
              {c.track_only ? ' · בלי נקודות' : ` · +${c.points}`}
              {(c.per_day ?? 1) > 1 ? ` · ×${c.per_day} ביום` : ''}
              {c.days === null ? ' · יומית' : c.days.length === 0 ? ' · רשימה כללית' : ` · ${c.days.map((d) => DAY_NAMES[d]).join(',')}`}
              {(() => {
                const pick = upcomingPickOf(c.id)
                if (!pick) return ''
                const dayStr = pick.day.slice(0, 10)
                const label = dayStr === todayStr
                  ? 'היום'
                  : new Date(`${dayStr}T12:00:00`).toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric' })
                if (!pick.remind_at) return ` · ${label}`
                const t = new Date(pick.remind_at)
                return ` · ${label} ⏰${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`
              })()}
            </div>
          </div>
          <span style={{ color: 'var(--ink-soft)' }}>✏️</span>
        </button>
      ))}

      {shower && (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', opacity: 0.8 }}>
          <ChoreIcon name="shower" size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>מקלחת</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>מטלה קבועה — עוקבת אחרי תור המקלחת</div>
          </div>
        </div>
      )}

      <button className="btn" onClick={() => setDraft({ title: '', note: '', icon: 'star', points: 1, per_day: 1, track_only: false, days: null, assigned_to: null, pickDay: '', remindTime: '', prevPickDay: '' })}>
        ➕ מטלה חדשה
      </button>

      <NudgeCard kids={kids} familyId={family!.id} senderName={currentProfile?.name ?? ''} />

      <Sheet open={draft !== null} onClose={() => setDraft(null)}>
        {draft && (
          <div style={{ display: 'grid', gap: 12, paddingBottom: 8 }}>
            <h2 style={{ fontSize: '1.2rem' }}>{draft.id ? 'עריכת מטלה' : 'מטלה חדשה'}</h2>
            <input
              value={draft.title}
              placeholder="שם המטלה"
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <textarea
              value={draft.note}
              placeholder="הערה לילדים (אופציונלי) — למשל: לחכות שתעשה קקי"
              rows={2}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              style={{ resize: 'none' }}
            />
            <IconPicker value={draft.icon} onChange={(k) => setDraft({ ...draft, icon: k })} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 700 }}>נקודות:</span>
              <button className="btn btn--ghost" style={{ padding: '6px 14px' }} onClick={() => setDraft({ ...draft, points: Math.max(1, draft.points - 1) })}>−</button>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>{draft.points}</span>
              <button className="btn btn--ghost" style={{ padding: '6px 14px' }} onClick={() => setDraft({ ...draft, points: Math.min(99, draft.points + 1) })}>+</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 700 }}>פעמים ביום:</span>
              <button className="btn btn--ghost" style={{ padding: '6px 14px' }} onClick={() => setDraft({ ...draft, per_day: Math.max(1, draft.per_day - 1) })}>−</button>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>{draft.per_day}</span>
              <button className="btn btn--ghost" style={{ padding: '6px 14px' }} onClick={() => setDraft({ ...draft, per_day: Math.min(10, draft.per_day + 1) })}>+</button>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <span style={{ fontWeight: 700 }}>מתי מופיעה:</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {([
                  ['date', 'בתאריך'],
                  ['daily', 'כל יום'],
                  ['general', 'רשימה כללית'],
                  ['days', 'ימים מסוימים'],
                ] as const).map(([mode, label]) => {
                  const current = draft.pickDay ? 'date' : draft.days === null ? 'daily' : draft.days.length === 0 ? 'general' : 'days'
                  return (
                    <button
                      key={mode}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          pickDay: mode === 'date' ? draft.prevPickDay || todayStr : '',
                          days: mode === 'date' || mode === 'general' ? [] : mode === 'daily' ? null : [0],
                        })
                      }
                      style={{
                        flex: 1,
                        padding: '8px 6px',
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        border: current === mode ? '2.5px solid var(--grape)' : 'var(--border)',
                        background: current === mode ? 'rgba(139,92,246,.12)' : 'rgba(255,255,255,.05)',
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              {draft.pickDay && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <label style={{ fontWeight: 700, fontSize: '0.85rem', flex: 1 }}>
                    📅 תאריך
                    <input
                      type="date"
                      dir="ltr"
                      min={todayStr}
                      value={draft.pickDay}
                      onChange={(e) => setDraft({ ...draft, pickDay: e.target.value || todayStr })}
                      style={{ marginTop: 6 }}
                    />
                  </label>
                  <label style={{ fontWeight: 700, fontSize: '0.85rem', flex: 1 }}>
                    ⏰ שעה (אופציונלי)
                    <input
                      type="time"
                      dir="ltr"
                      value={draft.remindTime}
                      onChange={(e) => setDraft({ ...draft, remindTime: e.target.value })}
                      style={{ marginTop: 6 }}
                    />
                  </label>
                </div>
              )}
              {!draft.pickDay && draft.days !== null && draft.days.length > 0 && (
                <div style={{ display: 'flex', gap: 5 }}>
                  {DAY_NAMES.map((d, i) => {
                    const on = draft.days!.includes(i)
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          const next = on ? draft.days!.filter((x) => x !== i) : [...draft.days!, i]
                          setDraft({ ...draft, days: next.length === 0 ? [0] : next })
                        }}
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          fontWeight: 800,
                          border: on ? '2.5px solid var(--teal)' : 'var(--border)',
                          background: on ? 'rgba(45,212,191,.15)' : 'rgba(255,255,255,.05)',
                          color: on ? 'var(--teal)' : 'var(--ink-soft)',
                        }}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={draft.track_only}
                onChange={(e) => setDraft({ ...draft, track_only: e.target.checked })}
                style={{ width: 20, height: 20 }}
              />
              למעקב בלבד — בלי נקודות (חוגים, שיעורים)
            </label>
            <select
              value={draft.assigned_to ?? ''}
              onChange={(e) => setDraft({ ...draft, assigned_to: e.target.value || null })}
            >
              <option value="">משותפת — מי שעושה מקבל</option>
              {kids.map((k) => (
                <option key={k.id} value={k.id}>רק {k.name}</option>
              ))}
            </select>
            <button className="btn btn--teal" onClick={saveDraft} disabled={busy}>
              שמירה
            </button>
            {draft.id && (
              <button style={{ color: 'var(--bad)', fontWeight: 700 }} onClick={() => deactivate(data.chores.find((c) => c.id === draft.id)!)}>
                🗑 הסרת המטלה (ההיסטוריה נשמרת)
              </button>
            )}
          </div>
        )}
      </Sheet>
    </div>
  )
}
