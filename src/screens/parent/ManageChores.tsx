import { useState } from 'react'
import { useSession } from '../../lib/session'
import { supabase } from '../../lib/supabase'
import type { FamilyData } from '../../lib/store'
import type { Chore } from '../../lib/db-types'
import { ChoreIcon, ICON_KEYS } from '../../components/icons'
import { Sheet } from '../../components/Sheet'

interface Draft {
  id?: string
  title: string
  icon: string
  points: number
  per_day: number
  assigned_to: string | null
}

export function ManageChores({ data }: { data: FamilyData }) {
  const { family, profiles } = useSession()
  const kids = profiles.filter((p) => p.role === 'child')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [busy, setBusy] = useState(false)

  const active = data.chores.filter((c) => c.active && !c.is_shower)
  const shower = data.chores.find((c) => c.is_shower)

  async function saveDraft() {
    if (!draft || !draft.title.trim()) return
    setBusy(true)
    if (draft.id) {
      await supabase
        .from('chores')
        .update({ title: draft.title, icon: draft.icon, points: draft.points, per_day: draft.per_day, assigned_to: draft.assigned_to })
        .eq('id', draft.id)
    } else {
      await supabase.from('chores').insert({
        family_id: family!.id,
        title: draft.title,
        icon: draft.icon,
        points: draft.points,
        per_day: draft.per_day,
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
          onClick={() => setDraft({ id: c.id, title: c.title, icon: c.icon, points: c.points, per_day: c.per_day ?? 1, assigned_to: c.assigned_to })}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', textAlign: 'start' }}
        >
          <ChoreIcon name={c.icon} size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{c.title}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
              {c.assigned_to ? `של ${kids.find((k) => k.id === c.assigned_to)?.name ?? '?'}` : 'משותפת — מי שעושה מקבל'}
              {' · '}+{c.points}
              {(c.per_day ?? 1) > 1 ? ` · ×${c.per_day} ביום` : ''}
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

      <button className="btn" onClick={() => setDraft({ title: '', icon: 'star', points: 1, per_day: 1, assigned_to: null })}>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ICON_KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => setDraft({ ...draft, icon: k })}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    border: draft.icon === k ? '3px solid var(--grape)' : 'var(--border)',
                    background: 'var(--paper)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <ChoreIcon name={k} size={38} />
                </button>
              ))}
            </div>
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
            <select
              value={draft.assigned_to ?? ''}
              onChange={(e) => setDraft({ ...draft, assigned_to: e.target.value || null })}
            >
              <option value="">משותפת — מי שעושה מקבל</option>
              {kids.map((k) => (
                <option key={k.id} value={k.id}>רק {k.name}</option>
              ))}
            </select>
            <button className="btn btn--teal" onClick={saveDraft} disabled={busy || !draft.title.trim()}>
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
