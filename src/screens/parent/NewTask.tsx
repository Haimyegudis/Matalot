import { useState } from 'react'
import { useSession } from '../../lib/session'
import { supabase } from '../../lib/supabase'
import { IconPicker, ICON_LABELS } from '../../components/icons'

function NudgeCard({ kids, familyId, senderName }: { kids: { id: string; name: string; color: string }[]; familyId: string; senderName: string }) {
  const [childId, setChildId] = useState(kids[0]?.id ?? '')
  const [message, setMessage] = useState('')
  const [when, setWhen] = useState('')
  const [status, setStatus] = useState('')

  async function send() {
    setStatus('...')
    if (when) {
      // scheduled reminder — the cron sender delivers it at the chosen time
      const { error } = await supabase.from('nudges').insert({
        family_id: familyId,
        child_id: childId,
        message: message.trim() || 'תזכורת!',
        sender_name: senderName,
        remind_at: new Date(when).toISOString(),
      })
      setStatus(error ? 'שגיאה' : `מתוזמן ל-${new Date(when).toLocaleString('he-IL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })} ✓`)
      if (!error) { setMessage(''); setWhen('') }
      setTimeout(() => setStatus(''), 3500)
      return
    }
    const { data, error } = await supabase.functions.invoke('send-push', {
      body: { kind: 'nudge', profileId: childId, title: message.trim(), senderName },
    })
    const sent = (data as { sent?: number } | null)?.sent ?? 0
    setStatus(error ? 'שגיאה בשליחה' : sent > 0 ? 'נשלח! 📣' : 'לילד אין התראות מופעלות במכשיר (🔔 בפרופיל)')
    if (!error && sent > 0) setMessage('')
    setTimeout(() => setStatus(''), 3500)
  }

  return (
    <div className="card" style={{ padding: 16, display: 'grid', gap: 10 }}>
      <h2 style={{ fontSize: '1.1rem' }}>הקפצת התראה עכשיו 📣</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        {kids.map((k) => (
          <button
            key={k.id}
            onClick={() => setChildId(k.id)}
            className="card"
            style={{
              flex: 1,
              padding: '9px 8px',
              fontWeight: 700,
              borderColor: childId === k.id ? k.color : undefined,
              borderWidth: childId === k.id ? 3 : undefined,
              background: childId === k.id ? `${k.color}18` : undefined,
            }}
          >
            {k.name}
          </button>
        ))}
      </div>
      <input
        value={message}
        placeholder="ההודעה, למשל: שיעור פרטי עם יוליה בעוד שעה"
        onChange={(e) => setMessage(e.target.value)}
      />
      <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>
        מתי? (ריק = עכשיו)
        <input type="datetime-local" dir="ltr" value={when} onChange={(e) => setWhen(e.target.value)} style={{ marginTop: 6 }} />
      </label>
      <button className="btn btn--coral" onClick={send} disabled={!childId || status === '...'}>
        {when ? 'תזמון התראה ⏰' : 'שליחה מיידית 📣'}
      </button>
      {status && <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>{status}</div>}
    </div>
  )
}

export function NewTask({ onCreated }: { onCreated: () => void }) {
  const { family, profiles, currentProfile } = useSession()
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
    const taskTitle = title.trim() || ICON_LABELS[icon] || 'משימה'
    await supabase.from('tasks').insert({
      family_id: family!.id,
      child_id: childId,
      title: taskTitle,
      icon,
      points,
      remind_at: remindAt ? new Date(remindAt).toISOString() : null,
    })
    supabase.functions
      .invoke('send-push', {
        body: {
          kind: 'assigned',
          profileIds: [childId],
          title: taskTitle,
          timeLabel: remindAt
            ? new Date(remindAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
            : null,
        },
      })
      .catch(() => {})
    setBusy(false)
    setDone(true)
    setTimeout(() => {
      setDone(false)
      onCreated()
    }, 900)
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
    <NudgeCard kids={kids} familyId={family!.id} senderName={currentProfile?.name ?? ''} />
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
      <button className="btn" onClick={create} disabled={busy || !childId}>
        {done ? '✓ נשלחה!' : 'שליחת המשימה'}
      </button>
    </div>
    </div>
  )
}
