import { useMemo } from 'react'
import { createAvatar } from '@dicebear/core'
import { adventurer } from '@dicebear/collection'
import type { AvatarConfig, Profile } from '../lib/db-types'
import { normalizeAvatar } from '../lib/avatarOptions'

export function avatarSvgString(config: AvatarConfig | null): string {
  const c = normalizeAvatar(config)
  return createAvatar(adventurer, {
    skinColor: [c.skin],
    hairColor: [c.hairColor],
    hair: [c.hair] as never,
    eyes: [c.eyes] as never,
    mouth: [c.mouth] as never,
    glasses: (c.glasses ? [c.glasses] : []) as never,
    glassesProbability: c.glasses ? 100 : 0,
    earrings: (c.earrings ? [c.earrings] : []) as never,
    earringsProbability: c.earrings ? 100 : 0,
  }).toString()
}

export function AvatarSvg({ config, size = 64 }: { config: AvatarConfig | null; size?: number }) {
  const uri = useMemo(
    () => `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvgString(config))}`,
    [config],
  )
  return <img src={uri} width={size} height={size} alt="" style={{ display: 'block' }} />
}

/** Photo if set, else avatar — round token used all over the app. */
export function ProfileFace({ profile, size = 56 }: { profile: Profile; size?: number }) {
  if (profile.photo_url) {
    return (
      <img
        src={profile.photo_url}
        alt={profile.name}
        width={size}
        height={size}
        style={{
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid rgba(255,255,255,.14)',
          display: 'block',
        }}
      />
    )
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        background: '#efeaff',
        border: '2px solid rgba(255,255,255,.14)',
      }}
    >
      <AvatarSvg config={profile.avatar} size={size} />
    </span>
  )
}
