import type { ReactNode } from 'react'

/* Hand-drawn sticker-style chore icons. Consistent: 48-viewBox, plum
   outline, candy fills. Key = chores.icon value in DB.
   Drawn literal so kids instantly recognize each chore. */

const S = '#2b2145'
const W = 2.6

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" aria-hidden>
      {children}
    </svg>
  )
}

/* לזרוק זבל — full tied garbage bag + green bin */
const TrashIcon = (
  <Svg>
    <path d="M25 18h16l-1.6 20a3 3 0 0 1-3 2.8h-6.8a3 3 0 0 1-3-2.8z" fill="#2ec4b6" stroke={S} strokeWidth={W} strokeLinejoin="round" />
    <rect x="23" y="14" width="20" height="4.5" rx="2.2" fill="#9bf6b0" stroke={S} strokeWidth={W} />
    <path d="M30 24v11m6-11v11" stroke={S} strokeWidth={2.2} strokeLinecap="round" />
    <path d="M6 40c-1-7 1-13 5-15l-2-3 4-3 3 2 4-2-1 4c4 3 5 10 4 17z" fill="#6f6590" stroke={S} strokeWidth={W} strokeLinejoin="round" />
    <path d="M11 22l4-2" stroke={S} strokeWidth={2} strokeLinecap="round" />
    <path d="M10 30c3-1.5 7-1.5 10 0" stroke="rgba(255,255,255,.5)" strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
)

/* לפנות מדיח — open dishwasher, rack with plates pulled out */
const DishwasherIcon = (
  <Svg>
    <rect x="8" y="6" width="32" height="24" rx="4" fill="#4cc9f0" stroke={S} strokeWidth={W} />
    <circle cx="13.5" cy="11" r="1.8" fill="#fff" />
    <circle cx="19" cy="11" r="1.8" fill="#fff" />
    <rect x="12" y="16" width="24" height="10" rx="2" fill="#dff6ff" stroke={S} strokeWidth={2} />
    <path d="M8 30h32l-4 6H12z" fill="#9bd9f0" stroke={S} strokeWidth={W} strokeLinejoin="round" />
    <g stroke={S} strokeWidth={2}>
      <circle cx="17" cy="33" r="3.6" fill="#fff" />
      <circle cx="25" cy="33" r="3.6" fill="#ffe3e3" />
      <circle cx="33" cy="33" r="3.6" fill="#fff" />
    </g>
    <path d="M14 42h20" stroke={S} strokeWidth={W} strokeLinecap="round" />
  </Svg>
)

/* לנקות את רוקי — round robot mop with face, water sparkle trail */
const RobotVacIcon = (
  <Svg>
    <path d="M8 30a16 9 0 0 1 32 0z" fill="#9b5de5" stroke={S} strokeWidth={W} strokeLinejoin="round" />
    <path d="M8 30h32v3a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill="#7a4fd0" stroke={S} strokeWidth={W} strokeLinejoin="round" />
    <circle cx="19" cy="26" r="2.2" fill="#fff" />
    <circle cx="29" cy="26" r="2.2" fill="#fff" />
    <path d="M21 30c2 1.6 4 1.6 6 0" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
    <circle cx="24" cy="17" r="2.4" fill="#ffc53d" stroke={S} strokeWidth={2} />
    <path d="M24 19v3" stroke={S} strokeWidth={2} />
    <path d="M10 42c2-2 4-2 6 0m6-1c2-2 4-2 6 0m6 1c2-2 4-2 6 0" stroke="#4cc9f0" strokeWidth={2.4} strokeLinecap="round" />
    <path d="M40 20l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.3 1.3.4-2.6-1.9-1.8 2.6-.4z" fill="#4cc9f0" />
  </Svg>
)

