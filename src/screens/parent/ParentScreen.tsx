import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FamilyData } from '../../lib/store'
import { WeekBoard } from './WeekBoard'
import { ManageChores } from './ManageChores'
import { Settings } from './Settings'

const TABS = [
  { key: 'board', emoji: '📊', label: 'לוח' },
  { key: 'chores', emoji: '🧹', label: 'מטלות' },
  { key: 'settings', emoji: '⚙️', label: 'הגדרות' },
] as const

export function ParentScreen({ data }: { data: FamilyData }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('board')
  const navigate = useNavigate()

  return (
    <div className="screen" style={{ display: 'grid', gap: 14, alignContent: 'start', paddingBottom: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem' }}>מצב הורה</h1>
        <button className="btn btn--ghost" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={() => navigate('/')}>
          ✕ סגירה
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 2px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: '0.78rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              background: tab === t.key ? 'var(--grape)' : 'rgba(255,255,255,.06)',
              color: tab === t.key ? '#fff' : 'var(--ink)',
              border: 'var(--border)',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'board' && <WeekBoard data={data} />}
      {tab === 'chores' && <ManageChores data={data} />}
      {tab === 'settings' && <Settings />}
    </div>
  )
}
