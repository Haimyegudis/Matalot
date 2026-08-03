export interface Family {
  id: string
  owner_uid: string
  name: string
  parent_pin_hash: string
  /** weekly points goal for the celebration screen; null = off */
  points_goal: number | null
}

/* DiceBear "Adventurer" selections */
export interface AvatarConfig {
  skin: string
  hair: string
  hairColor: string
  eyes: string
  mouth: string
  glasses: string | null
  earrings: string | null
}

export interface Profile {
  id: string
  family_id: string
  name: string
  role: 'parent' | 'child'
  gender: 'male' | 'female'
  avatar: AvatarConfig | null
  photo_url: string | null
  color: string
  sort: number
}

export interface Chore {
  id: string
  family_id: string
  title: string
  note: string | null
  icon: string
  points: number
  assigned_to: string | null
  is_shower: boolean
  track_only: boolean
  per_day: number
  /** weekday schedule 0=Sun..6=Sat; null = every day; [] = general list (no schedule) */
  days: number[] | null
  /** kids alternate; next in turn = sibling of last doer */
  turn_taking: boolean
  /** one doer per round (first-come); default false = everyone can do it and earn */
  single_daily: boolean
  active: boolean
  sort: number
}

export interface Completion {
  id: string
  chore_id: string
  profile_id: string
  family_id: string
  completed_at: string
  day: string
  revoked_by: string | null
}

export interface TaskRow {
  id: string
  family_id: string
  child_id: string
  title: string
  icon: string
  points: number
  remind_at: string | null
  reminded_at: string | null
  status: 'pending' | 'done'
  completed_at: string | null
  created_at: string
}

export interface DayPick {
  id: string
  family_id: string
  chore_id: string
  day: string
  added_by: string | null
  /** null = both kids */
  child_id: string | null
  remind_at: string | null
  reminded_at: string | null
}

export interface PushSubscriptionRow {
  id: string
  family_id: string
  profile_id: string
  endpoint: string
  keys: { p256dh: string; auth: string }
  device_label: string | null
}
