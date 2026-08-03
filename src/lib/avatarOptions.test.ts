import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { createElement } from 'react'
import { AvatarSvg } from '../components/AvatarSvg'
import {
  SKINS, HAIR_STYLES, HAIR_COLORS, EYE_STYLES, OUTFITS, ACCESSORIES, DEFAULT_AVATAR,
} from './avatarOptions'

describe('avatar options', () => {
  it('option lists are non-empty', () => {
    for (const list of [SKINS, HAIR_STYLES, HAIR_COLORS, EYE_STYLES, OUTFITS, ACCESSORIES]) {
      expect(list.length).toBeGreaterThan(2)
    }
  })

  it('every individual option renders to svg markup', () => {
    const variants = [
      ...SKINS.map((skin) => ({ ...DEFAULT_AVATAR, skin })),
      ...HAIR_STYLES.map((hair) => ({ ...DEFAULT_AVATAR, hair })),
      ...HAIR_COLORS.map((hairColor) => ({ ...DEFAULT_AVATAR, hairColor })),
      ...EYE_STYLES.map((eyes) => ({ ...DEFAULT_AVATAR, eyes })),
      ...OUTFITS.map((o) => ({ ...DEFAULT_AVATAR, outfit: o.id })),
      ...ACCESSORIES.map((accessory) => ({ ...DEFAULT_AVATAR, accessory })),
      { ...DEFAULT_AVATAR, accessory: null },
    ]
    for (const config of variants) {
      const html = renderToString(createElement(AvatarSvg, { config }))
      expect(html).toContain('<svg')
    }
  })

  it('null config falls back to default', () => {
    expect(renderToString(createElement(AvatarSvg, { config: null }))).toContain('<svg')
  })
})
