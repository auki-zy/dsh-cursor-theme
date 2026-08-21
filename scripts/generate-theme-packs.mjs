/**
 * dsh-cursor-theme pack generator: original themes.
 *
 * Renders every state into PNGs (resvg) and produces, per theme:
 *   1. a shareable image pack ZIP (data/theme-packs/<id>.zip: one PNG per
 *      state + manifest.json — the exact 图片包 format), and
 *   2. a schema-1 pack JSON (data/themes-<id>.json) that generate-assets.mjs
 *      merges into data/assets.json as a built-in preset theme.
 *
 * Two kinds of themes:
 *   - palette themes: the 14 functional SVG templates + a palette
 *     (base ORIGINALS below)
 *   - creative themes: per-state hand-drawn art from scripts/theme-art.mjs
 *     (PAW/ENERGY/NEON/EMOJI/PIXEL/WEATHER/ORIGAMI/ASTRO/CANDY/GHOST/HIVIS/POP)
 *     with optional decorators (glow/gloss/dots) and custom sizes.
 *
 * All art is original — no third-party license management needed.
 *
 * Usage: node scripts/generate-theme-packs.mjs
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSync } from 'esbuild'
import { Resvg } from '@resvg/resvg-js'
import JSZip from 'jszip'
import { CREATIVE_THEMES } from './theme-art.mjs'

const root = dirname(dirname(fileURLToPath(import.meta.url)))

// ---- load SVG templates the same way generate-assets.mjs does ----
const out = buildSync({
  entryPoints: [join(root, 'src', 'client', 'svg-assets.ts')],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  write: false,
})
const mod = { exports: {} }
new Function('module', 'exports', out.outputFiles[0].text)(mod, mod.exports)
const { SVG_TEMPLATES } = mod.exports
const TEMPLATE_BY_ID = new Map(SVG_TEMPLATES.map((t) => [t.id, t]))

// ---- the 14 DSH mouse states, in display order ----
const STATE_IDS = [
  'default', 'pointer', 'text', 'wait', 'help', 'not-allowed', 'grab',
  'grabbing', 'progress', 'cell', 'copy', 'move', 'resize-ew', 'resize-ns',
]

/** Which functional shape template renders each state (fallback for all). */
const SHAPE_BY_STATE = {
  'default': 'shape-default',
  'pointer': 'shape-pointer',
  'text': 'shape-text',
  'wait': 'shape-wait',
  'help': 'shape-help',
  'not-allowed': 'shape-not-allowed',
  'grab': 'shape-grab',
  'grabbing': 'shape-grab',
  'progress': 'shape-progress',
  'cell': 'shape-cell',
  'copy': 'shape-copy',
  'move': 'shape-move',
  'resize-ew': 'shape-resize-ew',
  'resize-ns': 'shape-resize-ns',
}

// ---- the 6 base palette themes ----
const ORIGINAL_THEMES = [
  { id: 'aurora', name: '极光 Aurora', description: '蓝紫渐变 · 原创配色', palette: { primary: '#5a7dff', accent: '#8b5cf6', dark: '#1b2a4a' } },
  { id: 'honey', name: '蜜糖 Honey', description: '暖橙蜂蜜色 · 原创配色', palette: { primary: '#ff9f43', accent: '#feca57', dark: '#7a4a12' } },
  { id: 'mint', name: '薄荷 Mint', description: '青绿清新 · 原创配色', palette: { primary: '#1dd1a1', accent: '#7bed9f', dark: '#0a4d3c' } },
  { id: 'sunset', name: '晚霞 Sunset', description: '粉紫晚霞 · 原创配色', palette: { primary: '#ff6b6b', accent: '#f368e0', dark: '#6b1f5e' } },
  { id: 'graphite', name: '石墨 Graphite', description: '中性深灰 · 原创配色', palette: { primary: '#57606f', accent: '#a4b0be', dark: '#2f3542' } },
  { id: 'contrast', name: '高对比 High Contrast', description: '黑白高对比 · 无障碍友好', palette: { primary: '#ffffff', accent: '#e8e8e8', dark: '#000000' } },
]

const THEMES = [...ORIGINAL_THEMES, ...CREATIVE_THEMES]

/** Substitute a palette into a template's SVG. */
function applyPalette(svg, palette) {
  return svg
    .replaceAll('{primary}', palette.primary)
    .replaceAll('{accent}', palette.accent)
    .replaceAll('{dark}', palette.dark)
}

/**
 * Apply a theme decorator to the full SVG (before palette substitution so
 * injected placeholder refs still get colored).
 */
