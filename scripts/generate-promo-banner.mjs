/**
 * Generate a promotional banner image for dsh-cursor-theme.
 *
 * Each theme cell shows ALL 14 mouse-state icons (4×4 mini grid) from
 * data/theme-packs/<id>.zip, plus name labels, plus a header band. A final
 * "Personal" cell shows a fork-your-own call-to-action — you can fork the
 * repo and manage your own personal theme. Rendered with @resvg/resvg-js.
 *
 * Output: data/theme-packs/promo-banner.png (1600x1088)
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import JSZip from 'jszip'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const packsDir = join(root, 'data', 'theme-packs')

const STATE_IDS = [
  'default', 'pointer', 'text', 'wait', 'help', 'not-allowed', 'grab',
  'grabbing', 'progress', 'cell', 'copy', 'move', 'resize-ew', 'resize-ns',
]

const COLS = 4
const CELL_W = 400
const CELL_H = 190
const HEADER_H = 90
const W = COLS * CELL_W // 1600
// theme count known below (read from assets.json); ROWS derived there.
let ROWS = 5
let H = HEADER_H + ROWS * CELL_H

// dark background, rounded cells, soft grid
const BG = '#0f172a'
const CELL_BG = '#1e293b'
const ACCENT = '#5a7dff'
const TEXT = '#e2e8f0'
const SUBTEXT = '#94a3b8'

/** Load ALL state PNG bytes from a theme pack zip. */
async function loadStatePngs(id) {
  const zip = await JSZip.loadAsync(readFileSync(join(packsDir, `${id}.zip`)))
  const manifest = JSON.parse(await zip.file('manifest.json').async('string'))
  const out = {}
  for (const stateId of STATE_IDS) {
    const meta = manifest.states[stateId]
    if (meta?.file) out[stateId] = await zip.file(meta.file).async('uint8array')
  }
  return out
}

/** Load state data URLs directly from assets.json prebuilt themes (no zip). */
function loadStateDataUrls(id) {
  const { themes } = JSON.parse(readFileSync(join(root, 'data', 'assets.json'), 'utf8'))
  const theme = themes.find((t) => t.id === id)
  if (!theme?.prebuilt) return {}
  const out = {}
  for (const stateId of STATE_IDS) {
    const cfg = theme.prebuilt[stateId]
    if (cfg?.image) out[stateId] = cfg.image
  }
  return out
}

/** Escape XML text. */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** One theme cell: 4×4 grid of state icons + label. Personal themes get a
 * dashed border + badge to signal "this one is yours — custom & forked". */
function themeCell(id, label, statePngs, x, y, isPersonal) {
  const imgs = []
  let si = 0
  for (const stateId of STATE_IDS) {
    const png = statePngs[stateId]
    if (!png) continue
    const col = si % 4
    const row = Math.floor(si / 4)
    const ix = x + 26 + col * 87
    const iy = y + 24 + row * 36
    // png is either raw bytes (from zip) or an already-encoded data URL
    // (from assets.json prebuilt). Normalize to a data URL for <image>.
    const href = typeof png === 'string' && png.startsWith('data:')
      ? png
      : `data:image/png;base64,${Buffer.from(png).toString('base64')}`
    imgs.push(`<image href="${href}" x="${ix}" y="${iy}" width="32" height="32"/>`)
    si++
  }
  const border = isPersonal
    ? `stroke="${ACCENT}" stroke-width="2" stroke-dasharray="6 5"`
    : `stroke="#334155" stroke-width="1.5"`
  const badge = isPersonal
    ? `<rect x="${x + CELL_W - 74}" y="${y + 20}" width="58" height="20" rx="10" fill="${ACCENT}"/><text x="${x + CELL_W - 45}" y="${y + 34}" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#fff">Personal</text>`
    : ''
  const labelSuffix = isPersonal ? ' ⭐' : ''
  return `
    <g>
      <rect x="${x + 10}" y="${y + 10}" width="${CELL_W - 20}" height="${CELL_H - 20}" rx="18" fill="${isPersonal ? '#1c2333' : CELL_BG}"/>
      <rect x="${x + 10}" y="${y + 10}" width="${CELL_W - 20}" height="${CELL_H - 20}" rx="18" fill="none" ${border}/>
      ${badge}
      ${imgs.join('\n')}
      <text x="${x + CELL_W / 2}" y="${y + 172}" text-anchor="middle" font-family="sans-serif" font-size="17" font-weight="700" fill="${TEXT}">${esc(label)}${labelSuffix}</text>
    </g>`
}

const cells = []
// Build the theme list dynamically from assets.json; personal themes go
// LAST so they are clearly separated from the preset library.
const { themes } = JSON.parse(readFileSync(join(root, 'data', 'assets.json'), 'utf8'))
const sorted = [...themes].sort((a, b) => {
  const pa = a.source === 'personal' ? 1 : 0
  const pb = b.source === 'personal' ? 1 : 0
  return pa - pb
})
const themeList = sorted.map((t) => [t.id, t.name])
ROWS = Math.ceil(themeList.length / COLS)
H = HEADER_H + ROWS * CELL_H

for (let i = 0; i < themeList.length; i++) {
  const [id, label] = themeList[i]
  const col = i % COLS
  const row = Math.floor(i / COLS)
  const x = col * CELL_W
  const y = HEADER_H + row * CELL_H
  const isPersonal = sorted[i].source === 'personal'
  // personal themes have no zip in theme-packs; use baked data URLs
  let statePngs
  try {
    statePngs = await loadStatePngs(id)
  } catch {
    statePngs = loadStateDataUrls(id)
  }
  cells.push(themeCell(id, label, statePngs, x, y, isPersonal))
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="0" y="0" width="${W}" height="${HEADER_H}" fill="#0b1220"/>
  <rect x="0" y="${HEADER_H - 2}" width="${W}" height="2" fill="${ACCENT}"/>
  <text x="40" y="42" font-family="sans-serif" font-size="34" font-weight="800" fill="${TEXT}">dsh-cursor-theme</text>
  <text x="40" y="72" font-family="sans-serif" font-size="20" fill="${SUBTEXT}">${themeList.length} themes · 14 mouse states each · fork your own</text>
  <text x="${W - 40}" y="46" text-anchor="end" font-family="sans-serif" font-size="20" font-weight="700" fill="${ACCENT}">github.com/auki-zy/dsh-cursor-theme</text>
  ${cells.join('\n')}
</svg>`

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W } })
const png = resvg.render().asPng()
const outPath = join(packsDir, 'promo-banner.png')
writeFileSync(outPath, png)
console.log(`wrote ${outPath} (${W}x${H}, ${png.length} bytes)`)
