import type { ReactNode } from 'react'

/* Mature duotone line icons — light stroke + one accent per icon, drawn
   literal so it's obvious what each chore is. Key = chores.icon in DB. */

const L = '#ded8f7'          /* light line on dark surfaces */
const W = 2.6

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" aria-hidden>
      {children}
    </svg>
  )
}

/* לזרוק זבל — tied garbage bag beside a bin */
const TrashIcon = (
  <Svg>
    <path d="M26 17h16l-1.5 20a3 3 0 0 1-3 2.8h-7a3 3 0 0 1-3-2.8z" stroke={L} strokeWidth={W} strokeLinejoin="round" />
    <path d="M24 17h20" stroke={L} strokeWidth={W} strokeLinecap="round" />
    <path d="M31 22v11m6-11v11" stroke="#2dd4bf" strokeWidth={2.4} strokeLinecap="round" />
    <path d="M7 40c-1-6.5 1-12 5-14l-1.8-2.6 3.6-2.6 2.7 1.8 3.6-1.8-.9 3.6c3.6 2.7 4.5 9 3.6 15.6z" stroke={L} strokeWidth={W} strokeLinejoin="round" />
    <path d="M12 21.5l3.5-1.8" stroke={L} strokeWidth={2.2} strokeLinecap="round" />
    <path d="M11 31c3-1.3 6-1.3 9 0" stroke="#2dd4bf" strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
)

/* לפנות מדיח — machine with open door and dish rack */
const DishwasherIcon = (
  <Svg>
    <rect x="8" y="6" width="32" height="24" rx="3.5" stroke={L} strokeWidth={W} />
    <path d="M8 12h32" stroke={L} strokeWidth={2.2} />
    <circle cx="13" cy="9" r="1.4" fill="#22d3ee" />
    <circle cx="18" cy="9" r="1.4" fill="#22d3ee" />
    <rect x="13" y="17" width="22" height="8" rx="1.5" stroke="#22d3ee" strokeWidth={2.2} />
    <path d="M17 17v8m5-8v8m5-8v8m5-8v8" stroke="#22d3ee" strokeWidth={1.6} />
    <path d="M8 30h32l-5 7H13z" stroke={L} strokeWidth={W} strokeLinejoin="round" />
    <path d="M15 42h18" stroke={L} strokeWidth={W} strokeLinecap="round" />
  </Svg>
)

/* לנקות את רוקי — robot mop disc, side view, water trail */
const RobotVacIcon = (
  <Svg>
    <path d="M8 27a16 8.5 0 0 1 32 0v3.5a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" stroke={L} strokeWidth={W} strokeLinejoin="round" />
    <path d="M8 27h32" stroke={L} strokeWidth={2.2} />
    <circle cx="24" cy="16.5" r="2.2" stroke="#8b5cf6" strokeWidth={2.2} />
    <path d="M17 31.5h14" stroke="#8b5cf6" strokeWidth={2.4} strokeLinecap="round" />
    <path d="M10 41c2-2 4-2 6 0m6-1c2-2 4-2 6 0m6 1c2-2 4-2 6 0" stroke="#22d3ee" strokeWidth={2.4} strokeLinecap="round" />
  </Svg>
)

/* להוציא את שלג — spitz silhouette with pointy ears, curled tail, leash */
const SpitzIcon = (
  <Svg>
    <path d="M14 15l-2.5-7 6.5 3.5M28 15l2.5-7-6.5 3.5" stroke={L} strokeWidth={W} strokeLinejoin="round" strokeLinecap="round" />
    <path d="M12.5 22c-1.5-6 2.5-11 8.5-11s10 5 8.5 11c3.5 1 5.5 4 5 8-1 6-6 9.5-13.5 9.5S8.5 36 7.5 30c-.6-3.8 1.5-7 5-8z" stroke={L} strokeWidth={W} strokeLinejoin="round" />
    <path d="M35 32c4-.5 6.5-3.5 6-7.5-3.5 0-6 2-6.5 4.5" stroke={L} strokeWidth={W} strokeLinejoin="round" />
    <path d="M18 40v3m12-3v3" stroke={L} strokeWidth={2.4} strokeLinecap="round" />
    <path d="M30 14c4-3.5 8-4.5 11.5-3.5" stroke="#fb7185" strokeWidth={2.4} strokeLinecap="round" />
    <circle cx="43" cy="9.5" r="2.5" stroke="#fb7185" strokeWidth={2.4} />
  </Svg>
)

/* בגדים למייבש — front-load dryer with tumbling clothes + heat */
const DryerIcon = (
  <Svg>
    <rect x="9" y="7" width="30" height="34" rx="4" stroke={L} strokeWidth={W} />
    <path d="M9 14h30" stroke={L} strokeWidth={2.2} />
    <circle cx="34" cy="10.5" r="1.4" fill="#fbbf24" />
    <circle cx="24" cy="28" r="9" stroke={L} strokeWidth={W} />
    <path d="M19 26c3-2.5 5 3 8 .5" stroke="#fbbf24" strokeWidth={2.4} strokeLinecap="round" />
    <path d="M19.5 31c3-1.5 5.5 2 8.5 0" stroke="#fbbf24" strokeWidth={2.4} strokeLinecap="round" />
    <path d="M14 10.5c1.2-1.2 2.4 1.2 3.6 0m3 0c1.2-1.2 2.4 1.2 3.6 0" stroke="#fbbf24" strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
)

