/**
 * dsh-cursor-theme pack generator: original themes from hand-authored SVGs.
 *
 * Renders every functional state template (src/client/svg-assets.ts) with a
 * set of ORIGINAL palettes into 32×32 PNGs, then:
 *   1. writes a shareable image pack ZIP per theme
 *      (data/theme-packs/<id>.zip: one PNG per state + manifest.json, the
 *      exact format the 图片包 import/export uses), and
 *   2. writes a schema-1 pack JSON (data/themes-<id>.json) that
 *      generate-assets.mjs merges into data/assets.json as a built-in
 *      preset theme (baked PNG data URLs — instant apply, no render).
 *
 * All art is original (own SVGs + palettes), so no third-party license
 * (MIT/etc.) management is needed.
 *
 * Usage: node scripts/generate-theme-packs.mjs
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSync } from 'esbuild'
import { Resvg } from '@resvg/resvg-js'
import JSZip from 'jszip'

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

/** Which functional shape template renders each state. */
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

// ---- original palettes (no third-party assets involved) ----
const THEMES = [
  { id: 'aurora', name: '极光 Aurora', description: '蓝紫渐变 · 原创配色', palette: { primary: '#5a7dff', accent: '#8b5cf6', dark: '#1b2a4a' } },
  { id: 'honey', name: '蜜糖 Honey', description: '暖橙蜂蜜色 · 原创配色', palette: { primary: '#ff9f43', accent: '#feca57', dark: '#7a4a12' } },
  { id: 'mint', name: '薄荷 Mint', description: '青绿清新 · 原创配色', palette: { primary: '#1dd1a1', accent: '#7bed9f', dark: '#0a4d3c' } },
  { id: 'sunset', name: '晚霞 Sunset', description: '粉紫晚霞 · 原创配色', palette: { primary: '#ff6b6b', accent: '#f368e0', dark: '#6b1f5e' } },
  { id: 'graphite', name: '石墨 Graphite', description: '中性深灰 · 原创配色', palette: { primary: '#57606f', accent: '#a4b0be', dark: '#2f3542' } },
  { id: 'contrast', name: '高对比 High Contrast', description: '黑白高对比 · 无障碍友好', palette: { primary: '#ffffff', accent: '#e8e8e8', dark: '#000000' } },
]

/** Substitute a palette into a template's SVG. */
function applyPalette(svg, palette) {
  return svg
    .replaceAll('{primary}', palette.primary)
    .replaceAll('{accent}', palette.accent)
    .replaceAll('{dark}', palette.dark)
}

/** Render an SVG string to a 32×32 PNG (bytes). */
function renderPng(svg) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 32 } })
  return resvg.render().asPng()
}

function dataUrl(bytes) {
  return `data:image/png;base64,${Buffer.from(bytes).toString('base64')}`
}

const packsDir = join(root, 'data', 'theme-packs')
rmSync(packsDir, { recursive: true, force: true })
mkdirSync(packsDir, { recursive: true })

let totalStates = 0
for (const theme of THEMES) {
  const states = {}
  const zip = new JSZip()
  const manifest = {
    schema: 1,
    name: theme.name,
    version: '1.0.0',
    enabled: true,
    defaultSize: 32,
    states: {},
  }

  for (const stateId of STATE_IDS) {
    const templateId = SHAPE_BY_STATE[stateId]
    const tpl = TEMPLATE_BY_ID.get(templateId)
    if (!tpl) throw new Error(`missing template ${templateId} for state ${stateId}`)
    const png = renderPng(applyPalette(tpl.svg, theme.palette))
    if (!png || png.length === 0) throw new Error(`render failed for ${theme.id}/${stateId}`)

    states[stateId] = {
      image: dataUrl(png),
      hotspot: tpl.hotspot,
      size: tpl.size,
    }
    const fileName = `${stateId}.png`
    zip.file(fileName, png)
    manifest.states[stateId] = { file: fileName, hotspot: tpl.hotspot, size: tpl.size }
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

  console.log(`theme ${theme.id} (${theme.name}): ${STATE_IDS.length} states -> ${zipPath}`)
}

console.log(`\nwrote ${THEMES.length} theme packs (${totalStates} states total) to ${packsDir}`)
