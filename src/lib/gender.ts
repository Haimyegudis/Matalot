import type { Profile } from './db-types'

/** Hebrew gendered form picker: g(profile, 'ביצע', 'ביצעה') */
export function g(p: { gender?: 'male' | 'female' } | null | undefined, male: string, female: string): string {
  return p?.gender === 'female' ? female : male
}

/** Role label: אבא/אמא for parents, ילד/ילדה for kids. */
export function roleLabel(p: Profile): string {
  if (p.role === 'parent') return p.gender === 'female' ? 'אמא' : 'אבא'
  return p.gender === 'female' ? 'ילדה' : 'ילד'
}
