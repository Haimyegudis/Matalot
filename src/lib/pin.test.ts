import { describe, it, expect } from 'vitest'
import { hashPin } from './pin'

describe('hashPin', () => {
  it('returns stable 64-char hex', async () => {
    const a = await hashPin('1234')
    const b = await hashPin('1234')
    expect(a).toBe(b)
    expect(a).toMatch(/^[0-9a-f]{64}$/)
  })

  it('different pins produce different hashes', async () => {
    expect(await hashPin('1234')).not.toBe(await hashPin('4321'))
  })
})