function decorate(theme, fullSvg) {
  switch (theme.decor) {
    case 'glow': {
      // neon: wrap everything in a glow filter (blur + merge).
      const filter = `<filter id="neonGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
      return fullSvg
        .replace('<defs>', `<defs>${filter}`)
        .replace(/<svg[^>]*>/, (m) => `${m}<g filter="url(#neonGlow)">`)
        .replace('</svg>', '</g></svg>')
    }
    case 'gloss': {
      // candy: glossy highlight ellipses on top.
      const hi = '<ellipse cx="21" cy="9" rx="5.5" ry="3" fill="#FFFFFF" opacity="0.85" transform="rotate(-28 21 9)"/><circle cx="10" cy="6.5" r="1.7" fill="#FFFFFF" opacity="0.9"/>'
      return fullSvg.replace('</svg>', `${hi}</svg>`)
    }
    case 'dots': {
      // pop: dotted border (Matisse style), 12 dots around the frame.
      const dots = []
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2
        const x = 16 + Math.cos(a) * 13.5
        const y = 16 + Math.sin(a) * 13.5
        dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.8" fill="{accent}"/>`)
      }
      return fullSvg.replace('</svg>', `${dots.join('')}</svg>`)
    }
    default:
      return fullSvg
  }
}

const SVG_HEADER = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`
const DEFS = '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{primary}"/><stop offset="1" stop-color="{accent}"/></linearGradient></defs>'

/** Extract the bare body (no <svg>/<defs>) from a template's full SVG. */
function templateBody(tpl) {
  return tpl.svg
    .replace(/^<svg[^>]*>/, '')
    .replace(/<defs>[\s\S]*?<\/defs>/, '')
    .replace(/<\/svg>\s*$/, '')
}

/** Build the full SVG for one state of a theme (32 or 48 box). */
function buildSvg(theme, stateId) {
  const size = theme.size ?? 32
  const art = theme.art?.[stateId]
  const body = art ?? templateBody(TEMPLATE_BY_ID.get(SHAPE_BY_STATE[stateId]))
  let full = `${SVG_HEADER(size)}${DEFS}${body}</svg>`
  full = decorate(theme, full)
  return applyPalette(full, theme.palette)
}

/** Render an SVG to a PNG (bytes). */
function renderPng(svgStr, size) {
  const resvg = new Resvg(svgStr, { fitTo: { mode: 'width', value: size } })
  return resvg.render().asPng()
}

function dataUrl(bytes) {
  return `data:image/png;base64,${Buffer.from(bytes).toString('base64')}`
}

/** Hotspot for a state in a 32/48 box (arrow states at tip). */
function hotspotFor(theme, stateId) {
  const size = theme.size ?? 32
  const tip = size === 48 ? { x: 3, y: 3 } : { x: 1, y: 1 }
  const center = { x: size / 2, y: size / 2 }
  return stateId === 'default' || stateId === 'pointer' ? tip : center
}

const packsDir = join(root, 'data', 'theme-packs')
rmSync(packsDir, { recursive: true, force: true })
mkdirSync(packsDir, { recursive: true })

let totalStates = 0
for (const theme of THEMES) {
  const size = theme.size ?? 32
  const states = {}
  const zip = new JSZip()
  const manifest = {
    schema: 1,
    name: theme.name,
    version: '1.0.0',
    enabled: true,
    defaultSize: size,
    states: {},
  }

  for (const stateId of STATE_IDS) {
    const svgStr = buildSvg(theme, stateId)
    const png = renderPng(svgStr, size)
    if (!png || png.length === 0) throw new Error(`render failed for ${theme.id}/${stateId}`)

    states[stateId] = {
      image: dataUrl(png),
      hotspot: hotspotFor(theme, stateId),
      size,
    }
    const fileName = `${stateId}.png`
    zip.file(fileName, png)
    manifest.states[stateId] = { file: fileName, hotspot: hotspotFor(theme, stateId), size }
    totalStates++
  }

  zip.file('manifest.json', JSON.stringify(manifest, null, 2))
  const zipBytes = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
  const zipPath = join(packsDir, `${theme.id}.zip`)
  writeFileSync(zipPath, zipBytes)

  // schema-1 pack JSON for generate-assets.mjs to merge as a preset theme
  const pack = {
    schema: 1,
    id: theme.id,
    name: theme.name,
    description: theme.description,
    source: 'original',
    states,
  }
  writeFileSync(join(root, 'data', `themes-${theme.id}.json`), JSON.stringify(pack, null, 2))

  console.log(`theme ${theme.id} (${theme.name}): ${STATE_IDS.length} states @${size}px -> ${zipPath}`)
}

console.log(`\nwrote ${THEMES.length} theme packs (${totalStates} states total) to ${packsDir}`)