/* להוציא את שלג — white Japanese Spitz with pointy ears, curled tail, leash */
const SpitzIcon = (
  <Svg>
    <path d="M13 14l-2-8 7 4z" fill="#fff" stroke={S} strokeWidth={W} strokeLinejoin="round" />
    <path d="M31 14l2-8-7 4z" fill="#fff" stroke={S} strokeWidth={W} strokeLinejoin="round" />
    <circle cx="22" cy="20" r="11" fill="#fff" stroke={S} strokeWidth={W} />
    <path d="M14 33c-3 3 4 9 8 9s11-6 8-9c3-4 2-8-2-9-3 5-9 5-12 0-4 1-5 5-2 9z" fill="#fff" stroke={S} strokeWidth={W} strokeLinejoin="round" />
    <path d="M36 34c4-1 6-5 5-9-4 0-7 3-7 6" fill="#fff" stroke={S} strokeWidth={W} strokeLinejoin="round" />
    <circle cx="18" cy="19" r="1.7" fill={S} />
    <circle cx="26" cy="19" r="1.7" fill={S} />
    <ellipse cx="22" cy="23.5" rx="2.4" ry="1.9" fill={S} />
    <path d="M22 25.4v2.2m0 0c-1.3 1.6-3.4 1.6-4.4.3m4.4-.3c1.3 1.6 3.4 1.6 4.4.3" stroke={S} strokeWidth={2} strokeLinecap="round" />
    <path d="M31 17c4-3 8-4 11-3 0 3-2 5-5 6" stroke="#ff6b6b" strokeWidth={2.4} strokeLinecap="round" fill="none" />
    <circle cx="42" cy="14" r="2.6" fill="none" stroke="#ff6b6b" strokeWidth={2.4} />
  </Svg>
)

/* לשים כביסה במייבש — front-load dryer, warm tumbling clothes + heat waves */
const DryerIcon = (
  <Svg>
    <rect x="9" y="8" width="30" height="32" rx="5" fill="#fff" stroke={S} strokeWidth={W} />
    <circle cx="24" cy="27" r="9.5" fill="#ffc53d" stroke={S} strokeWidth={W} />
    <path d="M20 24c3-2 5 3 8 1" stroke="#ff6b6b" strokeWidth={2.6} strokeLinecap="round" fill="none" />
    <path d="M19 30c3-1 6 2 9 0" stroke="#4cc9f0" strokeWidth={2.6} strokeLinecap="round" fill="none" />
    <path d="M14 12.5c1.5-1.5 3 1.5 4.5 0m4 0c1.5-1.5 3 1.5 4.5 0" stroke="#ff6b6b" strokeWidth={2} strokeLinecap="round" />
    <circle cx="34" cy="12.5" r="1.8" fill="#ff6b6b" />
  </Svg>
)

/* מקלחת — shower head with drops */
const ShowerIcon = (
  <Svg>
    <path d="M14 42V14a8 8 0 0 1 16 0" stroke={S} strokeWidth={W} strokeLinecap="round" />
    <path d="M30 14h6" stroke={S} strokeWidth={W} strokeLinecap="round" />
    <path d="M33 14a7 7 0 0 1 7 7H26a7 7 0 0 1 7-7z" fill="#4cc9f0" stroke={S} strokeWidth={W} strokeLinejoin="round" />
    <path d="M28 26v2m5-2v3m5-3v2" stroke="#4cc9f0" strokeWidth={W} strokeLinecap="round" />
    <path d="M28 32v2m5-1v3m5-4v2" stroke="#4cc9f0" strokeWidth={W} strokeLinecap="round" />
  </Svg>
)

export const CHORE_ICONS: Record<string, ReactNode> = {
  /* the real family chores — first in the picker */
  trash: TrashIcon,
  dishwasher: DishwasherIcon,
  robotvac: RobotVacIcon,
  spitz: SpitzIcon,
  dryer: DryerIcon,
  shower: ShowerIcon,

  /* generic icons for extra chores/tasks */
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

  /* legacy aliases (old DB rows) */
  dog: SpitzIcon,
  robot: RobotVacIcon,
}

/* picker order — real chores first, no duplicate aliases */
export const ICON_KEYS = [
  'trash', 'dishwasher', 'robotvac', 'spitz', 'dryer', 'shower',
  'bed', 'book', 'star', 'broom', 'plant', 'dishes', 'laundry', 'toys',
]

/* light plate keeps the colored stickers readable on the dark theme */
export function ChoreIcon({ name, size, plate = true }: { name: string; size?: number; plate?: boolean }) {
  const s = size ?? 40
  return (
    <span
      style={{
        display: 'inline-flex',
        width: s,
        height: s,
        flexShrink: 0,
        background: plate ? '#f5f2ff' : 'none',
        borderRadius: plate ? Math.max(8, s * 0.22) : 0,
        padding: plate ? s * 0.1 : 0,
      }}
    >
      {CHORE_ICONS[name] ?? CHORE_ICONS.star}
    </span>
  )
}
