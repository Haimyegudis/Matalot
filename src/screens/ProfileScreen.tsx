import { useRef, useState } from 'react'
import { useSession } from '../lib/session'
import { supabase } from '../lib/supabase'
import { AvatarSvg } from '../components/AvatarSvg'
import {
  SKINS, HAIR_STYLES, HAIR_COLORS, EYE_STYLES, MOUTH_STYLES, GLASSES, EARRINGS, normalizeAvatar,
} from '../lib/avatarOptions'
import type { AvatarConfig } from '../lib/db-types'
import { enablePush, getPushStatus } from '../lib/push'
import { useEffect } from 'react'

const TABS = [
  { key: 'skin', label: 'עור' },
  { key: 'hair', label: 'שיער' },
  { key: 'eyes', label: 'עיניים' },
  { key: 'mouth', label: 'חיוך' },
  { key: 'extras', label: 'אקססוריז' },
] as const

function Swatch({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 62,
        height: 62,
        borderRadius: 14,
        border: selected ? '3px solid var(--grape)' : '2px solid transparent',
        background: '#efeaff',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        boxShadow: selected ? 'var(--glow-grape)' : 'none',
      }}
    >
      {children}
    </button>
  )
}

export function ProfileScreen() {
  const { currentProfile, setCurrentProfile, refresh } = useSession()
  const me = currentProfile!
  const [config, setConfig] = useState<AvatarConfig>(normalizeAvatar(me.avatar))
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('skin')
  const [saved, setSaved] = useState(false)
  const [pushMsg, setPushMsg] = useState('')
  const [pushActive, setPushActive] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getPushStatus(me.id).then((s) => setPushActive(s === 'active'))
  }, [me.id])

  async function save(next: AvatarConfig) {
    setConfig(next)
    await supabase.from('profiles').update({ avatar: next, photo_url: null }).eq('id', me.id)
    await refresh()
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
  }

  async function uploadPhoto(file: File) {
    const path = `${me.family_id}/${me.id}-${Date.now()}.jpg`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) return
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('profiles').update({ photo_url: data.publicUrl }).eq('id', me.id)
    await refresh()
  }

  const set = (patch: Partial<AvatarConfig>) => save({ ...config, ...patch })

  return (
    <div className="screen" style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem' }}>הפרופיל של {me.name}</h1>
        <button
          className="btn btn--ghost"
          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          onClick={() => setCurrentProfile(null)}
        >
          החלף משתמש
        </button>
      </header>

      <div style={{ display: 'grid', placeItems: 'center', position: 'relative' }}>
        <div
          style={{
            borderRadius: '50%',
            padding: 8,
            background: '#efeaff',
            border: 'var(--border)',
            boxShadow: `0 0 32px ${me.color}55`,
          }}
        >
          {me.photo_url ? (
            <img src={me.photo_url} alt="" width={150} height={150} style={{ borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <AvatarSvg config={config} size={150} />
          )}
        </div>
        {saved && (
          <span style={{ position: 'absolute', top: 0, insetInlineEnd: '20%', color: 'var(--good)', fontWeight: 700, animation: 'chip-rise 1.1s ease forwards' }}>
            נשמר ✓
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button className="btn btn--ghost" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={() => fileRef.current?.click()}>
          📷 תמונה שלי
        </button>
        {me.photo_url && (
          <button
            className="btn btn--ghost"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            onClick={() => save(config)}
          >
            חזרה לאוואטר
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
        />
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
              fontWeight: 700,
              background: tab === t.key ? 'var(--grape)' : 'rgba(255,255,255,.06)',
              color: tab === t.key ? '#fff' : 'var(--ink)',
              border: 'var(--border)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 14, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {tab === 'skin' &&
          SKINS.map((s) => (
            <Swatch key={s} selected={config.skin === s} onClick={() => set({ skin: s })}>
              <span style={{ width: 38, height: 38, borderRadius: '50%', background: `#${s}`, border: '2px solid rgba(0,0,0,.15)' }} />
            </Swatch>
          ))}
        {tab === 'hair' && (
          <>
            {HAIR_STYLES.map((h) => (
              <Swatch key={h} selected={config.hair === h} onClick={() => set({ hair: h })}>
                <AvatarSvg config={{ ...config, hair: h }} size={56} />
              </Swatch>
            ))}
            <div style={{ width: '100%', borderTop: 'var(--border)', margin: '4px 0' }} />
            {HAIR_COLORS.map((c) => (
              <Swatch key={c} selected={config.hairColor === c} onClick={() => set({ hairColor: c })}>
                <span style={{ width: 38, height: 38, borderRadius: '50%', background: `#${c}` }} />
              </Swatch>
            ))}
          </>
        )}
        {tab === 'eyes' &&
          EYE_STYLES.map((e) => (
            <Swatch key={e} selected={config.eyes === e} onClick={() => set({ eyes: e })}>
              <AvatarSvg config={{ ...config, eyes: e }} size={56} />
            </Swatch>
          ))}
        {tab === 'mouth' &&
          MOUTH_STYLES.map((m) => (
            <Swatch key={m} selected={config.mouth === m} onClick={() => set({ mouth: m })}>
              <AvatarSvg config={{ ...config, mouth: m }} size={56} />
            </Swatch>
          ))}
        {tab === 'extras' && (
          <>
            <Swatch selected={config.glasses === null} onClick={() => set({ glasses: null })}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#3a3455' }}>בלי משקפיים</span>
            </Swatch>
            {GLASSES.map((gl) => (
              <Swatch key={gl} selected={config.glasses === gl} onClick={() => set({ glasses: gl })}>
                <AvatarSvg config={{ ...config, glasses: gl }} size={56} />
              </Swatch>
            ))}
            <div style={{ width: '100%', borderTop: 'var(--border)', margin: '4px 0' }} />
            <Swatch selected={config.earrings === null} onClick={() => set({ earrings: null })}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#3a3455' }}>בלי עגילים</span>
            </Swatch>
            {EARRINGS.map((er) => (
              <Swatch key={er} selected={config.earrings === er} onClick={() => set({ earrings: er })}>
                <AvatarSvg config={{ ...config, earrings: er }} size={56} />
              </Swatch>
            ))}
          </>
        )}
      </div>

      {pushActive ? (
        <div
          className="card"
          style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--good)' }}
        >
          🔔 התראות פעילות במכשיר הזה ✓
        </div>
      ) : (
        <button
          className="btn btn--teal"
          onClick={async () => {
            const ok = await enablePush(me.id).catch(() => false)
            setPushActive(ok)
            setPushMsg(ok ? 'התראות פועלות 🔔' : 'ההרשאה נחסמה — אפשר התראות לאפליקציה בהגדרות אנדרואיד')
            setTimeout(() => setPushMsg(''), 4000)
          }}
        >
          🔔 הפעלת התראות במכשיר הזה
        </button>
      )}
      {pushMsg && <div style={{ textAlign: 'center', fontWeight: 700 }}>{pushMsg}</div>}
      <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--ink-soft)' }}>
        אוואטרים: Adventurer by Lisa Wischofsky (CC BY 4.0)
      </div>
    </div>
  )
}
