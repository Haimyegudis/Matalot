import { useState } from 'react'
import { useSession } from '../lib/session'
import { ProfileFace } from '../components/AvatarSvg'
import { enablePush } from '../lib/push'
import { roleLabel, g } from '../lib/gender'
import { hashPin } from '../lib/pin'
import { Sheet } from '../components/Sheet'
import type { Profile } from '../lib/db-types'

export function ProfilePicker() {
  const { family, profiles, setCurrentProfile } = useSession()
  const [pinFor, setPinFor] = useState<Profile | null>(null)
  const [pin, setPin] = useState('')
  const [wrong, setWrong] = useState(false)

  async function pick(p: Profile) {
    if (p.role === 'parent') {
      setPin('')
      setPinFor(p)
      return
    }
    activate(p.id)
  }

  function activate(id: string) {
    setCurrentProfile(id)
    enablePush(id).catch(() => {})
  }

  async function tryPin(value: string) {
    setPin(value)
    if (value.length < 4) return
    if ((await hashPin(value)) === family!.parent_pin_hash) {
      const p = pinFor!
      setPinFor(null)
      sessionStorage.setItem('matalot.parentUnlocked', '1')
      activate(p.id)
    } else if (value.length >= 6) {
      setWrong(true)
      setPin('')
      setTimeout(() => setWrong(false), 1200)
    }
  }

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24, paddingBottom: 40 }}>
      <h1 style={{ textAlign: 'center', fontSize: '1.8rem' }}>מי מתחבר?</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {profiles.map((p, i) => (
          <button
            key={p.id}
            className="card"
            onClick={() => pick(p)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              padding: '22px 12px',
              borderColor: p.color,
              borderWidth: 3,
              animation: `pop-in .35s ease ${i * 90}ms backwards`,
            }}
          >
            <ProfileFace profile={p} size={84} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>{p.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', fontWeight: 600 }}>
              {roleLabel(p)}
              {p.role === 'parent' && ' 🔒'}
            </span>
          </button>
        ))}
      </div>

      <Sheet open={pinFor !== null} onClose={() => setPinFor(null)}>
        {pinFor && (
          <div style={{ display: 'grid', gap: 12, paddingBottom: 8, textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.15rem' }}>
              🔒 קוד PIN של {g(pinFor, 'אבא', 'אמא')} {pinFor.name}
            </h2>
            <input
              dir="ltr"
              type="password"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              value={pin}
              onChange={(e) => tryPin(e.target.value.replace(/\D/g, ''))}
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.4em' }}
            />
            {wrong && <div style={{ color: 'var(--bad)', fontWeight: 700 }}>קוד שגוי</div>}
          </div>
        )}
      </Sheet>
    </div>
  )
}
