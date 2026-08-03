import type { AvatarConfig } from './db-types'

export const SKINS = ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3b1e']

export const HAIR_STYLES = ['short', 'curly', 'long', 'ponytail', 'spiky', 'bangs', 'braids', 'bun'] as const

export const HAIR_COLORS = ['#2b2145', '#5b3a1e', '#a8642a', '#e8b04b', '#d94f30', '#7a4fd0']

export const EYE_STYLES = ['round', 'happy', 'wink', 'star', 'lashes'] as const

export interface OutfitOption {
  id: string
  color: string
  deco: 'plain' | 'stripes' | 'star' | 'heart' | 'zigzag'
  shape: 'shirt' | 'dress' | 'sport'
}

export const OUTFITS: OutfitOption[] = [
  { id: 'coral', color: '#ff6b6b', deco: 'star', shape: 'shirt' },
  { id: 'teal', color: '#2ec4b6', deco: 'plain', shape: 'shirt' },
  { id: 'sunny', color: '#ffc53d', deco: 'zigzag', shape: 'shirt' },
  { id: 'grape', color: '#9b5de5', deco: 'heart', shape: 'shirt' },
  { id: 'sky', color: '#4cc9f0', deco: 'stripes', shape: 'shirt' },
  { id: 'navy', color: '#3d5a80', deco: 'stripes', shape: 'shirt' },
  { id: 'dress-pink', color: '#ff8fab', deco: 'heart', shape: 'dress' },
  { id: 'dress-grape', color: '#9b5de5', deco: 'star', shape: 'dress' },
  { id: 'dress-mint', color: '#7bd88f', deco: 'plain', shape: 'dress' },
  { id: 'dress-sunny', color: '#ffc53d', deco: 'zigzag', shape: 'dress' },
  { id: 'sport-red', color: '#e5484d', deco: 'stripes', shape: 'sport' },
  { id: 'sport-blue', color: '#4cc9f0', deco: 'stripes', shape: 'sport' },
  { id: 'sport-green', color: '#23a94d', deco: 'stripes', shape: 'sport' },
]

export const ACCESSORIES = ['glasses', 'cap', 'crown', 'bow', 'headphones', 'makeup', 'earrings'] as const

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: SKINS[0],
  hair: 'short',
  hairColor: HAIR_COLORS[0],
  eyes: 'round',
  outfit: 'teal',
  accessory: null,
}

export const DEFAULT_AVATAR_GIRL: AvatarConfig = {
  skin: SKINS[0],
  hair: 'long',
  hairColor: HAIR_COLORS[1],
  eyes: 'lashes',
  outfit: 'dress-pink',
  accessory: null,
}
