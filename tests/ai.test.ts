/**
 * AI generation workflow unit tests (M4):
 * - prompt builder includes the idea, shape whitelist, and JSON contract;
 * - generated-theme parser validates shape/color and fails closed;
 * - renderer maps shape+color to a settings fragment.
 */
import { describe, expect, it } from 'vitest'
import { buildAiPrompt, parseGeneratedTheme } from '../src/client/ai.js'
import { renderShapeToDataUrl, parseHexColor } from '../src/client/render.js'
import { SHAPE_BY_ID, shapeToRgba } from '../src/client/shapes.js'

describe('buildAiPrompt', () => {
  it('embeds the user idea', () => {
    const p = buildAiPrompt('pink cat girl')
    expect(p).toContain('pink cat girl')
  })

  it('enumerates the shape whitelist so the AI cannot invent shapes', () => {
    const p = buildAiPrompt('x')
    for (const id of ['cat', 'shark', 'penguin', 'ghost', 'alien']) {
      expect(p).toContain(id)
    }
  })

  it('asks for JSON only with the states contract', () => {
    const p = buildAiPrompt('x')
    expect(p).toContain('"states"')
    expect(p).toContain('"shape"')
    expect(p).toContain('"color"')
  })
})

describe('parseGeneratedTheme', () => {
  const good = JSON.stringify({
    name: 'Coral Cat',
    states: {
      pointer: { shape: 'cat', color: '#ff8fab' },
      wait: { shape: 'bee', color: '#ffc2d1' },
      'not-allowed': { shape: 'ban', color: '#8d99ae' },
    },
  })

  it('parses a valid reply', () => {
    const theme = parseGeneratedTheme(good)
    expect(theme.name).toBe('Coral Cat')
    expect(theme.states.pointer).toEqual({ shape: 'cat', color: '#ff8fab' })
  })

  it('rejects non-JSON', () => {
    expect(() => parseGeneratedTheme('sure, here is a theme:')).toThrow(/JSON/)
  })

  it('rejects unknown shapes (fail closed)', () => {
    const bad = JSON.stringify({ name: 'x', states: { pointer: { shape: 'dragon', color: '#fff' } } })
    expect(() => parseGeneratedTheme(bad)).toThrow(/unknown shape/)
  })

  it('rejects unknown states', () => {
    const bad = JSON.stringify({ name: 'x', states: { hover: { shape: 'cat', color: '#fff' } } })
    expect(() => parseGeneratedTheme(bad)).toThrow(/Unknown state/)
  })

  it('rejects bad colors', () => {
    const bad = JSON.stringify({ name: 'x', states: { pointer: { shape: 'cat', color: 'red' } } })
    expect(() => parseGeneratedTheme(bad)).toThrow(/color/)
  })

  it('rejects empty state set', () => {
    const bad = JSON.stringify({ name: 'x', states: {} })
    expect(() => parseGeneratedTheme(bad)).toThrow(/no states/)
  })
})

describe('shape rendering', () => {
  it('parseHexColor handles #rgb and #rrggbb', () => {
    expect(parseHexColor('#f00')).toEqual([255, 0, 0])
    expect(parseHexColor('#ff8fab')).toEqual([255, 143, 171])
    expect(() => parseHexColor('red')).toThrow()
  })

  it('every creative shape has a valid 16×16 matrix and hotspot', () => {
    for (const shape of SHAPE_BY_ID.values()) {
      expect(shape.rows.length).toBe(16)
      for (const row of shape.rows) expect(row.length).toBe(16)
      expect(shape.hotspot.x).toBeGreaterThanOrEqual(0)
      expect(shape.hotspot.y).toBeGreaterThanOrEqual(0)
      const rgba = shapeToRgba(shape.rows, [255, 0, 0])
      expect(rgba.length).toBe(32 * 32 * 4)
    }
  })

  it('renderShapeToDataUrl returns null without document (node)', () => {
    expect(renderShapeToDataUrl(SHAPE_BY_ID.get('cat')!, '#ff0000')).toBeNull()
  })
})
