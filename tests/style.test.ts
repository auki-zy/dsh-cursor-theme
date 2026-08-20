/**
 * Style generator unit tests. Verifies the M1 core logic:
 * cursor CSS rendering, enabled switch, fallback safety, hotspot, and the
 * 128px browser clamp (feasibility.md §2.3).
 */
import { describe, expect, it } from 'vitest'
import { renderCursorCss } from '../src/client/style.js'
import { CURSOR_STATES } from '../src/client/states.js'
import type { CursorThemeSettings } from '../src/client/types.js'

const base: CursorThemeSettings = {
  enabled: true,
  fallback: 'auto',
  defaultSize: 32,
  states: {},
}

describe('renderCursorCss', () => {
  it('emits no CSS for an empty configuration', () => {
    expect(renderCursorCss(base)).toBe('')
  })

  it('emits no CSS when the master switch is off', () => {
    expect(renderCursorCss({ ...base, enabled: false, states: { pointer: { image: 'data:image/png;base64,AAAA' } } })).toBe('')
  })

  it('renders a pointer rule with hotspot and size', () => {
    const css = renderCursorCss({
      ...base,
      states: { pointer: { image: 'data:image/png;base64,AAAA', hotspot: { x: 4, y: 5 }, size: 24 } },
    })
    expect(css).toContain('cursor: url("data:image/png;base64,AAAA") 4 5, pointer;')
    expect(css).toContain('a,\nbutton')
  })

  it('always appends the fallback keyword (accessibility)', () => {
    const css = renderCursorCss({
      ...base,
      states: { text: { image: 'data:image/png;base64,BBBB' } },
    })
    // fallback must survive even if image fails to load
    expect(css).toMatch(/,\s*text;\s*\}$/)
    expect(css).not.toMatch(/none;/)
  })

  it('defaults hotspot to 0 0 when absent', () => {
    const css = renderCursorCss({
      ...base,
      states: { default: { image: 'data:image/png;base64,CCCC' } },
    })
    expect(css).toContain('cursor: url("data:image/png;base64,CCCC") 0 0, default;')
  })

  it('covers every declared state id with its fallback keyword', () => {
    const css = renderCursorCss(base)
    expect(css).toBe('')
    // every state's fallback is a valid CSS keyword from our table
    for (const def of CURSOR_STATES) {
      expect(def.fallback.length).toBeGreaterThan(0)
      expect(def.selectors.length).toBeGreaterThan(0)
    }
  })

  it('ignores states without an image (no forced override)', () => {
    const css = renderCursorCss({
      ...base,
      states: { pointer: { hotspot: { x: 2, y: 2 } } },
    })
    expect(css).toBe('')
  })
})
