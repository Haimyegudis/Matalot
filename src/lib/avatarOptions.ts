import type { AvatarConfig } from './db-types'

export const SKINS = ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3b1e']

export const HAIR_STYLES = ['short', 'curly', 'long', 'ponytail', 'spiky', 'bangs'] as const

export const HAIR_COLORS = ['#2b2145', '#5b3a1e', '#a8642a', '#e8b04b', '#d94f30', '#7a4fd0']

export const EYE_STYLES = ['round', 'happy', 'wink', 'star'] as const

export interface OutfitOption {
  id: string
  color: string
  deco: 'plain' | 'stripes' | 'star' | 'heart' | 'zigzag'
}

export const OUTFITS: OutfitOption[] = [
  { id: 'coral', color: '#ff6b6b', deco: 'star' },
  { id: 'teal', color: '#2ec4b6', deco: 'plain' },
  { id: 'sunny', color: '#ffc53d', deco: 'zigzag' },
  { id: 'grape', color: '#9b5de5', deco: 'heart' },
  { id: 'sky', color: '#4cc9f0', deco: 'stripes' },
  { id: 'mint', color: '#7bd88f', deco: 'plain' },
  { id: 'pink', color: '#ff8fab', deco: 'star' },
  { id: 'navy', color: '#3d5a80', deco: 'stripes' },
]

export const ACCESSORIES = ['glasses', 'cap', 'crown', 'bow', 'headphones'] as const

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: SKINS[0],
  hair: 'short',
  hairColor: HAIR_COLORS[0],
  eyes: 'round',
  outfit: 'teal',
  accessory: null,
}