/* מקלחת */
const ShowerIcon = (
  <Svg>
    <path d="M14 42V14a8 8 0 0 1 16 0" stroke={L} strokeWidth={W} strokeLinecap="round" />
    <path d="M30 14h6" stroke={L} strokeWidth={W} strokeLinecap="round" />
    <path d="M33 14a7 7 0 0 1 7 7H26a7 7 0 0 1 7-7z" stroke={L} strokeWidth={W} strokeLinejoin="round" />
    <path d="M28 26v2m5-2v3m5-3v2" stroke="#22d3ee" strokeWidth={2.4} strokeLinecap="round" />
    <path d="M28 32v2m5-1v3m5-4v2" stroke="#22d3ee" strokeWidth={2.4} strokeLinecap="round" />
  </Svg>
)

export const CHORE_ICONS: Record<string, ReactNode> = {
  trash: TrashIcon,
  dishwasher: DishwasherIcon,
  robotvac: RobotVacIcon,
  spitz: SpitzIcon,
  dryer: DryerIcon,
  shower: ShowerIcon,

  bed: (
    <Svg>
      <path d="M6 36V18m0 12h36v6m0-6v-4a5 5 0 0 0-5-5H22v9" stroke={L} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 30v-4" stroke={L} strokeWidth={W} />
      <circle cx="13.5" cy="24" r="3.5" stroke="#8b5cf6" strokeWidth={2.4} />
    </Svg>
  ),
  book: (
    <Svg>
      <path d="M24 13c-4-3-10-3-15-1v25c5-2 11-2 15 1 4-3 10-3 15-1V12c-5-2-11-2-15 1z" stroke={L} strokeWidth={W} strokeLinejoin="round" />
      <path d="M24 13v25" stroke={L} strokeWidth={2.2} />
      <path d="M13.5 19c2.5-.6 5-.6 7 0m-7 6c2.5-.6 5-.6 7 0m7-6c2.5-.6 5-.6 7 0m-7 6c2.5-.6 5-.6 7 0" stroke="#fbbf24" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  ),
  star: (
    <Svg>
      <path d="M24 6l5.3 10.8 11.9 1.7-8.6 8.4 2 11.8L24 33l-10.6 5.7 2-11.8-8.6-8.4 11.9-1.7z" stroke="#fbbf24" strokeWidth={W} strokeLinejoin="round" />
    </Svg>
  ),
  broom: (
    <Svg>
      <path d="M35 5L21 23" stroke={L} strokeWidth={W} strokeLinecap="round" />
      <path d="M23 21c-6 2-10 8-11 16 8 1 15-1 19-6z" stroke={L} strokeWidth={W} strokeLinejoin="round" />
      <path d="M18 30l-2 6m7-4l-3 6" stroke="#2dd4bf" strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  ),
  plant: (
    <Svg>
      <path d="M24 27V15" stroke={L} strokeWidth={W} strokeLinecap="round" />
      <path d="M24 19c-6 0-9-4-9-9 6 0 9 3 9 9z" stroke="#2dd4bf" strokeWidth={W} strokeLinejoin="round" />
      <path d="M24 21c6 0 9-4 9-9-6 0-9 3-9 9z" stroke="#2dd4bf" strokeWidth={W} strokeLinejoin="round" />
      <path d="M14 29h20l-2.5 11a3 3 0 0 1-3 2.4h-9a3 3 0 0 1-3-2.4z" stroke={L} strokeWidth={W} strokeLinejoin="round" />
    </Svg>
  ),
  dishes: (
    <Svg>
      <circle cx="22" cy="26" r="14" stroke={L} strokeWidth={W} />
      <circle cx="22" cy="26" r="7" stroke="#fb7185" strokeWidth={2.2} />
      <path d="M40 12v24" stroke={L} strokeWidth={W} strokeLinecap="round" />
      <path d="M37 12v6a3 3 0 0 0 6 0v-6" stroke={L} strokeWidth={W} strokeLinecap="round" />
    </Svg>
  ),
  laundry: (
    <Svg>
      <rect x="9" y="7" width="30" height="34" rx="4" stroke={L} strokeWidth={W} />
      <path d="M9 14h30" stroke={L} strokeWidth={2.2} />
      <circle cx="24" cy="28" r="9" stroke={L} strokeWidth={W} />
      <path d="M17.5 28c2-2.5 4.5 2.5 6.5 0s4.5 2.5 6.5 0" stroke="#22d3ee" strokeWidth={2.2} strokeLinecap="round" />
      <circle cx="14.5" cy="10.5" r="1.4" fill="#fb7185" />
    </Svg>
  ),
  toys: (
    <Svg>
      <rect x="8" y="21" width="17" height="17" rx="3" stroke="#fb7185" strokeWidth={W} />
      <path d="M8 29h17M14.5 29v-4h4v4" stroke="#fb7185" strokeWidth={2.2} />
      <circle cx="33.5" cy="16.5" r="8" stroke="#fbbf24" strokeWidth={W} />
      <path d="M30 15l2.5 2.5 4.5-4.5" stroke={L} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),

  /* legacy aliases (old rows) */
  dog: SpitzIcon,
  robot: RobotVacIcon,
}

export const ICON_KEYS = [
  'trash', 'dishwasher', 'robotvac', 'spitz', 'dryer', 'shower',
  'bed', 'book', 'star', 'broom', 'plant', 'dishes', 'laundry', 'toys',
]

/* plate=true puts the icon on a light chip — needed only on light surfaces */
export function ChoreIcon({ name, size, plate = false }: { name: string; size?: number; plate?: boolean }) {
  const s = size ?? 40
  return (
    <span
      style={{
        display: 'inline-flex',
        width: s,
        height: s,
        flexShrink: 0,
        background: plate ? '#26213c' : 'none',
        borderRadius: plate ? Math.max(8, s * 0.22) : 0,
        padding: plate ? s * 0.08 : 0,
      }}
    >
      {CHORE_ICONS[name] ?? CHORE_ICONS.star}
    </span>
  )
}
