import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'היום', emoji: '⚡' },
  { to: '/yesterday', label: 'אתמול', emoji: '🕐' },
  { to: '/calendar', label: 'יומן', emoji: '📅' },
  { to: '/profile', label: 'פרופיל', emoji: '👤' },
]

export function BottomNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        insetInlineStart: '50%',
        transform: 'translateX(50%)',
        width: '100%',
        maxWidth: 520,
        height: 'var(--nav-h)',
        background: 'var(--paper)',
        borderTop: 'var(--border)',
        display: 'flex',
        zIndex: 20,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === '/'}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            textDecoration: 'none',
            color: isActive ? 'var(--grape)' : 'var(--ink-soft)',
            fontWeight: 700,
            fontSize: '0.8rem',
            borderTop: isActive ? '3.5px solid var(--grape)' : '3.5px solid transparent',
            marginTop: -2.5,
          })}
        >
          <span style={{ fontSize: '1.5rem' }}>{t.emoji}</span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}
