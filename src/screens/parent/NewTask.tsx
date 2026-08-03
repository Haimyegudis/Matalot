import { useState } from 'react'
import { useSession } from '../../lib/session'
import { supabase } from '../../lib/supabase'
import { IconPicker } from '../../components/icons'

export function NewTask({ onCreated }: { onCreated: () => void }) {
  const { family, profiles } = useSession()
  const kids = profiles.filter((p) => p.role === 'child')
  const [childId, setChildId] = useState(kids[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState('star')
  const [points, setPoints] = useState(1)
  const [remindAt, setRemindAt] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function create() {
    setBusy(true)
    await supabase.from('tasks').insert({
      family_id: family!.id,
      child_id: childId,
      title,
      icon,
      points,
      remind_at: remindAt ? new Date(remindAt).toISOString() : null,
    })
    setBusy(false)
    setDone(true)
    setTimeout(() => {
      setDone(false)
      onCreated()
    }, 900)
  }

  return (
    <div className="card" style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h2 style={{ fontSize: '1.15rem' }}>משימה חדשה 📌</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        {kids.map((k) => (
          <button
            key={k.id}
            onClick={() => setChildId(k.id)}
            className="card"
            style={{
              flex: 1,
              padding: '10px 8px',
              fontWeight: 700,
              borderColor: childId === k.id ? k.color : undefined,
              borderWidth: childId === k.id ? 3 : undefined,
              background: childId === k.id ? `${k.color}18` : 'var(--paper)',
            }}
          >
            {k.name}
          </button>
        ))}
      </div>
      <input value={title} placeholder="מה צריך לעשות?" onChange={(e) => setTitle(e.target.value)} />
      <IconPicker value={icon} onChange={setIcon} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 700 }}>נקודות:</span>
        <button className="btn btn--ghost" style={{ padding: '6px 14px' }} onClick={() => setPoints(Math.max(1, points - 1))}>−</button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>{points}</span>
        <button className="btn btn--ghost" style={{ padding: '6px 14px' }} onClick={() => setPoints(Math.min(99, points + 1))}>+</button>
      </div>
      <label style={{ fontWeight: 700 }}>
        תזכורת (אופציונלי):
        <input type="datetime-local" dir="ltr" value={remindAt} onChange={(e) => setRemindAt(e.target.value)} style={{ marginTop: 6 }} />
      </label>
      <button className="btn" onClick={create} disabled={busy || !title.trim() || !childId}>
        {done ? '✓ נשלחה!' : 'שליחת המשימה'}
      </button>
    </div>
  )
}
