import { useState } from 'react'
import { useSession } from '../../lib/session'
import { supabase } from '../../lib/supabase'
import { hashPin } from '../../lib/pin'
import { Celebration } from '../../components/Celebration'

export function Settings() {
  const { family, profiles, refresh } = useSession()
  const [goal, setGoal] = useState(family?.points_goal ? String(family.points_goal) : '')
  const [preview, setPreview] = useState(false)
  const [names, setNames] = useState(Object.fromEntries(profiles.map((p) => [p.id, p.name])))
  const [genders, setGenders] = useState<Record<string, 'male' | 'female'>>(
    Object.fromEntries(profiles.map((p) => [p.id, p.gender])),
  )
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [msg, setMsg] = useState('')

  async function saveNames() {
    for (const p of profiles) {
      const patch: { name?: string; gender?: 'male' | 'female' } = {}
      if (names[p.id] !== p.name && names[p.id].trim()) patch.name = names[p.id].trim()
      if (genders[p.id] !== p.gender) patch.gender = genders[p.id]
      if (Object.keys(patch).length > 0) {
        await supabase.from('profiles').update(patch).eq('id', p.id)
      }
    }
    await refresh()
    flash('נשמר ✓')
  }

  async function changePin() {
    if ((await hashPin(oldPin)) !== family!.parent_pin_hash) {
      flash('ה-PIN הנוכחי שגוי')
      return
    }
    if (newPin.length < 4) {
      flash('PIN חדש: לפחות 4 ספרות')
      return
    }
    await supabase.from('families').update({ parent_pin_hash: await hashPin(newPin) }).eq('id', family!.id)
    await refresh()
    setOldPin('')
    setNewPin('')
    flash('PIN עודכן ✓')
  }

  function flash(m: string) {
    setMsg(m)
    setTimeout(() => setMsg(''), 2200)
  }

  async function saveGoal() {
    const n = goal ? Math.max(1, Number(goal)) : null
    await supabase.from('families').update({ points_goal: n }).eq('id', family!.id)
    await refresh()
    flash(n ? `יעד נשמר: ${n} נקודות ✓` : 'היעד בוטל ✓')
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div className="card" style={{ padding: 16, display: 'grid', gap: 10 }}>
        <h2 style={{ fontSize: '1.1rem' }}>שמות</h2>
        {profiles.map((p) => (
          <div key={p.id} style={{ display: 'grid', gap: 6 }}>
            <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
              {p.role === 'parent' ? 'הורה' : 'ילד/ה'}
              <input
                value={names[p.id]}
                onChange={(e) => setNames({ ...names, [p.id]: e.target.value })}
                style={{ marginTop: 4 }}
              />
            </label>
            <select
              value={genders[p.id]}
              onChange={(e) => setGenders({ ...genders, [p.id]: e.target.value as 'male' | 'female' })}
            >
              <option value="male">{p.role === 'parent' ? 'אבא' : 'בן 👦'}</option>
              <option value="female">{p.role === 'parent' ? 'אמא' : 'בת 👧'}</option>
            </select>
          </div>
        ))}
        <button className="btn btn--teal" onClick={saveNames}>שמירה</button>
      </div>

      <div className="card" style={{ padding: 16, display: 'grid', gap: 10 }}>
        <h2 style={{ fontSize: '1.1rem' }}>🏆 יעד נקודות שבועי</h2>
        <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
          כשילד מגיע ליעד — מסך "כל הכבוד" עם קונפטי ולבבות. ריק = כבוי. מתאפס כל שבוע.
        </div>
        <input
          dir="ltr"
          inputMode="numeric"
          placeholder="למשל: 20"
          value={goal}
          onChange={(e) => setGoal(e.target.value.replace(/\D/g, '').slice(0, 3))}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--teal" style={{ flex: 1 }} onClick={saveGoal}>שמירה</button>
          <button className="btn btn--ghost" style={{ flex: 1 }} onClick={() => setPreview(true)}>
            תצוגה מקדימה 🎉
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 16, display: 'grid', gap: 10 }}>
        <h2 style={{ fontSize: '1.1rem' }}>שינוי PIN</h2>
        <input dir="ltr" inputMode="numeric" placeholder="PIN נוכחי" value={oldPin} maxLength={6} onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))} />
        <input dir="ltr" inputMode="numeric" placeholder="PIN חדש" value={newPin} maxLength={6} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} />
        <button className="btn" onClick={changePin}>עדכון PIN</button>
      </div>

      {msg && <div style={{ textAlign: 'center', fontWeight: 700 }}>{msg}</div>}

      {preview && (
        <Celebration
          name={profiles.find((p) => p.role === 'child')?.name ?? 'אלוף'}
          goal={goal ? Number(goal) : 20}
          onClose={() => setPreview(false)}
        />
      )}
    </div>
  )
}
