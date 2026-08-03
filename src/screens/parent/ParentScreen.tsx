import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FamilyData } from '../../lib/store'
import { WeekBoard } from './WeekBoard'
import { ManageChores } from './ManageChores'
import { NewTask } from './NewTask'
import { Settings } from './Settings'

const TABS = [
  { key: 'board', label: '📊 לוח שבועי' },
  { key: 'chores', label: '🧹 מטלות' },
  { key: 'task', label: '📌 משימה' },
  { key: 'settings', label: '⚙️ הגדרות' },
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

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '9px 14px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
              fontWeight: 700,
              fontSize: '0.88rem',
              background: tab === t.key ? 'var(--ink)' : 'var(--paper)',
              color: tab === t.key ? '#fff' : 'var(--ink)',
              border: 'var(--border)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'board' && <WeekBoard data={data} />}
      {tab === 'chores' && <ManageChores data={data} />}
      {tab === 'task' && <NewTask onCreated={() => setTab('board')} />}
      {tab === 'settings' && <Settings />}
    </div>
  )
}
