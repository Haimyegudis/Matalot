import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export function NudgeCard({ kids, familyId, senderName }: { kids: { id: string; name: string; color: string }[]; familyId: string; senderName: string }) {
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
      <h2 style={{ fontSize: '1.1rem' }}>הקפצת התראה 📣</h2>
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
