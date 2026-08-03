import type { AvatarConfig, Profile } from '../lib/db-types'
import { DEFAULT_AVATAR, OUTFITS } from '../lib/avatarOptions'

const S = '#2b2145'
const W = 2.4

function Hair({ style, color }: { style: string; color: string }) {
  switch (style) {
    case 'curly':
      return (
        <g fill={color} stroke={S} strokeWidth={W}>
          <circle cx="32" cy="26" r="9" />
          <circle cx="50" cy="20" r="10" />
          <circle cx="68" cy="26" r="9" />
          <circle cx="26" cy="38" r="7" />
          <circle cx="74" cy="38" r="7" />
        </g>
      )
    case 'long':
      return (
        <path
          d="M24 70V42c0-16 11-24 26-24s26 8 26 24v28c-5-3-7-9-8-16-2 4-5 6-9 7 1-5 1-9-1-13-4 7-16 9-26 6 0 8-3 13-8 16z"
          fill={color} stroke={S} strokeWidth={W} strokeLinejoin="round"
        />
      )
    case 'ponytail':
      return (
        <g fill={color} stroke={S} strokeWidth={W}>
          <path d="M28 44c-2-16 8-26 22-26s24 10 22 26c-4-8-10-12-22-12s-18 4-22 12z" strokeLinejoin="round" />
          <path d="M70 30c8 2 12 10 10 20-3 8-9 12-14 12 4-6 5-12 2-18z" strokeLinejoin="round" />
          <circle cx="71" cy="31" r="3.5" fill="#ff6b6b" />
        </g>
      )
    case 'spiky':
      return (
        <path
          d="M28 42l-4-12 9 5 3-13 6 9 8-11 6 11 8-7 1 11 9-4-5 13c-5-7-13-10-21-10s-15 2-20 8z"
          fill={color} stroke={S} strokeWidth={W} strokeLinejoin="round"
        />
      )
    case 'bangs':
      return (
        <path
          d="M26 46c-2-18 9-28 24-28s26 10 24 28l-5-3-2-8-4 7-5-9-4 8-5-9-5 9-4-7-3 8-4 3z"
          fill={color} stroke={S} strokeWidth={W} strokeLinejoin="round"
        />
      )
    case 'braids':
      return (
        <g fill={color} stroke={S} strokeWidth={W}>
          <path d="M28 44c-2-16 8-26 22-26s24 10 22 26c-4-8-10-12-22-12s-18 4-22 12z" strokeLinejoin="round" />
          <path d="M27 42c-3 8-3 18 0 26 3 1 6 1 8-1-2-8-2-17-1-24z" strokeLinejoin="round" />
          <path d="M73 42c3 8 3 18 0 26-3 1-6 1-8-1 2-8 2-17 1-24z" strokeLinejoin="round" />
          <circle cx="31" cy="69" r="3" fill="#ff6b6b" />
          <circle cx="69" cy="69" r="3" fill="#ff6b6b" />
        </g>
      )
    case 'bun':
      return (
        <g fill={color} stroke={S} strokeWidth={W}>
          <circle cx="50" cy="14" r="9" />
          <path d="M28 44c-2-16 8-26 22-26s24 10 22 26c-4-8-10-12-22-12s-18 4-22 12z" strokeLinejoin="round" />
          <circle cx="50" cy="12" r="2.5" fill="#ffc53d" />
        </g>
      )
    default: // short
      return (
        <path
          d="M27 44c-2-15 9-26 23-26s25 11 23 26c-3-9-11-14-23-14s-20 5-23 14z"
          fill={color} stroke={S} strokeWidth={W} strokeLinejoin="round"
        />
      )
  }
}

function Eyes({ style }: { style: string }) {
  switch (style) {
    case 'happy':
      return (
        <g stroke={S} strokeWidth={2.6} strokeLinecap="round" fill="none">
          <path d="M36 48c2-3 6-3 8 0" />
          <path d="M56 48c2-3 6-3 8 0" />
        </g>
      )
    case 'wink':
      return (
        <g>
          <circle cx="40" cy="48" r="3.2" fill={S} />
          <path d="M56 48c2-2.5 6-2.5 8 0" stroke={S} strokeWidth={2.6} strokeLinecap="round" fill="none" />
        </g>
      )
    case 'star':
      return (
        <g fill="#ffc53d" stroke={S} strokeWidth={1.6}>
          <path d="M40 44l1.5 3 3.3.4-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.4z" />
          <path d="M60 44l1.5 3 3.3.4-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.4z" />
        </g>
      )
    case 'lashes':
      return (
        <g>
          <circle cx="40" cy="48" r="3.2" fill={S} />
          <circle cx="60" cy="48" r="3.2" fill={S} />
          <g stroke={S} strokeWidth={1.8} strokeLinecap="round">
            <path d="M35 44l-3-2M45 44l3-2M55 44l-3-2M65 44l3-2" />
          </g>
        </g>
      )
    default: // round
      return (
        <g fill={S}>
          <circle cx="40" cy="48" r="3.2" />
          <circle cx="60" cy="48" r="3.2" />
        </g>
      )
  }
}

