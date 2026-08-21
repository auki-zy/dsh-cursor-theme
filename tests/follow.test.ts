/**
 * Color-scheme follow unit tests (M3d). Verifies palette swapping:
 * light UI → dark cursors, dark UI → light cursors, custom images untouched,
 * and follow off → identity.
 */
import { describe, expect, it } from 'vitest'
import { applyColorScheme } from '../src/client/follow.js'
import { BUILTIN_ASSETS } from '../src/client/assets.js'
import type { CursorThemeSettings } from '../src/client/types.js'

const darkPointer = BUILTIN_ASSETS.find((a) => a.id === 'arrow-dark')!
const lightPointer = BUILTIN_ASSETS.find((a) => a.id === 'arrow-light')!

const settings: CursorThemeSettings = {
  enabled: true,
  followTheme: true,
  fallback: 'auto',
  defaultSize: 32,
  states: {
    pointer: { image: darkPointer.image, hotspot: { x: 2, y: 2 }, size: 32 },
    text: { image: 'data:image/png;base64,CUSTOM', hotspot: { x: 4, y: 4 } },
  },
}

describe('applyColorScheme', () => {
  it('light scheme keeps dark cursors (visible on light UI)', () => {
    const out = applyColorScheme(settings, 'light')
    expect(out.states.pointer?.image).toBe(darkPointer.image)
  })

  it('dark scheme swaps to light cursors (visible on dark UI)', () => {
    const out = applyColorScheme(settings, 'dark')
    expect(out.states.pointer?.image).toBe(lightPointer.image)
  })

  it('custom images are untouched', () => {
    const out = applyColorScheme(settings, 'light')
    expect(out.states.text?.image).toBe('data:image/png;base64,CUSTOM')
  })

  it('follow off returns identity', () => {
    const off = { ...settings, followTheme: false }
    const out = applyColorScheme(off, 'light')
    expect(out.states.pointer?.image).toBe(darkPointer.image)
  })

  it('hotspot and size are preserved across the swap', () => {
    const out = applyColorScheme(settings, 'light')
    expect(out.states.pointer?.hotspot).toEqual({ x: 2, y: 2 })
    expect(out.states.pointer?.size).toBe(32)
  })
})
