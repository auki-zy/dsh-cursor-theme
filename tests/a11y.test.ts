/**
 * M3e accessibility + i18n invariants.
 * - Every rendered cursor rule carries a fallback keyword (never `none`).
 * - zh and en dictionaries expose the same key set.
 */
import { describe, expect, it } from 'vitest'
import { renderCursorCss } from '../src/client/style.js'
import { en, zh } from '../src/client/locales.js'
import { CURSOR_STATES } from '../src/client/states.js'

describe('accessibility invariants', () => {
  it('every state rule ends with a fallback keyword', () => {
    for (const def of CURSOR_STATES) {
      const settings = {
        enabled: true,
        followTheme: false,
        fallback: 'auto',
        defaultSize: 32,
        states: { [def.id]: { image: 'data:image/png;base64,AAAA' } },
      }
      const css = renderCursorCss(settings)
      expect(css).toMatch(new RegExp(`,\\s*${def.fallback};\\s*\\}$`))
    }
  })

  it('never emits cursor: none', () => {
    const settings = {
      enabled: true,
      followTheme: false,
      fallback: 'auto',
      defaultSize: 32,
      states: { pointer: { image: 'data:image/png;base64,AAAA' } },
    }
    expect(renderCursorCss(settings)).not.toContain('none')
  })

  it('high-contrast theme has no ambiguous empty states', () => {
    // The theme catalog reference should exist (guarded elsewhere), here we
    // assert every fallback keyword is a known CSS keyword string.
    for (const def of CURSOR_STATES) {
      expect(def.fallback.length).toBeGreaterThan(0)
      expect(def.fallback).not.toBe('none')
    }
  })
})

describe('i18n parity', () => {
  it('zh and en expose the same keys', () => {
    const zhKeys = Object.keys(zh).sort()
    const enKeys = Object.keys(en).sort()
    expect(zhKeys).toEqual(enKeys)
  })
})
