/**
 * Theme pack import/export unit tests (M3c). Verifies validation: schema,
 * name, size budget, data-URL enforcement, and that invalid packs are
 * rejected without mutating anything.
 */
import { describe, expect, it } from 'vitest'
import { buildThemePack, parseThemePack, serializeThemePack, THEME_PACK_SCHEMA } from '../src/client/pack.js'
import type { CursorThemeSettings } from '../src/client/types.js'

const settings: CursorThemeSettings = {
  enabled: true,
  fallback: 'auto',
  defaultSize: 32,
  states: {
    pointer: { image: 'data:image/png;base64,AAAA', hotspot: { x: 2, y: 2 }, size: 24 },
  },
}

describe('theme pack', () => {
  it('round-trips a pack through serialize → parse', () => {
    const pack = buildThemePack(settings, 'test')
    const parsed = parseThemePack(serializeThemePack(pack))
    expect(parsed.name).toBe('test')
    expect(parsed.settings.states.pointer).toEqual(settings.states.pointer)
  })

  it('rejects non-object input', () => {
    expect(() => parseThemePack('[1,2]')).toThrow()
    expect(() => parseThemePack('42')).toThrow()
  })

  it('rejects wrong schema version', () => {
    const pack = { schema: 99, name: 'x', version: '1', settings }
    expect(() => parseThemePack(JSON.stringify(pack))).toThrow(/schema/)
  })

  it('rejects missing name', () => {
    const pack = { schema: THEME_PACK_SCHEMA, version: '1', settings }
    expect(() => parseThemePack(JSON.stringify(pack))).toThrow(/name/)
  })

  it('rejects non-data-URL images', () => {
    const pack = {
      schema: THEME_PACK_SCHEMA,
      name: 'x',
      version: '1',
      settings: { ...settings, states: { pointer: { image: 'https://evil.example/x.png' } } },
    }
    expect(() => parseThemePack(JSON.stringify(pack))).toThrow(/data URL/)
  })

  it('rejects oversized images', () => {
    const big = 'A'.repeat(700 * 1024) // ~700 KB → base64 payload > 512 KB
    const pack = {
      schema: THEME_PACK_SCHEMA,
      name: 'x',
      version: '1',
      settings: { ...settings, states: { pointer: { image: `data:image/png;base64,${big}` } } },
    }
    expect(() => parseThemePack(JSON.stringify(pack))).toThrow(/too large/)
  })

  it('fills defaults for missing scalar settings', () => {
    const pack = { schema: THEME_PACK_SCHEMA, name: 'x', version: '1', settings: { states: {} } }
    const parsed = parseThemePack(JSON.stringify(pack))
    expect(parsed.settings.enabled).toBe(true)
    expect(parsed.settings.fallback).toBe('auto')
    expect(parsed.settings.defaultSize).toBe(32)
  })
})
