import { useRef, useState } from 'react'
import { useSession } from '../lib/session'
import { supabase } from '../lib/supabase'
import { AvatarSvg } from '../components/AvatarSvg'
import {
  SKINS, HAIR_STYLES, HAIR_COLORS, EYE_STYLES, OUTFITS, ACCESSORIES, DEFAULT_AVATAR,
} from '../lib/avatarOptions'
import type { AvatarConfig } from '../lib/db-types'
import { enablePush } from '../lib/push'

const TABS = [
  { key: 'skin', label: 'עור' },
  { key: 'hair', label: 'שיער' },
  { key: 'eyes', label: 'עיניים' },
  { key: 'outfit', label: 'בגדים' },
  { key: 'accessory', label: 'אקססוריז' },
] as const

function Swatch({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 64,
        height: 64,
        borderRadius: 16,
        border: selected ? '3.5px solid var(--grape)' : 'var(--border)',
        background: 'var(--paper)',
        display: 'grid',
        placeItems: 'center',
        boxShadow: selected ? 'var(--pop)' : 'none',
        overflow: 'hidden',
      }}
    >
      {children}
    </button>
  )
}

export function ProfileScreen() {
  const { currentProfile, setCurrentProfile, refresh } = useSession()
  const me = currentProfile!
  const [config, setConfig] = useState<AvatarConfig>(me.avatar ?? DEFAULT_AVATAR)
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('skin')
  const [saved, setSaved] = useState(false)
  const [pushMsg, setPushMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

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
        <h1 style={{ fontSize: '1.6rem' }}>הפרופיל של {me.name} 🎨</h1>
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
          className="card"
          style={{ borderRadius: '50%', padding: 10, background: `linear-gradient(135deg, #fff, ${me.color}22)` }}
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
              background: tab === t.key ? 'var(--grape)' : 'var(--paper)',
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
              <span style={{ width: 40, height: 40, borderRadius: '50%', background: s, border: '2px solid rgba(43,33,69,.2)' }} />
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
                <span style={{ width: 40, height: 40, borderRadius: '50%', background: c }} />
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
        {tab === 'outfit' &&
          OUTFITS.map((o) => (
            <Swatch key={o.id} selected={config.outfit === o.id} onClick={() => set({ outfit: o.id })}>
              <AvatarSvg config={{ ...config, outfit: o.id }} size={56} />
            </Swatch>
          ))}
        {tab === 'accessory' && (
          <>
            <Swatch selected={config.accessory === null} onClick={() => set({ accessory: null })}>
              <span style={{ fontSize: '1.4rem' }}>🚫</span>
            </Swatch>
            {ACCESSORIES.map((a) => (
              <Swatch key={a} selected={config.accessory === a} onClick={() => set({ accessory: a })}>
                <AvatarSvg config={{ ...config, accessory: a }} size={56} />
              </Swatch>
            ))}
          </>
        )}
      </div>

      <button
        className="btn btn--teal"
        onClick={async () => {
          const ok = await enablePush(me.id)
          setPushMsg(ok ? 'התראות פועלות! 🔔' : 'לא ניתן להפעיל התראות במכשיר זה')
          setTimeout(() => setPushMsg(''), 2500)
        }}
      >
        🔔 הפעלת התראות במכשיר הזה
      </button>
      {pushMsg && <div style={{ textAlign: 'center', fontWeight: 700 }}>{pushMsg}</div>}
    </div>
  )
}
