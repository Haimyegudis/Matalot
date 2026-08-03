import type { ReactNode } from 'react'

/* Hand-drawn sticker-style chore icons. Consistent: 48-viewBox, plum
   outline, candy fills. Key = chores.icon value in DB. */

const S = '#2b2145'
const W = 2.6

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" aria-hidden>
      {children}
    </svg>
  )
}

export const CHORE_ICONS: Record<string, ReactNode> = {
  trash: (
    <Svg>
      <path d="M14 16h20l-2 24a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3l-2-24z" fill="#2ec4b6" stroke={S} strokeWidth={W} strokeLinejoin="round" />
      <rect x="11" y="11" width="26" height="5" rx="2.5" fill="#9bf6b0" stroke={S} strokeWidth={W} />
      <path d="M20 8h8a2 2 0 0 1 2 2v1H18v-1a2 2 0 0 1 2-2z" fill="#9bf6b0" stroke={S} strokeWidth={W} />
      <path d="M20 22v14M24 22v14M28 22v14" stroke={S} strokeWidth={W} strokeLinecap="round" />
    </Svg>
  ),
  dog: (
    <Svg>
      <path d="M12 20c-3-1-5-4-4-7 3 0 6 1 7 3" fill="#ffc53d" stroke={S} strokeWidth={W} strokeLinejoin="round" />
      <path d="M36 20c3-1 5-4 4-7-3 0-6 1-7 3" fill="#ffc53d" stroke={S} strokeWidth={W} strokeLinejoin="round" />
      <circle cx="24" cy="24" r="13" fill="#ffd97d" stroke={S} strokeWidth={W} />
      <circle cx="19" cy="21" r="1.8" fill={S} />
      <circle cx="29" cy="21" r="1.8" fill={S} />
      <ellipse cx="24" cy="27" rx="3" ry="2.2" fill={S} />
      <path d="M24 29v3m0 0c-1.5 2-4 2-5 .5M24 32c1.5 2 4 2 5 .5" stroke={S} strokeWidth={W} strokeLinecap="round" />
      <path d="M33 38c4 0 7 2 7 5H8c0-3 3-5 7-5" stroke={S} strokeWidth={W} strokeLinecap="round" />
    </Svg>
  ),
  robot: (
    <Svg>
      <rect x="10" y="14" width="28" height="20" rx="6" fill="#4cc9f0" stroke={S} strokeWidth={W} />
      <circle cx="18" cy="24" r="3" fill="#fff" stroke={S} strokeWidth={W} />
      <circle cx="30" cy="24" r="3" fill="#fff" stroke={S} strokeWidth={W} />
      <path d="M24 14V9m0 0h4" stroke={S} strokeWidth={W} strokeLinecap="round" />
      <circle cx="29" cy="9" r="2" fill="#ff6b6b" stroke={S} strokeWidth={W} />
      <path d="M14 34l-3 6m23-6l3 6" stroke={S} strokeWidth={W} strokeLinecap="round" />
      <path d="M6 42h36" stroke={S} strokeWidth={W} strokeLinecap="round" />
      <path d="M8 40c3-2 6 2 9 0s6 2 9 0 6 2 9 0" stroke="#4cc9f0" strokeWidth={W} strokeLinecap="round" />
    </Svg>
  ),
  shower: (
    <Svg>
      <path d="M14 42V14a8 8 0 0 1 16 0" stroke={S} strokeWidth={W} strokeLinecap="round" />
      <path d="M30 14h6" stroke={S} strokeWidth={W} strokeLinecap="round" />
      <path d="M33 14a7 7 0 0 1 7 7H26a7 7 0 0 1 7-7z" fill="#4cc9f0" stroke={S} strokeWidth={W} strokeLinejoin="round" />
      <path d="M28 26v2m5-2v3m5-3v2" stroke="#4cc9f0" strokeWidth={W} strokeLinecap="round" />
      <path d="M28 32v2m5-1v3m5-4v2" stroke="#4cc9f0" strokeWidth={W} strokeLinecap="round" />
    </Svg>
  ),
  dishes: (
    <Svg>
      <circle cx="22" cy="26" r="14" fill="#fff" stroke={S} strokeWidth={W} />
      <circle cx="22" cy="26" r="8" fill="#ffe3e3" stroke={S} strokeWidth={W} />
      <path d="M40 12v24" stroke={S} strokeWidth={W} strokeLinecap="round" />
      <path d="M37 12v6a3 3 0 0 0 6 0v-6" stroke={S} strokeWidth={W} strokeLinecap="round" />
      <circle cx="10" cy="12" r="3" fill="#4cc9f0" opacity="0.8" />
      <circle cx="16" cy="8" r="2" fill="#4cc9f0" opacity="0.6" />
    </Svg>
  ),
  bed: (
    <Svg>
      <path d="M6 34V16" stroke={S} strokeWidth={W} strokeLinecap="round" />
      <path d="M6 28h36v8" stroke={S} strokeWidth={W} strokeLinecap="round" />
      <path d="M6 24h14a6 6 0 0 1 6 6v-2h16a6 6 0 0 0-6-6H6z" fill="#9b5de5" stroke={S} strokeWidth={W} strokeLinejoin="round" />
      <circle cx="13" cy="22" r="4" fill="#ffd97d" stroke={S} strokeWidth={W} />
      <path d="M6 36v4m36-4v4" stroke={S} strokeWidth={W} strokeLinecap="round" />
    </Svg>
  ),
  book: (
    <Svg>
      <path d="M24 12c-4-3-10-3-15-1v26c5-2 11-2 15 1 4-3 10-3 15-1V11c-5-2-11-2-15 1z" fill="#ffc53d" stroke={S} strokeWidth={W} strokeLinejoin="round" />
      <path d="M24 12v26" stroke={S} strokeWidth={W} />
      <path d="M13 18c3-.7 6-.7 8 0m-8 6c3-.7 6-.7 8 0m6-6c3-.7 6-.7 8 0m-8 6c3-.7 6-.7 8 0" stroke={S} strokeWidth={2} strokeLinecap="round" opacity="0.55" />
    </Svg>
  ),
  star: (
    <Svg>
      <path d="M24 6l5.3 10.8 11.9 1.7-8.6 8.4 2 11.8L24 33l-10.6 5.7 2-11.8-8.6-8.4 11.9-1.7z" fill="#ffc53d" stroke={S} strokeWidth={W} strokeLinejoin="round" />
      <circle cx="20" cy="21" r="1.6" fill={S} />
      <circle cx="28" cy="21" r="1.6" fill={S} />
      <path d="M21 26c2 1.8 4 1.8 6 0" stroke={S} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  ),
  broom: (
    <Svg>
      <path d="M34 6L20 24" stroke={S} strokeWidth={W} strokeLinecap="round" />
      <path d="M22 22c-6 2-10 8-11 16 8 1 15-1 19-6z" fill="#ffc53d" stroke={S} strokeWidth={W} strokeLinejoin="round" />
      <path d="M17 30l-2 6m7-4l-3 6" stroke={S} strokeWidth={2.2} strokeLinecap="round" />
      <circle cx="38" cy="10" r="2" fill="#9b5de5" />
      <circle cx="42" cy="18" r="1.5" fill="#2ec4b6" />
    </Svg>
  ),
  plant: (
    <Svg>
      <path d="M24 26V14" stroke={S} strokeWidth={W} strokeLinecap="round" />
      <path d="M24 18c-6 0-9-4-9-9 6 0 9 3 9 9z" fill="#9bf6b0" stroke={S} strokeWidth={W} strokeLinejoin="round" />
      <path d="M24 20c6 0 9-4 9-9-6 0-9 3-9 9z" fill="#2ec4b6" stroke={S} strokeWidth={W} strokeLinejoin="round" />
      <path d="M14 28h20l-2.5 12a3 3 0 0 1-3 2.5h-9a3 3 0 0 1-3-2.5z" fill="#ff6b6b" stroke={S} strokeWidth={W} strokeLinejoin="round" />
    </Svg>
  ),
  laundry: (
    <Svg>
      <rect x="9" y="8" width="30" height="32" rx="5" fill="#fff" stroke={S} strokeWidth={W} />
      <circle cx="24" cy="27" r="9" fill="#4cc9f0" stroke={S} strokeWidth={W} />
      <path d="M17 27c2-3 5 3 7 0s5 3 7 0" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
      <circle cx="15" cy="13" r="1.8" fill="#ff6b6b" />
      <circle cx="21" cy="13" r="1.8" fill="#ffc53d" />
    </Svg>
  ),
  toys: (
    <Svg>
      <rect x="8" y="20" width="18" height="18" rx="4" fill="#ff6b6b" stroke={S} strokeWidth={W} />
      <path d="M8 28h18" stroke={S} strokeWidth={W} />
      <path d="M15 28v-4h4v4" stroke={S} strokeWidth={W} />
      <circle cx="33" cy="17" r="8" fill="#ffc53d" stroke={S} strokeWidth={W} />
      <path d="M29 15l2 2 4-4" stroke={S} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
}

export const ICON_KEYS = Object.keys(CHORE_ICONS)

export function ChoreIcon({ name, size }: { name: string; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', width: size ?? 40, height: size ?? 40 }}>
      {CHORE_ICONS[name] ?? CHORE_ICONS.star}
    </span>
  )
}
