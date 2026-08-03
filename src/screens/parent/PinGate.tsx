import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../lib/session'
import { hashPin } from '../../lib/pin'

const UNLOCK_KEY = 'matalot.parentUnlocked'

export function PinGate({ children }: { children: ReactNode }) {
  const { family } = useSession()
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [wrong, setWrong] = useState(false)
  const [unlocked, setUnlocked] = useState(sessionStorage.getItem(UNLOCK_KEY) === '1')

  if (unlocked) return <>{children}</>

  async function press(d: string) {
    if (d === '⌫') {
      setPin(pin.slice(0, -1))
      return
    }
    const next = pin + d
    setPin(next)
    if (next.length >= 4) {
      if ((await hashPin(next)) === family!.parent_pin_hash) {
        sessionStorage.setItem(UNLOCK_KEY, '1')
        setUnlocked(true)
      } else if (next.length >= 6) {
        setWrong(true)
        setPin('')
        setTimeout(() => setWrong(false), 900)
      }
    }
  }

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20, alignItems: 'center' }}>
      <h1 style={{ fontSize: '1.6rem' }}>🔒 מצב הורה</h1>
      <div style={{ display: 'flex', gap: 10, height: 20 }}>
        {Array.from({ length: Math.max(4, pin.length) }, (_, i) => (
          <span
            key={i}
            style={{
              width: 16, height: 16, borderRadius: '50%',
              background: i < pin.length ? 'var(--grape)' : 'rgba(255,255,255,.15)',
              animation: wrong ? 'wiggle .3s ease 2' : 'none',
            }}
          />
        ))}
      </div>
      {wrong && <div style={{ color: 'var(--bad)', fontWeight: 700 }}>קוד שגוי</div>}
      <div dir="ltr" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 12 }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((d, i) =>
          d === '' ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              className="card"
              onClick={() => press(d)}
              style={{ height: 72, fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}
            >
              {d}
            </button>
          ),
        )}
      </div>
      <button className="btn btn--ghost" style={{ padding: '8px 16px' }} onClick={() => navigate('/')}>
        חזרה
      </button>
    </div>
  )
}
