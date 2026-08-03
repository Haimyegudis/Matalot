import { useState } from 'react'
import { useSession } from '../../lib/session'
import { supabase } from '../../lib/supabase'
import { hashPin } from '../../lib/pin'

export function Settings() {
  const { family, profiles, refresh } = useSession()
  const [names, setNames] = useState(Object.fromEntries(profiles.map((p) => [p.id, p.name])))
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [msg, setMsg] = useState('')

  async function saveNames() {
    for (const p of profiles) {
      if (names[p.id] !== p.name && names[p.id].trim()) {
        await supabase.from('profiles').update({ name: names[p.id].trim() }).eq('id', p.id)
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

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div className="card" style={{ padding: 16, display: 'grid', gap: 10 }}>
        <h2 style={{ fontSize: '1.1rem' }}>שמות</h2>
        {profiles.map((p) => (
          <label key={p.id} style={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {p.role === 'parent' ? 'הורה' : 'ילד/ה'}
            <input
              value={names[p.id]}
              onChange={(e) => setNames({ ...names, [p.id]: e.target.value })}
              style={{ marginTop: 4 }}
            />
          </label>
        ))}
        <button className="btn btn--teal" onClick={saveNames}>שמירת שמות</button>
      </div>

      <div className="card" style={{ padding: 16, display: 'grid', gap: 10 }}>
        <h2 style={{ fontSize: '1.1rem' }}>שינוי PIN</h2>
        <input dir="ltr" inputMode="numeric" placeholder="PIN נוכחי" value={oldPin} maxLength={6} onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))} />
        <input dir="ltr" inputMode="numeric" placeholder="PIN חדש" value={newPin} maxLength={6} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} />
        <button className="btn" onClick={changePin}>עדכון PIN</button>
      </div>

      {msg && <div style={{ textAlign: 'center', fontWeight: 700 }}>{msg}</div>}
    </div>
  )
}