function OutfitDeco({ deco, y = 0 }: { deco: string; y?: number }) {
  switch (deco) {
    case 'stripes':
      return <path d={`M30 ${86 + y}h40M28 ${93 + y}h44`} stroke="rgba(255,255,255,.75)" strokeWidth={4} strokeLinecap="round" />
    case 'star':
      return <path transform={`translate(0 ${y})`} d="M50 84l2 4 4.4.6-3.2 3 .8 4.4-4-2.2-4 2.2.8-4.4-3.2-3 4.4-.6z" fill="#fff" opacity="0.9" />
    case 'heart':
      return <path transform={`translate(0 ${y})`} d="M50 96c-5-3.5-8-6.5-8-9.6 0-2.4 2-4.2 4.4-4.2 1.5 0 2.8.8 3.6 2 .8-1.2 2.1-2 3.6-2 2.4 0 4.4 1.8 4.4 4.2 0 3.1-3 6.1-8 9.6z" fill="#fff" opacity="0.9" />
    case 'zigzag':
      return <path d={`M28 ${88 + y}l6-5 6 5 6-5 6 5 6-5 6 5 6-5`} stroke="rgba(255,255,255,.75)" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    default:
      return null
  }
}

function Torso({ shape, color, deco }: { shape: string; color: string; deco: string }) {
  if (shape === 'dress') {
    return (
      <g>
        <path
          d="M32 100l8-25h20l8 25z"
          fill={color} stroke={S} strokeWidth={W} strokeLinejoin="round"
        />
        <OutfitDeco deco={deco} y={-2} />
      </g>
    )
  }
  if (shape === 'sport') {
    return (
      <g>
        <path d="M22 100c0-16 12-25 28-25s28 9 28 25z" fill={color} stroke={S} strokeWidth={W} />
        {/* sporty side stripes */}
        <path d="M30 84c2 5 3 10 3 16M70 84c-2 5-3 10-3 16" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
        <circle cx="50" cy="88" r="4.5" fill="#fff" stroke={S} strokeWidth={1.6} />
        <path d="M47 88a3 3 0 0 0 6 0M50 85v6" stroke={S} strokeWidth={1} />
      </g>
    )
  }
  return (
    <g>
      <path d="M22 100c0-16 12-25 28-25s28 9 28 25z" fill={color} stroke={S} strokeWidth={W} />
      <OutfitDeco deco={deco} />
    </g>
  )
}

function Accessory({ kind }: { kind: string | null }) {
  switch (kind) {
    case 'glasses':
      return (
        <g stroke={S} strokeWidth={2.4} fill="rgba(76,201,240,.25)">
          <circle cx="40" cy="48" r="7.5" />
          <circle cx="60" cy="48" r="7.5" />
          <path d="M47.5 48h5M32.5 47l-6-2M67.5 47l6-2" fill="none" />
        </g>
      )
    case 'cap':
      return (
        <g>
          <path d="M28 36c0-12 10-19 22-19s22 7 22 19z" fill="#ff6b6b" stroke={S} strokeWidth={W} />
          <path d="M72 36c7-1 11 1 12 4-4 2-9 2-13 1z" fill="#ff6b6b" stroke={S} strokeWidth={W} strokeLinejoin="round" />
          <circle cx="50" cy="18" r="3" fill="#ffc53d" stroke={S} strokeWidth={2} />
        </g>
      )
    case 'crown':
      return (
        <path d="M32 30l4-14 8 8 6-12 6 12 8-8 4 14z" fill="#ffc53d" stroke={S} strokeWidth={W} strokeLinejoin="round" />
      )
    case 'bow':
      return (
        <g fill="#ff8fab" stroke={S} strokeWidth={2.2} strokeLinejoin="round">
          <path d="M30 26l-10-7 2 11-2 3 10-1z" />
          <path d="M34 26l10-7-2 11 2 3-10-1z" />
          <circle cx="32" cy="27" r="3.4" fill="#ff6b6b" />
        </g>
      )
    case 'headphones':
      return (
        <g stroke={S} strokeWidth={W}>
          <path d="M26 46c-2-18 9-29 24-29s26 11 24 29" fill="none" />
          <rect x="20" y="42" width="10" height="14" rx="4" fill="#9b5de5" />
          <rect x="70" y="42" width="10" height="14" rx="4" fill="#9b5de5" />
        </g>
      )
    case 'makeup':
      return (
        <g>
          {/* lipstick smile + stronger blush */}
          <path d="M44 58c3.5 3.5 8.5 3.5 12 0" stroke="#e5484d" strokeWidth={3.4} strokeLinecap="round" fill="none" />
          <circle cx="33" cy="56" r="4.2" fill="#ff8fab" opacity="0.85" />
          <circle cx="67" cy="56" r="4.2" fill="#ff8fab" opacity="0.85" />
        </g>
      )
    case 'earrings':
      return (
        <g fill="#ffc53d" stroke={S} strokeWidth={1.4}>
          <circle cx="25" cy="55" r="3" />
          <circle cx="75" cy="55" r="3" />
        </g>
      )
    default:
      return null
  }
}

export function AvatarSvg({ config, size = 64 }: { config: AvatarConfig | null; size?: number }) {
  const c = config ?? DEFAULT_AVATAR
  const outfit = OUTFITS.find((o) => o.id === c.outfit) ?? OUTFITS[1]
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden style={{ display: 'block' }}>
      <Torso shape={outfit.shape} color={outfit.color} deco={outfit.deco} />
      {/* head */}
      <circle cx="50" cy="48" r="26" fill={c.skin} stroke={S} strokeWidth={W} />
      <Eyes style={c.eyes} />
      <path d="M45 58.5c3 2.8 7 2.8 10 0" stroke={S} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <Hair style={c.hair} color={c.hairColor} />
      <Accessory kind={c.accessory} />
    </svg>
  )
}

/** Photo if set, else avatar SVG — round token used all over the app. */
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
          border: '2.5px solid rgba(43,33,69,.16)',
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
        background: '#fff',
        border: '2.5px solid rgba(43,33,69,.16)',
      }}
    >
      <AvatarSvg config={profile.avatar} size={size} />
    </span>
  )
}
