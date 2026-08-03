import { useState } from 'react'
import { useSession } from '../../lib/session'
import { supabase } from '../../lib/supabase'
import type { FamilyData } from '../../lib/store'
import type { Chore } from '../../lib/db-types'
import { ChoreIcon, IconPicker, ICON_LABELS } from '../../components/icons'
import { Sheet } from '../../components/Sheet'

interface Draft {
  id?: string
  title: string
  icon: string
  points: number
  per_day: number
  track_only: boolean
  /** null = daily, [] = general list, [0..6] = specific weekdays */
  days: number[] | null
  assigned_to: string | null
}

const DAY_NAMES = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']

export function ManageChores({ data }: { data: FamilyData }) {
  const { family, profiles } = useSession()
  const kids = profiles.filter((p) => p.role === 'child')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [busy, setBusy] = useState(false)

  const active = data.chores.filter((c) => c.active && !c.is_shower)
  const shower = data.chores.find((c) => c.is_shower)

  async function saveDraft() {
    if (!draft) return
    setBusy(true)
    draft.title = draft.title.trim() || ICON_LABELS[draft.icon] || 'מטלה'
    if (draft.id) {
      await supabase
        .from('chores')
        .update({ title: draft.title, icon: draft.icon, points: draft.points, per_day: draft.per_day, track_only: draft.track_only, days: draft.days, assigned_to: draft.assigned_to })
        .eq('id', draft.id)
    } else {
      await supabase.from('chores').insert({
        family_id: family!.id,
        title: draft.title,
        icon: draft.icon,
        points: draft.points,
        per_day: draft.per_day,
        track_only: draft.track_only,
        days: draft.days,
        assigned_to: draft.assigned_to,
        sort: active.length,
      })
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
          onClick={() => setDraft({ id: c.id, title: c.title, icon: c.icon, points: c.points, per_day: c.per_day ?? 1, track_only: c.track_only ?? false, days: c.days, assigned_to: c.assigned_to })}
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

      <button className="btn" onClick={() => setDraft({ title: '', icon: 'star', points: 1, per_day: 1, track_only: false, days: [], assigned_to: null })}>
        ➕ מטלה חדשה
      </button>

      <Sheet open={draft !== null} onClose={() => setDraft(null)}>
        {draft && (
          <div style={{ display: 'grid', gap: 12, paddingBottom: 8 }}>
            <h2 style={{ fontSize: '1.2rem' }}>{draft.id ? 'עריכת מטלה' : 'מטלה חדשה'}</h2>
            <input
              value={draft.title}
              placeholder="שם המטלה"
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
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
              <div style={{ display: 'flex', gap: 6 }}>
                {([
                  ['daily', 'כל יום'],
                  ['general', 'רשימה כללית'],
                  ['days', 'ימים מסוימים'],
                ] as const).map(([mode, label]) => {
                  const current = draft.days === null ? 'daily' : draft.days.length === 0 ? 'general' : 'days'
                  return (
                    <button
                      key={mode}
                      onClick={() =>
                        setDraft({ ...draft, days: mode === 'daily' ? null : mode === 'general' ? [] : [0] })
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
              {draft.days !== null && draft.days.length > 0 && (
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
