import type { AvatarConfig } from './db-types'

/* DiceBear "Adventurer" variant lists (curated subsets). */

export const SKINS = ['f2d3b1', 'ecad80', '9e5622', '763900']

export const HAIR_COLORS = ['0e0e0e', '562306', 'ab2a18', 'ac6511', 'b9a05f', 'cb6820', 'afafaf', '592454', 'dba3be', '85c2c6']

export const HAIR_STYLES = [
  'short01', 'short04', 'short07', 'short09', 'short12', 'short15', 'short16', 'short19',
  'long01', 'long03', 'long06', 'long09', 'long12', 'long15', 'long19', 'long24',
]

export const EYE_STYLES = ['variant01', 'variant04', 'variant06', 'variant09', 'variant12', 'variant14', 'variant19', 'variant22', 'variant24', 'variant26']

export const MOUTH_STYLES = ['variant01', 'variant03', 'variant05', 'variant09', 'variant12', 'variant15', 'variant19', 'variant21', 'variant26', 'variant30']

export const GLASSES = ['variant01', 'variant02', 'variant03', 'variant04', 'variant05']

export const EARRINGS = ['variant01', 'variant02', 'variant03', 'variant04', 'variant06']

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: SKINS[0],
  hair: 'short09',
  hairColor: HAIR_COLORS[0],
  eyes: 'variant09',
  mouth: 'variant12',
  glasses: null,
  earrings: null,
}

export const DEFAULT_AVATAR_GIRL: AvatarConfig = {
  skin: SKINS[0],
  hair: 'long09',
  hairColor: HAIR_COLORS[1],
  eyes: 'variant12',
  mouth: 'variant15',
  glasses: null,
  earrings: null,
}

/** Old hand-drawn config (pre-DiceBear) → sensible new default. */
export function normalizeAvatar(raw: unknown): AvatarConfig {
  const r = raw as Record<string, unknown> | null
  if (!r || typeof r !== 'object' || !('mouth' in r)) {
    const oldHair = r && typeof r.hair === 'string' ? r.hair : ''
    const longish = ['long', 'braids', 'bun', 'ponytail'].some((h) => oldHair.startsWith(h))
    return longish ? DEFAULT_AVATAR_GIRL : DEFAULT_AVATAR
  }
  return r as unknown as AvatarConfig
}
