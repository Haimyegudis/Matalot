import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { hashPin } from '../lib/pin'
import { useSession } from '../lib/session'
import { DEFAULT_AVATAR, DEFAULT_AVATAR_GIRL } from '../lib/avatarOptions'

function GenderPick({
  value, onChange, labels,
}: {
  value: 'male' | 'female'
  onChange: (v: 'male' | 'female') => void
  labels: [string, string]
}) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {(['male', 'female'] as const).map((gv, i) => (
        <button
          key={gv}
          type="button"
          onClick={() => onChange(gv)}
          style={{
            flex: 1,
            padding: '10px 8px',
            fontWeight: 700,
            borderRadius: 'var(--r-sm)',
            border: value === gv ? '3px solid var(--grape)' : 'var(--border)',
            background: value === gv ? 'rgba(155,93,229,.1)' : 'var(--paper)',
          }}
        >
          {i === 0 ? '👦 ' : '👧 '}
          {labels[i]}
        </button>
      ))}
    </div>
  )
}

/* First-run wizard: parent account → family + PIN → kids.
   Also serves as the login screen for additional devices. */

const DEFAULT_CHORES = [
  { title: 'לזרוק זבל', icon: 'trash', sort: 0 },
  { title: 'לפנות מדיח', icon: 'dishwasher', sort: 1 },
  { title: 'לנקות את רוקי', icon: 'robotvac', sort: 2 },
  { title: 'להוציא את שלג לטיול', icon: 'spitz', sort: 3 },
  { title: 'בגדים למייבש כביסה', icon: 'dryer', sort: 4 },
]

export function SetupScreen() {
  const { authed, family, refresh } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [parentName, setParentName] = useState('')
  const [pin, setPin] = useState('')
  const [parentGender, setParentGender] = useState<'male' | 'female'>('female')
  const [kid1, setKid1] = useState('')
  const [kid1Gender, setKid1Gender] = useState<'male' | 'female'>('male')
  const [kid2, setKid2] = useState('')
  const [kid2Gender, setKid2Gender] = useState<'male' | 'female'>('male')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // step 1: not authed. step 2: authed but no family yet.
  const step = !authed ? 1 : !family ? 2 : 3

  async function handleAuth() {
    setBusy(true)
    setError('')
    const { error: inErr } = await supabase.auth.signInWithPassword({ email, password })
    if (!inErr) {
      await refresh()
      setBusy(false)
      return
    }
    const { error: upErr } = await supabase.auth.signUp({ email, password })
    if (upErr) {
      setError(upErr.message === 'User already registered' ? 'סיסמה שגויה' : upErr.message)
      setBusy(false)
      return
    }
    await supabase.auth.signInWithPassword({ email, password })
    await refresh()
    setBusy(false)
  }

  async function handleCreateFamily() {
    if (!familyName || !parentName || pin.length < 4 || !kid1 || !kid2) {
      setError('נא למלא את כל השדות (PIN לפחות 4 ספרות)')
      return
    }
    setBusy(true)
    setError('')
    const { data: userData } = await supabase.auth.getUser()
    const uid = userData.user!.id
    const { data: fam, error: famErr } = await supabase
      .from('families')
      .insert({ owner_uid: uid, name: familyName, parent_pin_hash: await hashPin(pin) })
      .select()
      .single()
    if (famErr || !fam) {
      setError(famErr?.message ?? 'שגיאה')
      setBusy(false)
      return
    }
    const kidColors = ['#2ec4b6', '#ff6b6b']
    const avatarFor = (g: 'male' | 'female') => (g === 'female' ? DEFAULT_AVATAR_GIRL : DEFAULT_AVATAR)
    await supabase.from('profiles').insert([
      { family_id: fam.id, name: parentName, role: 'parent', gender: parentGender, color: '#9b5de5', sort: 0 },
      { family_id: fam.id, name: kid1, role: 'child', gender: kid1Gender, avatar: avatarFor(kid1Gender), color: kidColors[0], sort: 1 },
      { family_id: fam.id, name: kid2, role: 'child', gender: kid2Gender, avatar: avatarFor(kid2Gender), color: kidColors[1], sort: 2 },
    ])
    await supabase.from('chores').insert([
      ...DEFAULT_CHORES.map((c) => ({ ...c, family_id: fam.id })),
      { title: 'מקלחת', icon: 'shower', is_shower: true, family_id: fam.id, sort: 9 },
    ])
    await refresh()
    setBusy(false)
  }

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18, paddingBottom: 40 }}>
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '2.4rem',
            background: 'linear-gradient(135deg, var(--grape), var(--sky))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          מטלות
        </h1>
        <p style={{ color: 'var(--ink-soft)', margin: '4px 0 0' }}>
          {step === 1 ? 'מתחברים לחשבון המשפחה' : 'עוד רגע מתחילים!'}
        </p>
      </div>

      {step === 1 && (
        <div className="card" style={{ padding: 20, display: 'grid', gap: 12 }}>
          <label style={{ fontWeight: 600 }}>אימייל של ההורה</label>
          <input dir="ltr" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label style={{ fontWeight: 600 }}>סיסמה</label>
          <input dir="ltr" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn" onClick={handleAuth} disabled={busy || !email || password.length < 6}>
            {busy ? '...' : 'כניסה / הרשמה'}
          </button>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', margin: 0 }}>
            במכשיר נוסף? הכניסו את אותם פרטים — הכל יסתנכרן.
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="card" style={{ padding: 20, display: 'grid', gap: 12 }}>
          <label style={{ fontWeight: 600 }}>שם המשפחה</label>
          <input value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="משפחת..." />
          <label style={{ fontWeight: 600 }}>השם שלך (הורה)</label>
          <input value={parentName} onChange={(e) => setParentName(e.target.value)} />
          <GenderPick value={parentGender} onChange={setParentGender} labels={['אבא', 'אמא']} />
          <label style={{ fontWeight: 600 }}>קוד PIN למצב הורה</label>
          <input dir="ltr" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
          <label style={{ fontWeight: 600 }}>הילדים</label>
          <input value={kid1} onChange={(e) => setKid1(e.target.value)} placeholder="שם ילד/ה 1" />
          <GenderPick value={kid1Gender} onChange={setKid1Gender} labels={['בן', 'בת']} />
          <input value={kid2} onChange={(e) => setKid2(e.target.value)} placeholder="שם ילד/ה 2" />
          <GenderPick value={kid2Gender} onChange={setKid2Gender} labels={['בן', 'בת']} />
          <button className="btn btn--teal" onClick={handleCreateFamily} disabled={busy}>
            {busy ? '...' : 'יוצרים את המשפחה'}
          </button>
        </div>
      )}

      {error && <div style={{ color: 'var(--bad)', textAlign: 'center', fontWeight: 600 }}>{error}</div>}
    </div>
  )
}
