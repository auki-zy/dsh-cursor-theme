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

// theme display order: id -> label (same order as assets.json)
const THEMES = [
  ['astro', 'Astro 太空人'], ['aurora', 'Aurora 极光'], ['candy', 'Candy 糖果'],
  ['contrast', 'Contrast 高对比'], ['emoji', 'Emoji 表情'], ['energy', 'Energy 能量'],
  ['ghost', 'Ghost 幽灵'], ['graphite', 'Graphite 石墨'], ['hivis', 'Hi-Vis XL 放大'],
  ['honey', 'Honey 蜜糖'], ['mint', 'Mint 薄荷'], ['neon', 'Neon 霓虹'],
  ['origami', 'Origami 折纸'], ['paw', 'Paw 猫爪'], ['pixel', 'Pixel 像素'],
  ['pop', 'Pop 波普'], ['sunset', 'Sunset 晚霞'], ['weather', 'Weather 天气'],
]

const STATE_IDS = [
  'default', 'pointer', 'text', 'wait', 'help', 'not-allowed', 'grab',
  'grabbing', 'progress', 'cell', 'copy', 'move', 'resize-ew', 'resize-ns',
]

const COLS = 4
const ROWS = Math.ceil((THEMES.length + 1) / COLS) // 5 (+1 personal cell)
const CELL_W = 400
const CELL_H = 190
const HEADER_H = 90
const W = COLS * CELL_W // 1600
const H = HEADER_H + ROWS * CELL_H // 1040

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

/** Escape XML text. */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** One theme cell: 4×4 grid of state icons + label. */
function themeCell(id, label, statePngs, x, y) {
  const imgs = []
  let si = 0
  for (const stateId of STATE_IDS) {
    const png = statePngs[stateId]
    if (!png) continue
    const col = si % 4
    const row = Math.floor(si / 4)
    const ix = x + 26 + col * 87
    const iy = y + 24 + row * 36
    imgs.push(`<image href="data:image/png;base64,${Buffer.from(png).toString('base64')}" x="${ix}" y="${iy}" width="32" height="32"/>`)
    si++
  }
  return `
    <g>
      <rect x="${x + 10}" y="${y + 10}" width="${CELL_W - 20}" height="${CELL_H - 20}" rx="18" fill="${CELL_BG}"/>
      <rect x="${x + 10}" y="${y + 10}" width="${CELL_W - 20}" height="${CELL_H - 20}" rx="18" fill="none" stroke="#334155" stroke-width="1.5"/>
      ${imgs.join('\n')}
      <text x="${x + CELL_W / 2}" y="${y + 172}" text-anchor="middle" font-family="sans-serif" font-size="17" font-weight="700" fill="${TEXT}">${esc(label)}</text>
    </g>`
}

/** Personal cell: fork-your-own call-to-action. */
function personalCell(x, y) {
  const pin = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="9" fill="${ACCENT}"/><path d="M${cx - 3} ${cy} L${cx + 3} ${cy} M${cx} ${cy - 3} L${cx} ${cy + 3}" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>`
  return `
    <g>
      <rect x="${x + 10}" y="${y + 10}" width="${CELL_W - 20}" height="${CELL_H - 20}" rx="18" fill="${CELL_BG}"/>
      <rect x="${x + 10}" y="${y + 10}" width="${CELL_W - 20}" height="${CELL_H - 20}" rx="18" fill="none" stroke="${ACCENT}" stroke-width="2" stroke-dasharray="6 5"/>
      ${pin(x + 120, y + 46)}${pin(x + 190, y + 78)}${pin(x + 150, y + 112)}${pin(x + 215, y + 30)}
      <text x="${x + CELL_W / 2}" y="${y + 160}" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="700" fill="${TEXT}">Personal 你的主题</text>
      <text x="${x + CELL_W / 2}" y="${y + 180}" text-anchor="middle" font-family="sans-serif" font-size="12" fill="${SUBTEXT}">Fork 后自定义，人人可维护</text>
    </g>`
}

const cells = []
for (let i = 0; i < THEMES.length; i++) {
  const [id, label] = THEMES[i]
  const col = i % COLS
  const row = Math.floor(i / COLS)
  const x = col * CELL_W
  const y = HEADER_H + row * CELL_H
  const statePngs = await loadStatePngs(id)
  cells.push(themeCell(id, label, statePngs, x, y))
}
// personal cell (bottom-left, after 18 themes → index 18)
{
  const col = THEMES.length % COLS
  const row = Math.floor(THEMES.length / COLS)
  cells.push(personalCell(col * CELL_W, HEADER_H + row * CELL_H))
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="0" y="0" width="${W}" height="${HEADER_H}" fill="#0b1220"/>
  <rect x="0" y="${HEADER_H - 2}" width="${W}" height="2" fill="${ACCENT}"/>
  <text x="40" y="42" font-family="sans-serif" font-size="34" font-weight="800" fill="${TEXT}">dsh-cursor-theme</text>
  <text x="40" y="72" font-family="sans-serif" font-size="20" fill="${SUBTEXT}">18 original themes · 14 mouse states each · fork your own</text>
  <text x="${W - 40}" y="46" text-anchor="end" font-family="sans-serif" font-size="20" font-weight="700" fill="${ACCENT}">github.com/auki-zy/dsh-cursor-theme</text>
  ${cells.join('\n')}
</svg>`

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W } })
const png = resvg.render().asPng()
const outPath = join(packsDir, 'promo-banner.png')
writeFileSync(outPath, png)
console.log(`wrote ${outPath} (${W}x${H}, ${png.length} bytes)`)
