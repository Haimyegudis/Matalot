import { describe, it, expect } from 'vitest'
import { avatarSvgString } from '../components/AvatarSvg'
import {
  SKINS, HAIR_STYLES, HAIR_COLORS, EYE_STYLES, MOUTH_STYLES, GLASSES, EARRINGS,
  DEFAULT_AVATAR, DEFAULT_AVATAR_GIRL, normalizeAvatar,
} from './avatarOptions'

describe('avatar options', () => {
  it('option lists are non-empty', () => {
    for (const list of [SKINS, HAIR_STYLES, HAIR_COLORS, EYE_STYLES, MOUTH_STYLES, GLASSES, EARRINGS]) {
      expect(list.length).toBeGreaterThan(2)
    }
  })

  it('every individual option renders to svg markup', () => {
    const variants = [
      ...SKINS.map((skin) => ({ ...DEFAULT_AVATAR, skin })),
      ...HAIR_STYLES.map((hair) => ({ ...DEFAULT_AVATAR, hair })),
      ...HAIR_COLORS.map((hairColor) => ({ ...DEFAULT_AVATAR, hairColor })),
      ...EYE_STYLES.map((eyes) => ({ ...DEFAULT_AVATAR, eyes })),
      ...MOUTH_STYLES.map((mouth) => ({ ...DEFAULT_AVATAR, mouth })),
      ...GLASSES.map((glasses) => ({ ...DEFAULT_AVATAR, glasses })),
      ...EARRINGS.map((earrings) => ({ ...DEFAULT_AVATAR, earrings })),
      DEFAULT_AVATAR_GIRL,
    ]
    for (const config of variants) {
      const svg = avatarSvgString(config)
      expect(svg).toContain('<svg')
    }
  })

  it('null and legacy configs normalize to a valid default', () => {
    expect(avatarSvgString(null)).toContain('<svg')
    const legacy = { skin: '#ffdbac', hair: 'long', hairColor: '#5b3a1e', eyes: 'lashes', outfit: 'dress-pink', accessory: null }
    expect(normalizeAvatar(legacy as never).hair).toBe(DEFAULT_AVATAR_GIRL.hair)
    expect(avatarSvgString(legacy as never)).toContain('<svg')
  })
})
