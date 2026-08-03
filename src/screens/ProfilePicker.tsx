import { useSession } from '../lib/session'
import { ProfileFace } from '../components/AvatarSvg'
import { enablePush } from '../lib/push'

export function ProfilePicker() {
  const { profiles, setCurrentProfile } = useSession()

  async function pick(id: string) {
    setCurrentProfile(id)
    enablePush(id).catch(() => {})
  }

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24, paddingBottom: 40 }}>
      <h1 style={{ textAlign: 'center', fontSize: '1.9rem', color: 'var(--grape)' }}>מי את/ה? 👋</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {profiles.map((p, i) => (
          <button
            key={p.id}
            className="card"
            onClick={() => pick(p.id)}
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
              {p.role === 'parent' ? 'הורה' : 'ילד/ה'}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
