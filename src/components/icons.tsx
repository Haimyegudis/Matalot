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

/* להוציא את שלג — dog head: floppy ears, muzzle, tongue, collar (visually verified) */
const SpitzIcon = (
  <Svg>
    <path d="M13 11 C6 12 4 20 6 28 C7 32 10 33 12.5 31 L15 17 Z" fill="#e8e2fb" stroke="#c9c0ea" strokeWidth={2} strokeLinejoin="round" />
    <path d="M35 11 C42 12 44 20 42 28 C41 32 38 33 35.5 31 L33 17 Z" fill="#e8e2fb" stroke="#c9c0ea" strokeWidth={2} strokeLinejoin="round" />
    <circle cx="24" cy="23" r="14" fill="#fff" stroke={L} strokeWidth={2} />
    <ellipse cx="18.5" cy="19.5" rx="2" ry="2.4" fill="#1b1729" />
    <ellipse cx="29.5" cy="19.5" rx="2" ry="2.4" fill="#1b1729" />
    <ellipse cx="24" cy="29" rx="8" ry="6.5" fill="#fff" stroke={L} strokeWidth={1.8} />
    <path d="M20.5 25.5 A4 3.4 0 0 1 27.5 25.5 A3.5 3 0 0 1 24 28.4 A3.5 3 0 0 1 20.5 25.5 Z" fill="#1b1729" />
    <path d="M24 28.4 L24 31 M24 31 C22 33 20 33 19 31.5 M24 31 C26 33 28 33 29 31.5" stroke="#1b1729" strokeWidth={1.7} fill="none" strokeLinecap="round" />
    <path d="M21.8 32.8 C21.8 37.5 26.2 37.5 26.2 32.8 L25.8 31.8 L22.2 31.8 Z" fill="#fb7185" stroke="#e4566b" strokeWidth={1} />
    <path d="M24 32.5 L24 35.5" stroke="#e4566b" strokeWidth={1} />
    <path d="M15 35 C18.5 38.5 29.5 38.5 33 35 L33.5 38 C29.5 42 18.5 42 14.5 38 Z" fill="#8b5cf6" stroke="#6d3ee8" strokeWidth={1} />
    <circle cx="24" cy="41" r="2.4" fill="#fbbf24" stroke="#e4a90f" strokeWidth={1} />
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

  /* lessons / activities */
  english: (
    <Svg>
      <path d="M6 10h30a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H20l-8 7v-7H10a4 4 0 0 1-4-4z" stroke={L} strokeWidth={W} strokeLinejoin="round" />
      <text x="23" y="26" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="11" fill="#22d3ee">ABC</text>
    </Svg>
  ),
  pencil: (
    <Svg>
      <path d="M30 8l10 10-22 22-11 3 3-11z" stroke={L} strokeWidth={W} strokeLinejoin="round" />
      <path d="M26 12l10 10" stroke={L} strokeWidth={2.2} />
      <path d="M10 32l6 6" stroke="#fbbf24" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M33 5l4-2 8 8-2 4z" stroke="#fb7185" strokeWidth={2.2} strokeLinejoin="round" />
    </Svg>
  ),
  notebook: (
    <Svg>
      <rect x="12" y="6" width="26" height="36" rx="3.5" stroke={L} strokeWidth={W} />
      <path d="M9 13h6M9 21h6M9 29h6M9 37h6" stroke="#8b5cf6" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M20 16h12m-12 7h12m-12 7h8" stroke={L} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  ),
  board: (
    <Svg>
      <rect x="6" y="8" width="36" height="24" rx="2.5" stroke={L} strokeWidth={W} />
      <path d="M12 16c4-3 8 3 12 0m-10 8h16" stroke="#2dd4bf" strokeWidth={2.2} strokeLinecap="round" />
      <path d="M24 32v4m0 0l-8 8m8-8l8 8" stroke={L} strokeWidth={W} strokeLinecap="round" />
    </Svg>
  ),
  gradcap: (
    <Svg>
      <path d="M24 10L4 19l20 9 20-9z" stroke={L} strokeWidth={W} strokeLinejoin="round" />
      <path d="M12 24v9c0 3 5.5 6 12 6s12-3 12-6v-9" stroke={L} strokeWidth={W} strokeLinecap="round" />
      <path d="M42 20v10" stroke="#fbbf24" strokeWidth={2.4} strokeLinecap="round" />
      <circle cx="42" cy="32.5" r="2" fill="#fbbf24" />
    </Svg>
  ),
  music: (
    <Svg>
      <path d="M18 36V12l20-4v24" stroke={L} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="13" cy="36" r="5" stroke="#fb7185" strokeWidth={W} />
      <circle cx="33" cy="32" r="5" stroke="#fb7185" strokeWidth={W} />
    </Svg>
  ),

  /* legacy aliases (old rows) */
  dog: SpitzIcon,
  robot: RobotVacIcon,
}

export const ICON_KEYS = [
  'trash', 'dishwasher', 'robotvac', 'spitz', 'dryer', 'shower',
  'english', 'pencil', 'notebook', 'board', 'gradcap', 'music',
  'bed', 'book', 'star', 'broom', 'plant', 'dishes', 'laundry', 'toys',
]

export const ICON_LABELS: Record<string, string> = {
  trash: 'זבל',
  dishwasher: 'מדיח',
  robotvac: 'רובוט',
  spitz: 'כלב',
  dryer: 'מייבש',
  shower: 'מקלחת',
  bed: 'מיטה',
  book: 'ספר',
  star: 'אחר',
  broom: 'טאטוא',
  plant: 'השקיה',
  dishes: 'כלים',
  laundry: 'כביסה',
  toys: 'סידור',
  english: 'אנגלית',
  pencil: 'שיעור',
  notebook: 'מחברת',
  board: 'מורה',
  gradcap: 'לימודים',
  music: 'מוזיקה',
  dog: 'כלב',
  robot: 'רובוט',
}

/** Icon picker button grid with labels — shared by all "choose icon" UIs. */
export function IconPicker({ value, onChange }: { value: string; onChange: (k: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {ICON_KEYS.map((k) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          style={{
            width: 64,
            padding: '8px 2px 6px',
            borderRadius: 12,
            border: value === k ? '3px solid var(--grape)' : 'var(--border)',
            background: 'rgba(255,255,255,.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ChoreIcon name={k} size={34} />
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink-soft)' }}>{ICON_LABELS[k]}</span>
        </button>
      ))}
    </div>
  )
}

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
