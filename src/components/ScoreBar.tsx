import type { Profile } from '../lib/db-types'
import { ProfileFace } from './AvatarSvg'

export function ScoreBar({
  kids, scores, currentId,
}: {
  kids: Profile[]
  scores: Record<string, number>
  currentId?: string
}) {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '12px 8px',
        background: 'linear-gradient(135deg, #fff 60%, rgba(255,197,61,.25))',
      }}
    >
      {kids.map((k) => (
        <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ animation: k.id === currentId ? 'wiggle 2.5s ease-in-out infinite' : 'none' }}>
            <ProfileFace profile={k} size={46} />
          </span>
          <div style={{ textAlign: 'start' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', fontWeight: 600 }}>{k.name}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: k.color, lineHeight: 1 }}>
              {scores[k.id] ?? 0} <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>נק׳</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
